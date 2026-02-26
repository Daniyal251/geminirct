// ============================================================
// hub/js/auth.js — Authentication: password, Telegram, session
// ES Module: import from config.js + data.js
//
// NOTE (bridge pattern): UI helpers (toast, showLoginErr, etc.)
// reference window.xxx — still live in index.html for now.
// ============================================================

import { SB, CONFIG } from './config.js';
import { normalizeRole, USER, setUser } from './data.js';

// ---- Staff cache (for login, doesn't need full DATA) ----
export let _staffCache = [];

export async function loadStaffCache() {
  if (!SB) { console.warn('No Supabase connection'); return; }
  try {
    const { data, error } = await SB.from('staff').select('*');
    if (error) throw error;
    const { mapFromDb } = await import('./config.js');
    _staffCache = (data || []).map(s => mapFromDb('staff', [s])[0]).filter(Boolean);
  } catch(e) {
    console.error('loadStaffCache:', e);
  }
}

// ---- Brute-force protection (sessionStorage) ----
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

export function checkLoginRate(identifier) {
  const key = 'rkt_login_' + identifier.toLowerCase();
  const now = Date.now();
  let state = {};
  try { state = JSON.parse(sessionStorage.getItem(key) || '{}'); } catch(e) {}

  if (state.blockedUntil && now < state.blockedUntil) {
    return { blocked: true, sec: Math.ceil((state.blockedUntil - now) / 1000) };
  }
  if (state.blockedUntil && now >= state.blockedUntil) {
    state = {};
  }
  if (state.first && now - state.first > LOCKOUT_MS) {
    state = {};
  }

  state.count = (state.count || 0) + 1;
  if (!state.first) state.first = now;

  if (state.count >= MAX_LOGIN_ATTEMPTS) {
    state.blockedUntil = now + LOCKOUT_MS;
    sessionStorage.setItem(key, JSON.stringify(state));
    return { blocked: true, sec: Math.ceil(LOCKOUT_MS / 1000), fresh: true };
  }

  sessionStorage.setItem(key, JSON.stringify(state));
  return { blocked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS - state.count };
}

export function resetLoginRate(identifier) {
  sessionStorage.removeItem('rkt_login_' + identifier.toLowerCase());
}

