# Knowledge Journey — AI Tutor Product Concept

## 1. Идея проекта

Интерактивная AI-система обучения, которая:

- принимает тему или учебный текст
- анализирует текущие знания
- строит персональное learning journey
- проверяет понимание
- адаптирует сложность
- создаёт финальный learning artifact

> Не просто тест, а AI ведёт человека через цепочку понимания.

---

## 2. Главная концепция

### Ключевая идея

AI не даёт сразу правильный ответ. Он:

1. разбирает тему на атомы знаний (AKU)
2. строит зависимости
3. генерирует чекпоинты
4. адаптирует активности
5. оценивает рассуждения
6. формирует отчёт

### Atom Knowledge Unit (AKU)

Минимальная концепция, которую можно:

- объяснить
- проверить
- применить

Пример для Python:

1. переменные
2. типы данных
3. if/else
4. циклы
5. функции
6. рекурсия

---

## 3. Архитектура продукта

### Pipeline

```text
INPUT
↓
AI Analysis
↓
Knowledge Graph
↓
Checkpoint Generator
↓
Activity Generator
↓
Journey Engine
↓
Evaluation Engine
↓
Gamification Layer
↓
Final Report Generator
```

### Компоненты

- **AI Analysis** — извлекает сущности, концепты, зависимости и уровень сложности
- **Граф знаний** — моделирует ядро знаний и их связи
- **Генератор чекпоинтов** — создаёт короткие образовательные блоки на 3–7 минут
- **Генератор активностей** — генерирует задания и вопросы
- **Ядро маршрута** — управляет порядком, адаптацией и ротацией режимов
- **Движок оценки** — оценивает ответы, рассуждения и слабые зоны
- **Слой геймификации** — добавляет XP, streak, achievements, таймеры
- **Генератор финального отчёта** — создаёт отчёт и когнитивную рефлексию

---

## 3.1 Пользовательский путь

1. Пользователь вводит тему или загружает текст
2. AI анализирует материал
3. Система строит граф знаний
4. Генерируются чекпоинты
5. Пользователь проходит активности
6. AI оценивает ответы
7. Система адаптирует сложность
8. Генерируется финальный отчёт

## 3.2 Пример пути

Тема: Python loops

**Чекпоинт 1:**
- концепт: for loop
- активность: FillTheBlank
- таймер: 3 мин

**Чекпоинт 2:**
- концепт: nested loops
- активность: LogicBreakdown

**Чекпоинт 3:**
- концепт: loop optimization
- активность: AnalogyCraft

## 3.3 Адаптивная сложность

Система адаптирует сложность на основе результата чекпоинта:

- отвечает быстро и правильно → усложнить следующий чекпоинт
- использует подсказки → оставить тот же уровень
- не проходит чекпоинт → упростить и добавить пояснения

## 3.4 Безопасность AI

Чтобы уменьшить галлюцинации:

- AI использует структурированные JSON-выходы
- промпты задают grounded reasoning
- оценка проверяет семантическое сходство, а не точную формулировку
- сгенерированные вопросы проходят валидацию перед показом пользователю

## 3.5 Объём MVP

Версия 1 включает:
- ввод темы
- генерацию чекпоинтов AI
- 4 типа активностей
- систему таймеров
- геймификацию (XP, streak, achievements)
- финальный PDF-отчёт

Будущие версии:
- голосовой режим
- мультиплеер
- совместное обучение

---

## 4. UX-идея

### Интерфейс давления

Не общий таймер, а таймер чекпоинта:

- зелёный — много времени
- жёлтый — нужно ускоряться
- красный + пульсация — критическое состояние

#### Эффект сердцебиения

Когда остаётся < 10 секунд:

- интерфейс пульсирует
- таймер визуально увеличивается
- появляется звук тиканья

### Ротация когнитивных режимов

Не MCQ → MCQ → MCQ. Чередование режимов:

- Quiz
- TeachBack
- MicroChallenge
- FindTheBug
- AnalogyCraft
- Scenario

### Обучение через сценарий

Сценарии не должны быть сказочными. Лучше production-like:

- Incident Mode
- Startup
- Consultant
- Auditor
- Researcher

Пример:

```text
03:14 AM
Production AI assistant начал генерировать неверные рекомендации.
У тебя 15 минут до investor review.
Первая задача: понять hallucinations.
```

