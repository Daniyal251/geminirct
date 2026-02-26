// ============================================================
// hub/js/ai-chat.js — AI Chat: cascade AI, task chat,
//   global AI panel, CRM AI actions (aiSummary, aiNextStep)
// ES Module: export all public symbols
//
// Bridge: DATA, USER, CONFIG, PROJECTS, ROLES,
//   currentTaskId, currentProject, currentSubproject,
//   SB, toast, esc, escA, today,
//   sendTelegramNotification, getDirectionOptions,
//   showCustomModal — referenced via window.xxx
// ============================================================

// ── Module-level state ────────────────────────────────────────
export let _aiActiveRequests = { groq: 0, gemini: 0 };

export let globalAiMessages = JSON.parse(
  localStorage.getItem('rkt_ai_history') || '[]'
);
export let aiPanelOpen = false;

// ── History persistence ───────────────────────────────────────

export function saveAiHistory() {
  try {
    localStorage.setItem('rkt_ai_history',
      JSON.stringify(globalAiMessages.slice(-30)));
  } catch(e) {}
}

export function restoreAiHistory() {
  const container = document.getElementById('ai-global-messages');
  if (!container || !globalAiMessages.length) return;
  globalAiMessages.forEach(m => {
    const div = document.createElement('div');
    div.className = 'ai-msg ' + (m.role === 'user' ? 'user' : 'assistant');
    div.innerHTML = (m.content||'')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

// ── Global AI panel toggle ────────────────────────────────────

export function toggleAiPanel() {
  const panel = document.getElementById('aiGlobalPanel');
  const fab   = document.getElementById('aiFab');
  aiPanelOpen = !aiPanelOpen;
  if (aiPanelOpen) {
    panel.style.display = 'flex';
    fab.style.display   = 'none';
    const container = document.getElementById('ai-global-messages');
    if (container && container.children.length <= 1) restoreAiHistory();
    setTimeout(() => document.getElementById('ai-global-input').focus(), 100);
  } else {
    panel.style.display = 'none';
    fab.style.display   = 'flex';
  }
}

// ── Cascade AI providers ──────────────────────────────────────

export async function sendGroqChat(messages, systemPrompt) {
  const CONFIG = window.CONFIG || {};
  if (!CONFIG.GROQ_KEY) return null;
  _aiActiveRequests.groq++;
  try {
    const msgs = [];
    if (systemPrompt) msgs.push({ role: 'system', content: systemPrompt });
    messages.forEach(m => msgs.push({
      role: m.role || 'user',
      content: m.content || m.text || String(m)
    }));

    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 30000);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + CONFIG.GROQ_KEY
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: msgs,
        max_tokens: 4096,
        temperature: 0.7
      }),
      signal: ctrl.signal
    });

    if (res.status === 429) { console.warn('Groq rate limited'); return null; }
    if (!res.ok) {
      const res2 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + CONFIG.GROQ_KEY
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: msgs,
          max_tokens: 4096,
          temperature: 0.7
        })
      });
      if (!res2.ok) return null;
      const data2 = await res2.json();
      return { text: data2.choices?.[0]?.message?.content || '', provider: 'groq' };
    }

    const data = await res.json();
    return { text: data.choices?.[0]?.message?.content || '', provider: 'groq' };
  } catch(e) {
    console.warn('Groq error:', e.message);
    return null;
  } finally {
    _aiActiveRequests.groq--;
  }
}

export async function sendGeminiChat(messages, systemPrompt) {
  const CONFIG = window.CONFIG || {};
  if (!CONFIG.GEMINI_KEY) return null;
  _aiActiveRequests.gemini++;
  try {
    const contents = [];
    messages.forEach(m => {
      const role = (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user';
      contents.push({ role, parts: [{ text: m.content || m.text || String(m) }] });
    });

    const body = {
      contents,
      generationConfig: { maxOutputTokens: 4096, temperature: 0.7 }
    };
    if (systemPrompt) {
      body.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 30000);

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + CONFIG.GEMINI_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal
      }
    );

    if (res.status === 429) { console.warn('Gemini rate limited'); return null; }
    if (!res.ok) return null;

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { text, provider: 'gemini' };
  } catch(e) {
    console.warn('Gemini error:', e.message);
    return null;
  } finally {
    _aiActiveRequests.gemini--;
  }
}

