# AI Architect — Интеграция с Sber AI Ecosystem

## 🇷🇺 SBER AI PROVIDERS

### 1. GigaChat (основной)
**Назначение:** Текст, код, анализ  
**API:** `https://gigachat.devices.sberbank.ru/api/v2`  
**Тарифы:**
- Старт: 1M токенов бесплатно
- Бизнес: 10M токенов ~5 000₽/мес
- Корпоративный: Безлимит (индивидуально)

**Использование:**
- AI-аудит сайтов
- AI-генерация кода
- AI-чат в CRM

---

### 2. SaluteSpeech (речь)
**Назначение:** Speech-to-Text, Text-to-Speech  
**API:** `https://smartspeech.sber.ru/api/v2`

**Использование:**
- Расшифровка звонков клиентов
- Озвучка отчётов
- Голосовые помощники

---

### 3. GigaCheck (детекция)
**Назначение:** Определение AI-текста  
**API:** `https://gigacheck.devices.sberbank.ru/api/v1`

**Использование:**
- Проверка контента
- Модерация
- Анти-спам

---

### 4. SaluteRPA (роботы)
**Назначение:** Автоматизация процессов  
**Интеграция:** 1С, CRM, ERP

**Использование:**
- Авто-создание заявок
- Синхронизация данных
- Отчётность

---

## 🏗 АРХИТЕКТУРА

```
@rct/ai (пакет)
├── types.ts              # Интерфейсы (AIProvider, AIResponse, ...)
├── providers/
│   ├── gigachat.ts       # GigaChat (текст, код, анализ)
│   ├── salutespeech.ts   # SaluteSpeech (речь)
│   ├── gigacheck.ts      # GigaCheck (детекция)
│   └── saluterpa.ts      # SaluteRPA (роботы)
├── cascade-manager.ts    # Управление каскадом
├── prompts.ts            # Промпты
└── index.ts              # Экспорт
```

---

## 🎯 СТРАТЕГИИ КАСКАДА

### 1. Cheapest (дешёвый)
```
GigaChat → Groq → Gemini → DeepSeek → Claude
```
**Когда:** Обычные запросы, экономия

### 2. Fastest (быстрый)
```
Groq → GigaChat → Gemini → DeepSeek → Claude
```
**Когда:** Срочные запросы, real-time

### 3. Best (качественный)
```
Claude → GigaChat → Gemini → Groq → DeepSeek
```
**Когда:** Важные запросы, код, аудит

### 4. Fallback (резервный)
```
Порядок как задан в конфиге
```
**Когда:** Стандартный режим

---

## 💰 ЭКОНОМИКА

### До интеграции Sber
| Запрос | Провайдер | Цена |
|--------|-----------|------|
| AI-аудит | Gemini | Бесплатно |
| AI-генерация | Claude | ~150₽ |
| AI-чат | Groq | Бесплатно |
| **ИТОГО (1000 запросов)** | | **~150 000₽/мес** |

### С Sber Ecosystem
| Запрос | Провайдер | Цена |
|--------|-----------|------|
| AI-аудит | GigaChat | ~50₽ |
| AI-генерация | GigaChat | ~100₽ |
| AI-чат | GigaChat | ~20₽ |
| Расшифровка | SaluteSpeech | ~30₽ |
| **ИТОГО (1000 запросов)** | | **~85 000₽/мес** |

**Экономия: 43%** (65 000₽/мес)

---

## 🚀 ИНТЕГРАЦИЯ

### 1. Установка
```bash
cd packages/ai
npm install
npm run build
```

### 2. Настройка
```env
# .env.local
GIGACHAT_API_KEY=...
SALUTESPEECH_API_KEY=...
GIGACHECK_API_KEY=...
```

### 3. Использование
```typescript
import { 
  GigaChatProvider, 
  SaluteSpeechProvider,
  createCascade 
} from '@rct/ai'

// Создание провайдеров
const gigachat = new GigaChatProvider(process.env.GIGACHAT_API_KEY)
const salutespeech = new SaluteSpeechProvider(process.env.SALUTESPEECH_API_KEY)

// Создание каскада
const cascade = createCascade([gigachat, salutespeech], 'cheapest')

// Генерация текста
const result = await cascade.generate('Создай сайт...')

// Анализ
const analysis = await cascade.analyze({ url: '...', html: '...' })

// Код
const code = await cascade.getCode('Лендинг для стоматологии...')

// Речь
const text = await cascade.speechToText(audioBlob)
const audio = await cascade.textToSpeech('Привет!')
```

---

## 📊 МОНИТОРИНГ

### Статистика провайдеров
```typescript
const stats = await gigachat.getStats()
console.log(stats)
// {
//   requestsToday: 1250,
//   tokensUsed: 450000,
//   costToday: 2250,
//   averageLatency: 1200,
//   successRate: 99.5
// }
```

### Логирование
Все запросы логируются в:
- Консоль (development)
- БД `ai_logs` (production)

---

## 🔒 БЕЗОПАСНОСТЬ

### 152-ФЗ Compliance
- ✅ Данные в РФ (сервера Сбера)
- ✅ Лицензия ФСТЭК/ФСБ
- ✅ Реестр ПО Минцифры
- ✅ Сертифицированные дата-центры

### Защита данных
- Шифрование mTLS (TLS 1.3+)
- Аутентификация JWT/OAuth 2.0
- Изоляция контекста
- Модерация контента

---

## 📈 МАСШТАБИРОВАНИЕ

### Этапы внедрения

**Этап 1: GigaChat (текст)**
- AI-аудит
- AI-генерация
- AI-чат

**Этап 2: SaluteSpeech (речь)**
- Расшифровка звонков
- Озвучка отчётов

**Этап 3: GigaCheck (детекция)**
- Проверка контента
- Модерация

**Этап 4: SaluteRPA (роботы)**
- Авто-заявки
- Синхронизация

---

## 🎯 ПРЕИМУЩЕСТВА ДЛЯ RCT

1. **152-ФЗ** — данные в РФ (медтехника, персданные)
2. **Госзаказ** — приоритет российскому ПО
3. **Экономия** — 43% дешевле западных аналогов
4. **Маркетинг** — "Российский AI для российского бизнеса"
5. **Безопасность** — нет санкционных рисков
6. **Поддержка** — российская техподдержка 24/7
7. **Обучение** — СберУниверситет для сотрудников

---

**Версия:** 2.0  
**Дата:** 27 февраля 2026  
**Статус:** Готово к интеграции