---

## 5. Prompt Engineering

### Prompt 1 — Извлечение знаний

```text
Analyze this educational material.

Extract:
1. Core concepts
2. Dependencies between concepts
3. Difficulty level
4. Common misconceptions
5. Practical applications

Return JSON.
```

### Prompt 2 — Генерация активностей

```text
Generate learning activities for this concept.

Requirements:
- Avoid trivial questions
- Include reasoning
- Create distractors
- Add hints
- Match Bloom taxonomy level
```

### Prompt 3 — Оценка свободного ответа

```text
Evaluate the student's explanation.

Check:
- conceptual correctness
- completeness
- terminology
- reasoning quality
- practical understanding

Do NOT require exact wording.

Provide:
- score
- strengths
- misconceptions
- improvement suggestion
```

### Prompt 4 — Оценка AnalogyCraft

```text
Evaluate the student's analogy for this concept.

Check:
- structural match between analogy and concept
- whether the key mechanism is captured
- factual accuracy
- clarity for someone unfamiliar with the topic

Do NOT penalize unconventional analogies if the mechanism is correct.

Provide:
- score (0-100)
- what the analogy captured well
- what it missed
- feedback
```

---

## 6. Структура данных

### Journey

```ts
Journey {
  id: string
  topic: string
  checkpoints: Checkpoint[]
  score: number
  duration: number
  mode: string
  createdAt: string
  updatedAt: string
}
```

### Checkpoint

```ts
Checkpoint {
  id: string
  concept: string
  difficulty: "easy" | "medium" | "hard"
  activities: Activity[]
  timer: number
  status: "pending" | "in-progress" | "complete"
  estimatedDuration: number
}
```

### Activity

```ts
Activity {
  id: string
  type: "MultipleChoice" | "FillTheBlank" | "FreeResponse" | "LogicBreakdown" | "AnalogyCraft"
  prompt: string
  answer?: string
  hints: string[]
  evaluation?: Evaluation
  bloomLevel: string
  score: number
}
```

### Evaluation

```ts
Evaluation {
  score: number
  strengths: string[]
  misconceptions: string[]
  suggestion: string
  feedback: string
}
```

### AnalogyCraft (расширение Activity)

```ts
AnalogyCraft {
  type: "AnalogyCraft"
  concept: string
  forbiddenTerms: string[]
  exampleAnalogy?: string
  evaluation: {
    structuralMatch: number
    mechanismCaptured: boolean
    clarity: number
    score: number
    feedback: string
  }
}
```

### GamificationState

```ts
GamificationState {
  xp: number
  streak: number
  multiplier: number
  achievements: Achievement[]
}

Achievement {
  id: string
  name: string
  unlockedAt: string | null
}
```

---

## 7. Механика генерации

### Граф знаний

AI строит граф зависимостей между AKU:

- ключевые концепты
- связи предварительной подготовки
- слабые зависимости
- пути применения

### Генератор чекпоинтов

Правила:

- 1 ключевая идея на чекпоинт
- 3–7 минут
- одна активность

### Типы активностей

**MultipleChoice** — классический выбор из 4 вариантов, дистракторы генерируются AI на основе типичных заблуждений.

**FillTheBlank** — пропуски в коде или тексте, проверяет точное понимание формулировок.

**FreeResponse** — развёрнутый ответ, оценивается по смыслу, не по словам.

**LogicBreakdown** — студент получает код или reasoning chain и должен:
- разбить процесс на шаги
- объяснить зачем каждый шаг
- показать логику

Пример:

```python
for i in range(5):
    total += i
```

> Что происходит на каждой итерации?

**AnalogyCraft** — студент придумывает аналогию из реальной жизни. Подробнее в разделе 11.

### Evaluation Engine

Оценивает не только правильность, но и:

- глубину reasoning
- терминологию
- полноту объяснений
- умение применять знания

---

## 8. Геймификация

### XP — за что начислять

XP отражает качество работы, а не только результат:

| Действие | XP |
|----------|----|
| Правильный ответ | +10 |
| Правильный ответ со второй попытки | +5 |
| Правильный ответ без подсказок | +15 |
| Правильный ответ быстрее 50% таймера | +20 |
| Попытка на свободный ответ | +3 |
| Ошибка | 0 |

Штрафов нет намеренно. Страх потерять очки убивает желание пробовать.