// ---- Password hashing ----
export async function hashPassword(pass) {
  const data = new TextEncoder().encode(pass + '_rkt_hub_2026');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---- Find staff by identifier (phone / @tag / email / name) ----
export function findStaffByInput(input) {
  if (!input) return null;
  const q = input.trim();
  const allStaff = _staffCache;

  if (q.startsWith('@')) {
    const uname = q.slice(1).toLowerCase();
    return allStaff.find(s => (s['Username'] || '').toLowerCase().replace('@', '') === uname);
  }
  if (/^\+?\d[\d\s\-()]{6,}$/.test(q)) {
    const clean = q.replace(/[\s\-()]/g, '');
    return allStaff.find(s => {
      const sp = (s['Телефон'] || '').replace(/[\s\-()]/g, '');
      return sp && (sp === clean || sp.endsWith(clean.slice(-10)) || clean.endsWith(sp.slice(-10)));
    });
  }
  if (q.includes('@') && q.includes('.')) {
    return allStaff.find(s => (s['Email'] || '').toLowerCase() === q.toLowerCase());
  }
  if (/^\d+$/.test(q)) {
    return allStaff.find(s => String(s.Telegram_ID || '').trim() === q);
  }
  const lower = q.toLowerCase();
  return allStaff.find(s => (s['Имя'] || '').toLowerCase() === lower) ||
         allStaff.find(s => (s['Имя'] || '').toLowerCase().includes(lower));
}

// ---- Password login ----
export async function doPasswordLogin() {
  const id = document.getElementById('loginId').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  errEl.style.display = 'none';

  if (!SB) { showLoginErr('⚠️ Нет подключения к базе данных. Проверьте интернет и обновите страницу.'); return; }
  if (!id) { showLoginErr('Введите телефон, @тег или email'); return; }

  const _rate = checkLoginRate(id.toLowerCase());
  if (_rate.blocked) {
    const waitMin = Math.ceil(_rate.sec / 60);
    const waitMsg = _rate.sec > 90 ? waitMin + ' мин.' : _rate.sec + ' сек.';
    showLoginErr('🔒 Слишком много попыток. Подождите ' + waitMsg);
    return;
  }
  if (!pass) { showLoginErr('Введите пароль'); return; }

  document.getElementById('loginBtnText').textContent = '⏳ Вход...';

  try {
    if (!_staffCache.length) await loadStaffCache();

    const staff = findStaffByInput(id);
    if (!staff) {
      showLoginErr('Пользователь не найден. Проверьте данные или зарегистрируйтесь.');
      document.getElementById('loginBtnText').textContent = 'Войти';
      return;
    }

    const staffStatus = (staff['Статус'] || staff.status || 'Активный').trim();
    if (staffStatus === 'Ожидает') {
      showLoginErr('⏳ Ваша заявка ещё на рассмотрении. Дождитесь одобрения руководителем.');
      document.getElementById('loginBtnText').textContent = 'Войти';
      return;
    }
    if (staffStatus === 'Отключён' || staffStatus === '❌ Удалён') {
      showLoginErr('🚫 Ваш аккаунт заблокирован. Обратитесь к руководству.');
      document.getElementById('loginBtnText').textContent = 'Войти';
      return;
    }

    const hash = await hashPassword(pass);
    if (!staff['pin_hash']) {
      try {
        await SB.from('staff').update({ pin_hash: hash }).eq('id', staff.ID || staff.id);
        staff['pin_hash'] = hash;
        const cached = _staffCache.find(s => (s.ID || s.id) === (staff.ID || staff.id));
        if (cached) cached['pin_hash'] = hash;
        showLoginErr('✅ Пароль установлен! Входим...', 'var(--green)');
        resetLoginRate(id);
        setTimeout(() => completeLogin(staff), 500);
        return;
      } catch(e2) {
        console.warn('Cannot set password, pin_hash column may not exist:', e2);
        resetLoginRate(id);
        completeLogin(staff);
        return;
      }
    }

    if (hash !== staff['pin_hash']) {
      showLoginErr('Неверный пароль');
      document.getElementById('loginBtnText').textContent = 'Войти';
      return;
    }

    resetLoginRate(id);
    completeLogin(staff);

  } catch(e) {
    console.error('Login error:', e);
    showLoginErr('⚠️ Ошибка подключения: ' + e.message);
    document.getElementById('loginBtnText').textContent = 'Войти';
  }
}

// ---- Password registration ----
export async function doPasswordRegister() {
  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const username = document.getElementById('regUsername').value.trim().replace(/^@/, '');
  const project = document.getElementById('regProject').value;
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const errEl = document.getElementById('regError');
  errEl.style.display = 'none';
  errEl.style.color = '';

  if (!SB) { errEl.textContent = '⚠️ Нет подключения к базе. Обновите страницу.'; errEl.style.display = 'block'; return; }
  if (!name) { errEl.textContent = 'Укажите ФИО'; errEl.style.display = 'block'; return; }
  if (!phone) { errEl.textContent = 'Укажите телефон'; errEl.style.display = 'block'; return; }
  if (!project) { errEl.textContent = 'Выберите проект'; errEl.style.display = 'block'; return; }
  if (!pass || pass.length < 4) { errEl.textContent = 'Пароль минимум 4 символа'; errEl.style.display = 'block'; return; }
  if (pass !== pass2) { errEl.textContent = 'Пароли не совпадают'; errEl.style.display = 'block'; return; }
  if (!document.getElementById('regConsent')?.checked) { errEl.textContent = '❌ Необходимо согласие на обработку персональных данных'; errEl.style.display = 'block'; return; }

  document.getElementById('regBtnText').textContent = '⏳ Регистрация...';

  try {
    if (!_staffCache.length) await loadStaffCache();

    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    const dup = _staffCache.find(s => {
      const sp = (s['Телефон'] || '').replace(/[\s\-()]/g, '');
      return (sp && cleanPhone && (sp === cleanPhone || sp.endsWith(cleanPhone.slice(-10)) || cleanPhone.endsWith(sp.slice(-10)))) ||
             (username && (s['Username'] || '').toLowerCase().replace('@', '') === username.toLowerCase());
    });
    if (dup) {
      errEl.textContent = 'Пользователь с таким ' + (username && (dup['Username'] || '').toLowerCase().replace('@', '') === username.toLowerCase() ? 'тегом' : 'телефоном') + ' уже есть. Перейдите во вкладку Вход.';
      errEl.style.display = 'block';
      document.getElementById('regBtnText').textContent = 'Зарегистрироваться';
      return;
    }

    const passHash = await hashPassword(pass);
    const newId = 'S' + Date.now().toString(36).toUpperCase();

    const baseRow = {
      id: newId, name, role: 'Сотрудник', project,
      direction: null, telegram_id: null, username: username || null, email: null,
      phone, status: 'Ожидает'
    };

    let result = await SB.from('staff').insert({ ...baseRow, pin_hash: passHash });
    if (result.error) {
      console.warn('Insert attempt 1 failed:', result.error.message, '— retrying without pin_hash');
      result = await SB.from('staff').insert(baseRow);
    }

    if (result.error) {
      console.error('Registration insert error:', result.error);
      errEl.textContent = '❌ ' + (result.error.message || 'Ошибка базы данных');
      errEl.style.display = 'block';
      document.getElementById('regBtnText').textContent = 'Зарегистрироваться';
      return;
    }

    try {
      if (window.selfRegister) await window.selfRegister({ staffId: newId, name, phone, username, email: '', role: 'Менеджер', project, telegram_id: '' });
    } catch(e2) { console.warn('Approval request failed:', e2); }

    errEl.style.display = 'block';
    errEl.style.color = 'var(--green)';
    errEl.textContent = '✅ Заявка отправлена! Дождитесь одобрения руководителем.';
    document.getElementById('regBtnText').textContent = 'Зарегистрироваться';
    setTimeout(() => showAuthTab('login'), 3000);

  } catch(e) {
    console.error('Register error:', e);
    errEl.textContent = '❌ ' + (e.message || 'Неизвестная ошибка');
    errEl.style.display = 'block';
    document.getElementById('regBtnText').textContent = 'Зарегистрироваться';
  }
}

// ---- Telegram login ----
export function doTelegramLogin() {
  const botName = CONFIG.TG_BOT || 'AIhroject_bot';
  const container = document.getElementById('authLogin').style.display !== 'none'
    ? document.getElementById('authLogin')
    : document.getElementById('authRegister');

  const prevHTML = container.innerHTML;
  container.innerHTML = `
    <div style="text-align:center">
      <div style="font-size:48px;margin-bottom:12px">💬</div>
      <div style="font-size:15px;font-weight:600;margin-bottom:8px">Вход через Telegram</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:16px;line-height:1.5">
        1. Откройте бота <b>@${botName}</b><br>
        2. Отправьте команду <code>/login</code><br>
        3. Бот пришлёт код — введите его ниже
      </div>
      <a href="https://t.me/${botName}?start=login" target="_blank" class="tg-login-btn" style="margin-bottom:14px;text-decoration:none">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-1.97 9.28c-.15.67-.54.83-1.09.52l-3.02-2.23-1.45 1.4c-.16.16-.3.3-.61.3l.22-3.05 5.55-5.02c.24-.22-.05-.33-.37-.13l-6.87 4.33-2.96-.92c-.64-.2-.66-.64.13-.95l11.57-4.46c.54-.2 1.01.13.83.93z"/></svg>
        Открыть @${botName}
      </a>
      <input class="login-input" id="tgCodeInput" type="text" placeholder="6-значный код из бота" style="text-align:center;font-size:18px;letter-spacing:6px" maxlength="6" onkeydown="if(event.key==='Enter')verifyTgCode()">
      <button class="login-btn" style="margin-top:10px" onclick="verifyTgCode()">
        <span id="tgVerifyBtnText">Подтвердить</span>
      </button>
      <div class="login-error" id="tgError"></div>
      <div style="margin-top:14px">
        <a href="#" onclick="cancelTgLogin();return false" style="color:var(--text3);font-size:12px">← Вернуться к обычному входу</a>
      </div>
    </div>
  `;
  container._prevHTML = prevHTML;
}

export function cancelTgLogin() {
  const loginDiv = document.getElementById('authLogin');
  const regDiv = document.getElementById('authRegister');
  if (loginDiv._prevHTML) { loginDiv.innerHTML = loginDiv._prevHTML; delete loginDiv._prevHTML; }
  if (regDiv._prevHTML) { regDiv.innerHTML = regDiv._prevHTML; delete regDiv._prevHTML; }
  if (!loginDiv.innerHTML.includes('loginId')) location.reload();
}

export async function verifyTgCode() {
  const code = (document.getElementById('tgCodeInput')?.value || '').trim();
  const errEl = document.getElementById('tgError');
  if (!code) { errEl.textContent = 'Введите 6-значный код из бота'; errEl.style.display = 'block'; return; }

  document.getElementById('tgVerifyBtnText').textContent = '⏳ Проверка...';
  errEl.style.display = 'none';

  try {
    if (!_staffCache.length) await loadStaffCache();

    let staff = null;

    // 1) Try as auth token from tg_auth_tokens
    try {
      const { data } = await SB.from('tg_auth_tokens').select('*').eq('token', code).single();
      if (data) {
        const created = new Date(data.created_at).getTime();
        if (Date.now() - created > 5 * 60 * 1000) {
          await SB.from('tg_auth_tokens').delete().eq('token', code).catch(() => {});
          errEl.textContent = '❌ Код истёк. Отправьте /login в боте заново.';
          errEl.style.display = 'block';
          document.getElementById('tgVerifyBtnText').textContent = 'Подтвердить';
          return;
        }
        if (data.staff_id) {
          staff = _staffCache.find(s => (s.ID || s.id) === data.staff_id);
        } else if (data.telegram_id) {
          staff = _staffCache.find(s => String(s.Telegram_ID || s.telegram_id || '').trim() === String(data.telegram_id));
        }
        await SB.from('tg_auth_tokens').delete().eq('token', code).catch(() => {});
      }
    } catch(e) { /* table may not exist */ }

    // 2) Fallback: try as Telegram ID (numeric)
    if (!staff && /^\d{5,}$/.test(code)) {
      staff = _staffCache.find(s => String(s.Telegram_ID || s.telegram_id || '').trim() === code);
    }

    // 3) Try as @username
    if (!staff && code.startsWith('@')) {
      const uname = code.slice(1).toLowerCase();
      staff = _staffCache.find(s => (s['Username'] || s.username || '').toLowerCase().replace('@', '') === uname);
    }

    if (staff) {
      errEl.style.color = 'var(--green)';
      errEl.textContent = '✅ Найден: ' + (staff['Имя'] || staff.name || '') + '. Входим...';
      errEl.style.display = 'block';
      setTimeout(() => { cancelTgLogin(); completeLogin(staff); }, 600);
    } else {
      errEl.textContent = '❌ Код не найден или истёк. Отправьте /login в боте.';
      errEl.style.display = 'block';
      document.getElementById('tgVerifyBtnText').textContent = 'Подтвердить';
    }
  } catch(e) {
    errEl.textContent = '❌ Ошибка: ' + e.message;
    errEl.style.display = 'block';
    document.getElementById('tgVerifyBtnText').textContent = 'Подтвердить';
  }
}

// ---- Forgot password ----
export async function doForgotPass() {
  const id = document.getElementById('forgotId').value.trim();
  const errEl = document.getElementById('forgotError');
  errEl.style.display = 'none';

  if (!id) { errEl.textContent = 'Введите телефон или @тег'; errEl.style.display = 'block'; return; }
  document.getElementById('forgotBtnText').textContent = '⏳ Отправка...';

  try {
    if (!_staffCache.length) await loadStaffCache();
    const staff = findStaffByInput(id);

    if (!staff) {
      errEl.textContent = 'Пользователь не найден';
      errEl.style.display = 'block';
      document.getElementById('forgotBtnText').textContent = 'Сбросить пароль';
      return;
    }

    const tempPass = Math.random().toString(36).slice(2, 8).toUpperCase();
    const hash = await hashPassword(tempPass);
    await SB.from('staff').update({ pin_hash: hash }).eq('id', staff.ID || staff.id);

    const tgId = staff.Telegram_ID || staff['Telegram_ID'] || staff.telegram_id;
    if (tgId) {
      try {
        if (window.sendTelegramNotification) {
          await window.sendTelegramNotification(tgId, '🔑 Ваш новый пароль для RKT HUB:\n\n`' + tempPass + '`\n\nСмените его после входа в разделе Профиль.');
        }
        errEl.style.color = 'var(--green)';
        errEl.textContent = '✅ Новый пароль отправлен в Telegram!';
      } catch(e) {
        errEl.style.color = 'var(--orange)';
        errEl.textContent = '⚠️ Не удалось отправить в TG. Новый пароль: ' + tempPass;
      }
    } else {
      errEl.style.color = 'var(--orange)';
      errEl.textContent = '⚠️ Telegram не привязан. Новый пароль: ' + tempPass;
    }
    errEl.style.display = 'block';
    document.getElementById('forgotBtnText').textContent = 'Сбросить пароль';

  } catch(e) {
    errEl.textContent = '❌ Ошибка: ' + e.message;
    errEl.style.display = 'block';
    document.getElementById('forgotBtnText').textContent = 'Сбросить пароль';
  }
}

// ---- Complete login ----
export function completeLogin(staff) {
  const staffProject = (staff['Проект'] || staff.project || '').trim();
  const staffDirection = (staff['Направление'] || staff.direction || '').trim();
  const user = {
    id: staff.ID || staff.id || '',
    tgId: String(staff.Telegram_ID || staff.telegram_id || '').trim(),
    name: (staff['Имя'] || staff.name || 'Сотрудник').trim(),
    role: normalizeRole(staff['Роль'] || staff.role || 'Сотрудник'),
    originalRole: (staff['Роль'] || staff.role || '').trim(),
    direction: staffDirection || 'Все',
    project: staffProject,
    email: (staff['Email'] || staff.email || '').trim(),
    phone: (staff['Телефон'] || staff.phone || '').trim(),
    username: (staff['Username'] || staff.username || '').trim()
  };
  setUser(user);
  console.log('[RKT] completeLogin:', user.name, '| role:', user.role, '| project:', user.project);
  localStorage.setItem('rkt_user', JSON.stringify(user));
  if (window.showApp) window.showApp();
}

// ---- Logout ----
export function doLogout() {
  setUser(null);
  localStorage.removeItem('rkt_user');
  if (window.refreshTimer) clearInterval(window.refreshTimer);
  if (window._tgPollInterval) clearInterval(window._tgPollInterval);
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  showAuthTab('login');
  document.getElementById('loginId').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').style.display = 'none';
}

// ---- Check saved login on page load ----
export function checkSavedLogin() {
  if (window.loadSavedSettings) window.loadSavedSettings();
  if (window.loadNotifications) window.loadNotifications();
  if (window.initMobileMenu) window.initMobileMenu();
  const s = localStorage.getItem('rkt_user');
  if (s) {
    try {
      const u = JSON.parse(s);
      if (u && (u.tgId || u.phone || u.name)) {
        u.role = normalizeRole(u.role);
        setUser(u);
        if (window.showApp) window.showApp();
        return;
      }
    } catch(e) {}
    localStorage.removeItem('rkt_user');
  }
  loadStaffCache();
}

// ---- UI helpers ----
export function showLoginErr(m, color) {
  const e = document.getElementById('loginError');
  e.textContent = m;
  e.style.display = 'block';
  e.style.color = color || '';
}

export function showAuthTab(tab) {
  document.getElementById('authLogin').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('authRegister').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('authForgot').style.display = tab === 'forgot' ? 'block' : 'none';
  document.getElementById('authIntake').style.display = tab === 'intake' ? 'block' : 'none';
  document.getElementById('authTabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('authTabReg').classList.toggle('active', tab === 'register');
  document.getElementById('authTabIntake')?.classList.toggle('active', tab === 'intake');
  ['loginError', 'regError', 'forgotError', 'intakeError'].forEach(id => {
    const e = document.getElementById(id);
    if (e) { e.style.display = 'none'; e.style.color = ''; }
  });
  if (tab === 'intake') {
    const s = document.getElementById('intakeSuccess');
    if (s) s.style.display = 'none';
    const f = document.getElementById('intakeFormFields');
    if (f) f.style.display = 'grid';
    const b = document.getElementById('intakeBtn');
    if (b) b.style.display = '';
    if (window.populateIntakeTypes) window.populateIntakeTypes();
  }
  if (tab === 'login') document.getElementById('loginId')?.focus();
  if (tab === 'register') document.getElementById('regName')?.focus();
  if (tab === 'forgot') document.getElementById('forgotId')?.focus();
  if (tab === 'intake') document.getElementById('intakeName')?.focus();
}
