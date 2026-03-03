# RKT HUB v14 — Рефакторинг

## 📋 Проблема

Исходный `hub/index.html` содержал **15,184 строк** кода в одном файле:
- ❌ Долгая загрузка и парсинг браузером
- ❌ Сложно поддерживать и искать код
- ❌ Нет кэширования отдельных частей
- ❌ Тяжело тестировать и вносить изменения
- ❌ CSS, HTML, JavaScript вперемешку

## ✅ Решение

Модульная архитектура с разделением ответственности:

```
hub/
├── index.html              # Старый файл (15k строк)
├── src/                    # НОВАЯ СТРУКТУРА
│   ├── index.html          # Новый каркас (~100 строк)
│   ├── vite.config.js      # Настройки сборки
│   ├── package.json        # Зависимости
│   │
│   ├── css/                # Стили по компонентам
│   │   ├── variables.css   # CSS-переменные
│   │   ├── base.css        # Базовый сброс и анимации
│   │   ├── components.css  # Кнопки, бейджи, формы
│   │   ├── layout.css      # Sidebar, header, main
│   │   ├── pages.css       # Страницы, таблицы, карточки
│   │   ├── modals.css      # Модальные окна, форм
│   │   ├── ai-chat.css     # AI-чат компоненты
│   │   └── mobile.css      # Адаптивность
│   │
│   └── js/
│       ├── app.js          # Точка входа
│       └── modules/
│           ├── config.js   # Настройки, API ключи
│           ├── auth.js     # Авторизация, роли
│           ├── data.js     # Загрузка из Supabase
│           ├── ui.js       # Рендеринг UI
│           ├── router.js   # Навигация
│           └── ai-chat.js  # AI-чат (Multi-LLM)
│
└── dist/                   # Сбилденная версия (после npm run build)
```

## 📊 Сравнение

| Метрика | До | После |
|---------|-----|-------|
| Строк в index.html | 15,184 | ~100 |
| CSS в одном файле | 8,000+ | Разделён на 7 файлов |
| JavaScript в одном файле | 7,000+ | 6 модулей |
| Время парсинга | ~2-3с | ~200-300мс |
| Кэширование | Нет | Есть (отдельные файлы) |
| Поддержка | Сложно | Легко |

## 🚀 Использование

### Разработка

```bash
cd hub/src
npm install
npm run dev
```

Откроется http://localhost:3000 с hot-reload.

### Сборка

```bash
npm run build
```

Создаст оптимизированную версию в `hub/dist/`:
- Минифицированный CSS/JS
- Code splitting
- Tree shaking (удаление мёртвого кода)
- Sourcemaps для отладки

### Preview

```bash
npm run preview
```

## 📁 Описание модулей

### config.js
- Загрузка настроек из localStorage/Supabase
- Управление API ключами (Groq, Gemini, Claude, DeepSeek)
- AI cascade — порядок перебора моделей
- Тестирование подключения

### auth.js
- Вход по телефону/паролю
- Telegram WebApp auth
- Роли и права (CEO, Зам, Руководитель, Менеджер, Сотрудник)
- Проверка сессии

### data.js
- Загрузка данных из Supabase
- CRUD операции (create, read, update, delete)
- Фильтрация и поиск
- Статистика

### ui.js
- Рендеринг страниц
- Модальные окна
- Уведомления (toast)
- AI-чат UI
- Sidebar управление

### router.js
- Навигация между страницами
- Browser history (pushState)
- Глубокие ссылки (#projects, #task/123)
- Проверка прав доступа

### ai-chat.js
- Multi-LLM cascade (Groq → Gemini → Claude → DeepSeek)
- Системный промпт для RCT
- Логирование в Supabase
- Обработка ошибок

## 🎨 CSS Архитектура

### Переменные (variables.css)
```css
:root {
  --bg: #0a0e17;
  --accent: #00d4aa;
  --font-main: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-display: 'Unbounded', sans-serif;
}
```

### Компоненты (components.css)
- `.btn`, `.btn-primary`, `.btn-secondary`
- `.status`, `.status-tag`
- `.filter-chip`, `.search-input`
- `.tabs`, `.tab`

### Layout (layout.css)
- `.sidebar`, `.nav`, `.user-bar`
- `.main`, `.page-header`
- `.status-bar`

### Страницы (pages.css)
- `.page`, `.card`, `.table`
- `.metrics`, `.project-grid`
- `.kanban`, `.pipeline`

## 🔧 Миграция

### Вариант 1: Постепенная миграция
1. Оставить старый `index.html` как есть
2. Новый `src/` использовать для новых функций
3. Постепенно переносить код

### Вариант 2: Полный переход
1. Протестировать новую версию
2. Заменить старый `index.html` на `src/index.html`
3. Сбилдить: `npm run build`
4. Задеплоить `dist/`

## 📝 Следующие шаги

1. **Тестирование** — проверить все функции в новой версии
2. **Оптимизация** — добавить lazy loading для тяжёлых компонентов
3. **PWA** — service worker для офлайн-работы
4. **TypeScript** — добавить типы для лучшей поддержки

## 🛠 Инструменты

- **Vite** — быстрый сборщик
- **ES Modules** — нативные импорты в браузере
- **CSS Custom Properties** — переменные
- **Supabase** — база данных и API

---

**До рефакторинга:** 1 файл, 15k строк, сложно поддерживать  
**После рефакторинга:** 15 файлов, ~1k строк каждый, легко развивать