export async function sendCascadeChat(messages, systemPrompt) {
  const CONFIG = window.CONFIG || {};
  // 1. Try Groq first (most generous free tier)
  if (CONFIG.GROQ_KEY && _aiActiveRequests.groq < 25) {
    const result = await sendGroqChat(messages, systemPrompt);
    if (result) return result;
  }

  // 2. Try Gemini as backup
  if (CONFIG.GEMINI_KEY && _aiActiveRequests.gemini < 8) {
    const result = await sendGeminiChat(messages, systemPrompt);
    if (result) return result;
  }

  // 3. Fallback to Claude via n8n — caller handles
  return null;
}

export function getAiProviderBadge(provider) {
  const badges = {
    groq:   '<span style="display:inline-block;font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(255,165,0,.15);color:#f90;margin-top:4px">⚡ Groq</span>',
    gemini: '<span style="display:inline-block;font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(66,133,244,.15);color:#48f;margin-top:4px">✨ Gemini</span>',
    claude: '<span style="display:inline-block;font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(204,120,50,.15);color:#c84;margin-top:4px">🤖 Claude</span>'
  };
  return badges[provider] || '';
}

// ── Task AI chat ──────────────────────────────────────────────

export async function sendAiMessage() {
  const DATA        = window.DATA        || {};
  const currentTaskId = window.currentTaskId || null;

  const input = document.getElementById('ai-input');
  const msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  addAiMessage('user', msg);

  const task = DATA.tasks.find(t => t.ID === currentTaskId);
  const context = task
    ? 'Задача: ' + (task['Описание'] || task['Название'])
      + '. Направление: ' + (task['Направление'] || '')
      + '. Статус: '      + (task['Статус']      || '')
      + '. Приоритет: '   + (task['Приоритет']   || '')
      + '. Дедлайн: '     + (task['Дедлайн']     || 'не указан')
      + '. Ответственный: '+ (task['Ответственный'] || 'не указан')
      + '. Проект: '      + (task['Проект']      || '')
      + '. Комментарий: ' + (task['Комментарий'] || '')
    : '';

  await callAI(msg, context);
}

export function aiQuickAction(type) {
  const DATA          = window.DATA        || {};
  const currentTaskId = window.currentTaskId || null;

  const task = DATA.tasks.find(t => t.ID === currentTaskId);
  if (!task) return;
  const name = task['Описание'] || task['Название'];

  const prompts = {
    plan:      'Составь пошаговый план выполнения задачи «' + name + '». Дай конкретные шаги с оценкой времени.',
    risks:     'Какие основные риски при выполнении задачи «' + name + '»? Как их минимизировать?',
    email:     'Напиши деловое письмо партнёру по задаче «' + name + '». Тон — профессиональный.',
    checklist: 'Создай подробный чеклист для задачи «' + name + '» — что нужно проверить перед завершением.',
    next:      'Какие следующие шаги после выполнения задачи «' + name + '»? Что нужно сделать далее.'
  };

  const msg = prompts[type] || 'Помоги с задачей «' + name + '»';
  addAiMessage('user', msg);

  const context = 'Задача: ' + name
    + '. Направление: ' + (task['Направление'] || '')
    + '. Статус: '      + (task['Статус']      || '')
    + '. Приоритет: '   + (task['Приоритет']   || '')
    + '. Дедлайн: '     + (task['Дедлайн']     || 'не указан')
    + '. Ответственный: '+ (task['Ответственный'] || 'не указан') + '.';
  callAI(msg, context);
}

export function aiGenerateSteps() {
  aiQuickAction('plan');
}