### Streak — множитель за серию

| Серия | Множитель |
|-------|-----------|
| 1–2   | x1        |
| 3–4   | x1.5      |
| 5+    | x2        |

Streak считается по правильным ответам подряд. Человек начинает рисковать — отвечает быстрее, не берёт подсказки, чтобы не сломать серию. Одна ошибка — streak сбрасывается. Визуально: огонь рядом с таймером, цифра серии.

### Achievements

| Название | Условие | Смысл |
|----------|---------|-------|
| First Blood | Первый правильный ответ | Старт |
| No Hints | Пройти чекпоинт без подсказок | Уверенность |
| Speed Runner | 3 ответа подряд быстрее 30% таймера | Реакция |
| Comeback | Восстановить streak после ошибки | Устойчивость |
| Deep Thinker | Max score на FreeResponse | Качество рассуждений |
| Perfectionist | Завершить journey без единой ошибки | Мастерство |
| Teacher | TeachBack с оценкой 90%+ | Понимание |
| Analogist | AnalogyCraft с оценкой 90%+ | Глубокое понимание |

Achievements не всплывают конфетти. Появляются тихо — маленький тост в углу экрана.

---

## 9. Новый компонент: AnalogyCraft

### Идея

Студент получает концепцию и придумывает свою аналогию из реальной жизни — объясняет абстрактное через знакомое.

### Почему это сильнее TeachBack

TeachBack — объясни другу. AnalogyCraft — найди связь с тем, что уже знаешь. Если человек может построить аналогию, он понял механику, а не запомнил формулировку. Это более глубокий когнитивный процесс.

### Как работает

```text
Концепция: Backpropagation в нейросети

Задача:
Придумай аналогию из реальной жизни.
Объясни как это работает через что-то знакомое.
Не используй технические термины.

Таймер: 4 минуты
```

Пример хорошего ответа:
> "Это как тренер после матча — смотрит запись, находит где игрок ошибся, говорит каждому что исправить. Ошибка идёт назад по команде."

### Критерии оценки AI

- Аналогия структурно похожа на концепцию
- Передаёт ключевой механизм (направление, причинность, итерацию)
- Не содержит фактических ошибок
- Понятна без знания темы

---

## 10. Финальный отчёт

### Структура

1. **Шапка** — тема, дата, общее время, итоговый score, уровень (Beginner / Practitioner / Expert)
2. **Карта знаний** — все чекпоинты с цветовой индикацией: зелёный (понял), жёлтый (с трудом), красный (провал)
3. **Детали по чекпоинтам** — концепт, тип активности, ответ студента, оценка AI, фидбек
4. **Паттерны** — что студент делал хорошо системно (например: быстро отвечает на MCQ, но затрудняется с FreeResponse)
5. **Слабые зоны** — конкретные концепты с объяснением почему
6. **Следующий шаг** — 2–3 конкретные рекомендации, не "учи больше"

### Формат

- **В браузере** — основной формат, сразу после завершения
- **PDF** — кнопка "Сохранить отчёт", генерируется через `@react-pdf/renderer`
- Дизайн сдержанный — как документ, который не стыдно показать

### Почему это хочется сохранить

Отчёт содержит собственные ответы студента — это персональный документ, а не шаблон. Видишь свои формулировки, свои ошибки, свои аналогии. Это ценно само по себе.

---

## 11. Технологический стек

### Фронтенд

- React + TypeScript
- Tailwind CSS
- Framer Motion — анимации таймера, переходы между чекпоинтами
- canvas-confetti — только для Perfectionist achievement
- @react-pdf/renderer — генерация финального отчёта

### Бэкенд

- FastAPI или Node.js + Express

### AI-слой

- Anthropic Claude API или OpenAI API
- Структурированные JSON-выходы для всех промптов

### Хранилище

- PostgreSQL + Prisma

---

## 12. Почему это сильный проект

Это не только UI. Это:

- AI orchestration
- prompt engineering
- adaptive learning
- cognitive design
- LLM evaluation systems
- gamification mechanics
- оригинальный компонент AnalogyCraft

Если реализовать полностью:

- AI разбивает знания на AKU
- AI строит journey с учётом зависимостей
- AI оценивает reasoning, не только правильность
- AI генерирует персональный отчёт

Проект превращается в сильный EdTech/AI tutor продукт для портфолио.