export async function callAI(userMsg, context) {
  const CONFIG = window.CONFIG || {};
  const USER   = window.USER   || null;

  const container = document.getElementById('ai-messages');
  const loadingId = 'ai-loading-' + Date.now();
  container.innerHTML += '<div class="ai-msg assistant" id="' + loadingId + '"><div class="ai-loading"><span></span><span></span><span></span></div></div>';
  container.scrollTop = container.scrollHeight;

  const sendBtn = document.getElementById('ai-send-btn');
  if (sendBtn) sendBtn.disabled = true;

  const aiMessages = window.aiMessages || [];

  let aiResponse = '';
  let aiProvider  = 'claude';
  try {
    const systemPrompt = 'Ты ассистент CRM-системы RKT HUB. Помогай сотрудникам с задачами по проекту. Контекст: '
      + (context || 'общий чат') + '. Пользователь: ' + (USER ? USER.name : 'Аноним')
      + '. Отвечай на русском, кратко и по делу.\n\n'
      + 'ВАЖНО: Ты только отвечаешь на вопросы и даёшь советы. Ты НЕ можешь менять данные в системе (задачи, ответственных, стадии). '
      + 'Не утверждай что выполнил действие если не выполнял. '
      + 'Разделы HUB: Проекты, Дашборд, Партнёры, Задачи, Коммуникации, Сотрудники, Согласования, Настройки. '
      + 'В системе НЕТ: доменов, биллинга, email-рассылок, хостинга, DNS. '
      + 'Если спрашивают о функции которой нет — скажи что её пока нет в RKT HUB.';

    const msgs = aiMessages.filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));
    msgs.push({ role: 'user', content: userMsg });

    const cascadeResult = await sendCascadeChat(msgs, systemPrompt);
    if (cascadeResult && cascadeResult.text) {
      aiResponse = cascadeResult.text;
      aiProvider  = cascadeResult.provider;
    } else {
      // Fallback to Claude via n8n
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(CONFIG.AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: context,
          source:  'web',
          history: aiMessages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-20),
          user:    USER ? USER['Имя'] : ''
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        const raw3 = await response.json();
        let data3 = raw3;
        if (Array.isArray(raw3)) data3 = raw3[0] || {};
        if (data3.json) data3 = data3.json;
        aiResponse = data3.reply || data3.response || data3.text || data3.message || '';
        if (!aiResponse && data3.content) {
          try { aiResponse = data3.content[0].text; } catch(e) {}
        }
      }
      aiProvider = 'claude';
    }
    if (!aiResponse) throw new Error('Empty response');
  } catch(e) {
    console.warn('Task AI fallback:', e.message);
    aiResponse = generateLocalAIResponse(userMsg, context);
    aiProvider  = 'local';
  }

  const loadEl = document.getElementById(loadingId);
  if (loadEl) loadEl.remove();
  addAiMessage('assistant', aiResponse + '\n' + getAiProviderBadge(aiProvider));
  if (sendBtn) sendBtn.disabled = false;
}

export function generateLocalAIResponse(msg, context) {
  const USER  = window.USER || null;
  const lower = msg.toLowerCase();

  if (lower.includes('план') || lower.includes('шаг')) {
    return '📋 **План выполнения:**\n\n1. Анализ текущего состояния и требований\n2. Подготовка необходимых документов и материалов\n3. Согласование с ответственными лицами\n4. Выполнение основной работы\n5. Проверка результатов и тестирование\n6. Финальное согласование и закрытие задачи\n\n⏱ Рекомендуемый срок: разбейте на этапы по 1-2 дня каждый.\n\n💡 Совет: начните с пункта 1 сегодня, чтобы не откладывать.';
  }
  if (lower.includes('риск')) {
    return '⚠️ **Возможные риски:**\n\n1. Задержка от партнёров/подрядчиков\n2. Нехватка ресурсов или бюджета\n3. Изменение требований в процессе\n4. Технические сложности\n\n🛡 **Митигация:**\n- Заложите буфер по срокам (15-20%)\n- Подготовьте план Б для критических этапов\n- Регулярно сверяйтесь с заказчиком';
  }
  if (lower.includes('письм') || lower.includes('email')) {
    return '📧 **Шаблон письма:**\n\nУважаемый [Имя],\n\nВ рамках нашего сотрудничества хотел бы обсудить текущий статус по задаче.\n\nНа данный момент мы находимся на этапе [этап]. Для продвижения нам необходимо [действие].\n\nПредлагаю назначить встречу/звонок для обсуждения деталей.\n\nС уважением,\n' + (USER ? USER.name : '[Ваше имя]');
  }
  if (lower.includes('чеклист') || lower.includes('проверк')) {
    return '✅ **Чеклист:**\n\n☐ Все документы подготовлены\n☐ Согласование с руководством получено\n☐ Бюджет утверждён\n☐ Сроки реалистичны\n☐ Ответственные назначены\n☐ Риски учтены\n☐ Результат соответствует ТЗ\n☐ Обратная связь получена';
  }
  if (lower.includes('следующ') || lower.includes('далее') || lower.includes('next')) {
    return '➡️ **Следующие шаги:**\n\n1. Зафиксировать результаты текущей задачи\n2. Уведомить заинтересованных лиц о завершении\n3. Обновить статус в системе\n4. Провести ретроспективу (что пошло хорошо / что улучшить)\n5. Перейти к следующей задаче по приоритету';
  }
  return '🤖 Я проанализировал задачу. Вот что могу сказать:\n\n' + context + '\n\nЧтобы я дал более точный ответ, уточните что именно вас интересует — план выполнения, риски, коммуникации или другой аспект.';
}

export function addAiMessage(role, text) {
  const aiMessages = window.aiMessages;
  if (Array.isArray(aiMessages)) aiMessages.push({ role, content: text });

  const container = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = 'ai-msg ' + role;
  div.innerHTML = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// ── Global AI panel data context ──────────────────────────────

export function getDataContext() {
  const DATA     = window.DATA     || {};
  const PROJECTS = window.PROJECTS || {};
  const today    = window.today    || (() => new Date().toISOString().split('T')[0]);

  const ctx = {
    projects: {},
    staff_count:  DATA.staff    ? DATA.staff.length    : 0,
    total_tasks:  0,
    overdue:      [],
    upcoming:     [],
    clients:      []
  };
  const now = new Date();
  for (const [key, proj] of Object.entries(PROJECTS)) {
    const tasks = (DATA.tasks || []).filter(t => {
      for (const sub of Object.keys(proj.subprojects || {})) {
        if (t['Направление'] === sub || t['Проект'] === proj.name) return true;
      }
      return false;
    });
    const subs = {};
    for (const sub of Object.keys(proj.subprojects || {})) {
      const dir      = (DATA.directions || []).find(d => d['Название'] === sub);
      const subTasks = tasks.filter(t => t['Направление'] === sub);
      subs[sub] = {
        tasks:   subTasks.length,
        stage:   dir ? (dir.stage || 'prospect') : null,
        manager: dir ? dir['Менеджер'] : null,
        price:   dir ? dir['Цена']     : null,
        paid:    dir ? !!dir['Оплачено'] : false
      };
    }
    ctx.projects[proj.name] = { subprojects: subs, total_tasks: tasks.length };
    ctx.total_tasks += tasks.length;
    tasks.forEach(t => {
      if (t['Дедлайн'] && t['Статус'] !== 'Готово' && t['Статус'] !== 'Завершено') {
        const dl = new Date(t['Дедлайн']);
        if (dl < now) {
          ctx.overdue.push({ task: t['Описание'] || t['Название'], deadline: t['Дедлайн'], direction: t['Направление'], assignee: t['Ответственный'] });
        } else if (dl - now < 7 * 86400000) {
          ctx.upcoming.push({ task: t['Описание'] || t['Название'], deadline: t['Дедлайн'], direction: t['Направление'], assignee: t['Ответственный'] });
        }
      }
    });
  }
  (DATA.directions || []).forEach(d => {
    ctx.clients.push({ name: d['Название'], stage: d.stage || 'prospect', price: d['Цена'], paid: !!d['Оплачено'], manager: d['Менеджер'], project: d['Проект'] });
  });
  ctx.partners_count = (DATA.partners || []).length;
  ctx.comms_count    = (DATA.comms    || []).length;
  return ctx;
}

// ── Chat → Telegram reminder handler ─────────────────────────

export async function handleChatReminder(msg) {
  const DATA = window.DATA || {};
  const USER = window.USER || null;
  const sendTelegramNotification = window.sendTelegramNotification || (() => {});
  const lower = msg.toLowerCase();

  if (lower.match(/напомн.*все[мх]|отправ.*все[мх]|уведом.*все[хм]/)) {
    const activeTasks = (DATA.tasks || []).filter(t => {
      const st = t['Статус'] || '';
      return st !== 'Готово' && st !== '✅ Готово' && t['Ответственный'];
    });
    if (!activeTasks.length) return '📋 Нет активных задач для напоминания.';

    let sent = 0;
    const seenNames = new Set();
    for (const t of activeTasks) {
      const name = t['Ответственный'];
      if (seenNames.has(name)) continue;
      seenNames.add(name);
      const s    = (DATA.staff || []).find(st => st['Имя'] === name);
      const tgId = s && (s['Telegram_ID'] || s.telegram_id);
      if (tgId) {
        const myTasks  = activeTasks.filter(tt => tt['Ответственный'] === name);
        const taskList = myTasks.map(tt => '• ' + (tt['Описание'] || tt['Название'])).join('\n');
        await sendTelegramNotification(tgId,
          '📢 Напоминание от ' + (USER?.name || 'Руководитель')
          + ':\n\nУ вас ' + myTasks.length + ' активных задач:\n' + taskList
          + '\n\nСообщение: ' + msg);
        sent++;
      }
    }
    return '✅ Отправлено ' + sent + ' напоминаний в Telegram ('
      + seenNames.size + ' сотрудникам).\n\n📋 Активных задач: ' + activeTasks.length;
  }

  const reminderMatch = lower.match(/(?:напомни|напомнить|отправь|скажи|уведоми)\s+(\S+)/);
  if (reminderMatch) {
    const targetName = reminderMatch[1];
    const staff = (DATA.staff || []).find(s => {
      const sName = (s['Имя'] || '').toLowerCase();
      return sName.includes(targetName) || targetName.includes(sName.split(' ')[0]?.toLowerCase() || '___');
    });

    if (staff) {
      const tgId = staff['Telegram_ID'] || staff.telegram_id;
      if (!tgId) return '⚠️ У сотрудника ' + staff['Имя'] + ' не указан Telegram ID. Добавьте его в карточке сотрудника.';

      const msgPart = msg.replace(/^.*?(?:напомни|напомнить|отправь|скажи|уведоми)\s+\S+\s*/i, '').trim()
        || 'Напоминание от ' + (USER?.name || 'Руководитель');
      await sendTelegramNotification(tgId, '📢 ' + (USER?.name || 'Руководитель') + ': ' + msgPart);
      return '✅ Напоминание отправлено **' + staff['Имя'] + '** в Telegram!\n\n💬 Текст: ' + msgPart;
    }
  }

  return null; // Not a reminder — pass to AI
}

// ── Global AI chat send ───────────────────────────────────────

export async function sendGlobalAi() {
  const CONFIG         = window.CONFIG         || {};
  const USER           = window.USER           || null;
  const currentProject    = window.currentProject    || null;
  const currentSubproject = window.currentSubproject || null;

  const input = document.getElementById('ai-global-input');
  let msg = input.value.trim();
  if (!msg) return;
  input.value    = '';
  input.disabled = true;

  // Handle attached file
  let fileInfo = '';
  if (window._aiAttachedFile) {
    const f = window._aiAttachedFile;
    fileInfo = '\n\n[Прикреплён файл: ' + f.name + ' (' + formatFileSize(f.size) + ')]';
    if (f.name.match(/\.(txt|csv|md|json)$/i) && f.size < 100000) {
      try { fileInfo += '\nСодержимое файла:\n' + (await f.text()).substring(0, 5000); } catch(e) {}
    }
    window._aiAttachedFile = null;
    const badge = document.getElementById('ai-file-badge');
    if (badge) badge.style.display = 'none';
  }
  msg += fileInfo;

  // Intercept reminder/notification commands
  const reminderResult = await handleChatReminder(msg);
  if (reminderResult) {
    const container2 = document.getElementById('ai-global-messages');
    const uDiv = document.createElement('div');
    uDiv.className = 'ai-msg user';
    uDiv.textContent = msg.split('\n')[0];
    container2.appendChild(uDiv);
    globalAiMessages.push({ role: 'user', content: msg });

    const rDiv = document.createElement('div');
    rDiv.className = 'ai-msg assistant';
    rDiv.innerHTML = reminderResult.replace(/\n/g, '<br>');
    container2.appendChild(rDiv);
    globalAiMessages.push({ role: 'assistant', content: reminderResult });
    saveAiHistory();
    container2.scrollTop = container2.scrollHeight;
    input.disabled = false;
    input.focus();
    return;
  }

  const container = document.getElementById('ai-global-messages');
  const userDiv = document.createElement('div');
  userDiv.className = 'ai-msg user';
  userDiv.textContent = msg.split('\n')[0];
  container.appendChild(userDiv);
  globalAiMessages.push({ role: 'user', content: msg });
  saveAiHistory();

  const typing = document.createElement('div');
  typing.className = 'ai-msg system';
  typing.innerHTML = '⏳ Думаю...';
  typing.id = 'ai-typing';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;

  const dataCtx = getDataContext();
  let aiText     = '';
  let aiProvider = 'claude';

  try {
    const systemPrompt = 'Ты AI-ассистент CRM-системы RKT HUB. Помогай с управлением проектами, задачами и клиентами. '
      + 'Пользователь: ' + (USER?.name || 'Аноним') + ', роль: ' + (USER?.role || 'Сотрудник')
      + '. Текущий проект: ' + (currentSubproject || currentProject || 'не выбран')
      + '. Данные системы: ' + JSON.stringify(dataCtx).substring(0, 2000)
      + '. Отвечай на русском, кратко и полезно.\n\n'
      + 'ПРАВИЛА: Ты НЕ можешь менять данные — только читать и советовать. '
      + 'Не говори «Готово/Сделано» если не выполнял операцию. '
      + 'Разделы системы: Проекты, Дашборд ГД, ИИ-ассистент, Партнёры, Задачи, Коммуникации, Сотрудники, Согласования, Настройки. '
      + 'Внутри проекта: Обзор, Задачи, Партнёры, Команда, План-график, Коммуникации, Финансы, Зарплаты. '
      + 'В системе НЕТ разделов: Домены, Биллинг, Email, Хостинг, DNS. '
      + 'Если спрашивают о функции которой нет — скажи «такой функции пока нет в RKT HUB».';

    const chatMsgs = globalAiMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));
    chatMsgs.push({ role: 'user', content: msg });

    const cascadeResult = await sendCascadeChat(chatMsgs, systemPrompt);
    if (cascadeResult && cascadeResult.text) {
      aiText     = cascadeResult.text;
      aiProvider = cascadeResult.provider;
    } else {
      // Fallback to Claude via n8n
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(CONFIG.AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:     msg,
          userId:      USER?.tgId || '',
          context:     'chat',
          source:      'web',
          direction:   currentSubproject || currentProject || '',
          user:        USER?.name || '',
          dataContext: JSON.stringify(dataCtx),
          history:     globalAiMessages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .slice(-20)
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const raw = await response.json();
      let data = raw;
      if (Array.isArray(raw)) data = raw[0] || {};
      if (data.json) data = data.json;
      aiText = data.reply || data.response || data.text || data.message || data.output || '';
      if (!aiText && data.content) { try { aiText = data.content[0].text; } catch(e) {} }
      if (!aiText && typeof raw === 'string') aiText = raw;
      if (!aiText) throw new Error('Empty response. Raw: ' + JSON.stringify(raw).slice(0, 200));
      aiProvider = 'claude';
    }
  } catch(e) {
    console.error('AI API error:', e.message, e);
    aiText     = '❌ Не удалось получить ответ от ИИ. Проверьте интернет-соединение.';
    aiProvider = 'error';
  }

  typing.remove();
  const aiDiv = document.createElement('div');
  aiDiv.className = 'ai-msg assistant';
  const badge = aiProvider !== 'error' ? getAiProviderBadge(aiProvider) : '';
  aiDiv.innerHTML = aiText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    + (badge ? '<br>' + badge : '');
  container.appendChild(aiDiv);
  globalAiMessages.push({ role: 'assistant', content: aiText });
  saveAiHistory();
  container.scrollTop = container.scrollHeight;
  input.disabled = false;
  input.focus();
}

export function globalAiQuick(question) {
  document.getElementById('ai-global-input').value = question;
  sendGlobalAi();
}

export function generateGlobalFallback(msg, ctx) {
  const DATA  = window.DATA  || {};
  const ROLES = window.ROLES || {};
  const today = window.today || (() => new Date().toISOString().split('T')[0]);
  const getDirectionOptions = window.getDirectionOptions || (() => []);

  const ml = msg.toLowerCase();
  const td = today();

  const dirKeywords = {
    'кт':     ['КТ','кт','томограф','ct'],
    'рентген':['Рентген','рентген','xray'],
    'робот':  ['Роботы','робот','хирург'],
    'уролог': ['Урология','уролог'],
    'pacs':   ['PACS','pacs','архив'],
    'узи':    ['УЗИ','узи','ультразвук'],
    'сайт':   ['Сайты','сайт','web','веб'],
    'пышки':  ['Пышки','пышки','пончик'],
    'брежнев':['Брежнев','брежнев'],
    'кератин':['Кератин','кератин','агрыз']
  };
  for (const [key, words] of Object.entries(dirKeywords)) {
    if (words.some(w => ml.includes(w.toLowerCase()))) {
      const allDirs  = getDirectionOptions();
      const matchDir = allDirs.find(d => words.some(w => d.toLowerCase().includes(w.toLowerCase()))) || words[0];
      const dirPartners = (DATA.partners || []).filter(p => (p['Направление'] || '').toLowerCase().includes(key));
      const dirTasks    = (DATA.tasks    || []).filter(t => (t['Направление'] || '').toLowerCase().includes(key));
      const openTasks   = dirTasks.filter(t => t['Статус'] !== 'Завершено' && t['Статус'] !== 'Готово' && t['Статус'] !== '✅ Готово');
      const overdueT    = openTasks.filter(t => t['Дедлайн'] && t['Дедлайн'] < td);
      let r = '📂 **' + matchDir + ':**\n\n';
      r += '🤝 Партнёров: ' + dirPartners.length + '\n';
      if (dirPartners.length) dirPartners.forEach(p => r += '  • ' + (p['Название'] || '?') + ' (' + (p['Страна'] || '?') + ') — ' + (p['Статус'] || '?') + '\n');
      r += '\n✅ Задач: ' + dirTasks.length + ' (открытых: ' + openTasks.length;
      if (overdueT.length) r += ', 🔴 просрочено: ' + overdueT.length;
      r += ')\n';
      if (openTasks.length) openTasks.slice(0, 5).forEach(t => r += '  • ' + (t['Название'] || t['Описание'] || '—') + ' — ' + (t['Приоритет'] || '?') + ', дедлайн: ' + (t['Дедлайн'] || '—') + '\n');
      return r;
    }
  }

  if (ml.includes('просроч') || ml.includes('overdue')) {
    if (ctx.overdue.length === 0) return '✅ Отлично! Просроченных задач нет.';
    let r = '🔴 **Просроченные задачи (' + ctx.overdue.length + '):**\n';
    ctx.overdue.forEach(t => r += '• ' + t.task + ' — дедлайн: ' + t.deadline + ', ' + t.direction + '\n');
    r += '\n💡 Разобрать просроченные, обновить дедлайны.';
    return r;
  }
  if (ml.includes('отчёт') || ml.includes('отчет') || ml.includes('report')) {
    let r = '📊 **Сводка RKT HUB:**\n\n';
    for (const [name, info] of Object.entries(ctx.projects)) r += '• **' + name + '**: ' + info.subprojects + ' направлений, ' + info.tasks + ' задач\n';
    r += '\n👥 Сотрудников: ' + ctx.staff_count + '\n🤝 Партнёров: ' + ctx.partners_count;
    r += '\n🔴 Просрочено: ' + ctx.overdue.length + '\n⚠️ Ближайшие: ' + ctx.upcoming.length;
    if (ctx.overdue.length) { r += '\n\n**Просроченные:**\n'; ctx.overdue.slice(0, 5).forEach(t => r += '• ' + t.task + ' (' + t.deadline + ')\n'); }
    return r;
  }
  if (ml.includes('приоритет') || ml.includes('priority')) {
    let r = '⭐ **Приоритеты:**\n';
    if (ctx.overdue.length) { r += '1. 🔴 Просроченные (' + ctx.overdue.length + '):\n'; ctx.overdue.forEach(t => r += '   • ' + t.task + '\n'); }
    if (ctx.upcoming.length) r += '2. ⏰ Ближайшие: ' + ctx.upcoming.map(t => t.task).join(', ') + '\n';
    r += '3. 📂 Обновить статусы по направлениям';
    return r;
  }
  if (ml.includes('план')) {
    return '📋 **План на неделю:**\n• Пн: Ревью статусов\n• Вт-Ср: Ключевые задачи\n• Чт: Встречи с партнёрами\n• Пт: Итоги\n\n📌 Задач: ' + ctx.total_tasks + ' | Просрочено: ' + ctx.overdue.length + ' | Сотрудники: ' + ctx.staff_count;
  }
  if (ml.includes('письм') || ml.includes('email')) {
    return '📧 Напишите кому и о чём. Примеры:\n• «Письмо партнёру Syno Medical о статусе поставки»\n• «Письмо клиенту о готовности сайта»';
  }
  if (ml.includes('риск')) {
    let r = '⚠️ **Риски:**\n';
    if (ctx.overdue.length) r += '1. 🔴 Просроченные (' + ctx.overdue.length + ')\n';
    r += '2. Зависимость от партнёров\n3. Сроки по клиентским проектам';
    return r;
  }
  if (ml.includes('команд') || ml.includes('сотрудник') || ml.includes('кто в')) {
    let r = '👥 **Сотрудники (' + (DATA.staff || []).length + '):**\n';
    (DATA.staff || []).forEach(s => r += '• ' + (ROLES[s['Роль']]?.emoji || '👤') + ' ' + (s['Имя'] || '?') + ' — ' + (s['Роль'] || '?') + ', ' + (s['Направление'] || 'Все') + '\n');
    return r;
  }
  if (ml.includes('партнёр') || ml.includes('партнер')) {
    let r = '🤝 **Партнёры (' + (DATA.partners || []).length + '):**\n';
    (DATA.partners || []).forEach(p => r += '• ' + (p['Название'] || '?') + ' (' + (p['Страна'] || '?') + ') — ' + (p['Направление'] || '?') + ', ' + (p['Статус'] || '?') + '\n');
    return r;
  }
  return '🤖 В системе ' + ctx.total_tasks + ' задач, ' + ctx.staff_count + ' сотрудников, ' + ctx.partners_count + ' партнёров.\n\n💡 Спросите:\n• **По направлению:** «что по КТ?», «статус роботов»\n• **Задачи:** «просрочено», «приоритеты»\n• **Отчёт:** «отчёт», «план на неделю»\n• **Команда:** «кто в команде?»\n• **Письмо:** «напиши письмо партнёру X»';
}

// ── CRM AI actions (Этап 3.3) ─────────────────────────────────

export async function aiSummary(leadId) {
  const DATA   = window.DATA   || {};
  const CONFIG = window.CONFIG || {};
  const esc    = window.esc    || (s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const showCustomModal = window.showCustomModal || (() => {});

  const lead = (DATA.directions || []).find(d => (d['ID'] || d.id) === leadId);
  if (!lead) return;
  const btn = document.getElementById('so-ai-summary-btn');
  const origText = btn ? btn.textContent : '';
  if (btn) btn.textContent = '⏳ Загрузка...';
  try {
    const resp = await fetch(CONFIG.AI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action:   'ai_assist',
        type:     'summary',
        lead_id:  leadId,
        message:  'Дай краткую сводку по клиенту: ' + JSON.stringify({
          Название:             lead['Название'],
          Проект:               lead['Проект'],
          Этап:                 lead['stage'],
          Цена:                 lead['Цена'],
          Касания:              lead['Касания'],
          'Следующий контакт':  lead['Следующий контакт'],
          Менеджер:             lead['Менеджер'],
          Описание:             lead['Описание'],
          Фидбек:               lead['Фидбек']
        })
      })
    });
    const data  = await resp.json().catch(() => ({}));
    const reply = data.reply || data.text || data.message || data.output || 'AI не вернул ответ.';
    showCustomModal('🤖 AI Итог — ' + esc(lead['Название'] || ''), `
      <div style="background:var(--bg3);border-radius:8px;padding:14px;font-size:14px;line-height:1.6;white-space:pre-wrap;color:var(--text)">${esc(reply)}</div>
    `, null);
  } catch(err) {
    const toast = window.toast || (() => {});
    toast('❌ AI недоступен: ' + err.message, 'error');
  } finally {
    if (btn) btn.textContent = origText;
  }
}

export async function aiNextStep(leadId) {
  const DATA   = window.DATA   || {};
  const CONFIG = window.CONFIG || {};
  const esc    = window.esc    || (s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const showCustomModal = window.showCustomModal || (() => {});

  const lead = (DATA.directions || []).find(d => (d['ID'] || d.id) === leadId);
  if (!lead) return;
  const btn = document.getElementById('so-ai-nextstep-btn');
  const origText = btn ? btn.textContent : '';
  if (btn) btn.textContent = '⏳ Анализ...';
  try {
    const resp = await fetch(CONFIG.AI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action:  'ai_assist',
        type:    'next_step',
        lead_id: leadId,
        message: 'Что делать дальше с этим клиентом? Рекомендуй конкретное действие: ' + JSON.stringify({
          Название:             lead['Название'],
          Этап:                 lead['stage'],
          Касания:              lead['Касания'],
          'Следующий контакт':  lead['Следующий контакт'],
          Описание:             lead['Описание'],
          Фидбек:               lead['Фидбек'],
          'Причина отказа':     lead['Причина отказа']
        })
      })
    });
    const data  = await resp.json().catch(() => ({}));
    const reply = data.reply || data.text || data.message || data.output || 'AI не вернул ответ.';
    showCustomModal('💡 AI Следующий шаг — ' + esc(lead['Название'] || ''), `
      <div style="background:rgba(77,171,247,.06);border:1px solid var(--blue);border-radius:8px;padding:14px;font-size:14px;line-height:1.6;white-space:pre-wrap;color:var(--text)">${esc(reply)}</div>
    `, null);
  } catch(err) {
    const toast = window.toast || (() => {});
    toast('❌ AI недоступен: ' + err.message, 'error');
  } finally {
    if (btn) btn.textContent = origText;
  }
}

// ── Internal helper ───────────────────────────────────────────

function formatFileSize(bytes) {
  if (bytes < 1024)    return bytes + ' Б';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' КБ';
  return (bytes / 1048576).toFixed(1) + ' МБ';
}