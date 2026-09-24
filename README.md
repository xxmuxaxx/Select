# Select

Кастомный компонент выпадающего списка на чистом JavaScript (без зависимостей). Он заменяет нативный `<select>` стилизуемой разметкой, а исходный элемент остаётся в DOM: его значение по-прежнему уходит вместе с формой.

Проект собран на основе [webpack-starter](https://github.com/wbkd/webpack-starter): Webpack 5, Babel, SCSS, PostCSS, ESLint и Stylelint.

## Возможности

- Поддержка `<option>` и `<optgroup>` (группы выводятся с заголовком из атрибута `label`).
- При инициализации выбирается опция с атрибутом `selected`.
- Отключённые опции (`disabled`) показываются, но выбрать их нельзя.
- Отключённый селект (`disabled`). Атрибут отслеживается через `MutationObserver`, поэтому его можно менять и после инициализации.
- Список закрывается по клику вне компонента.
- Базовый CSS-класс берётся из первого класса исходного `<select>`, остальные классы переносятся на обёртку.
- Колбэки на открытие, закрытие и выбор опции.

## Быстрый старт

```bash
npm install     # установка зависимостей
npm start       # dev-сервер с hot reload
npm run build   # продакшен-сборка в папку build/
npm run lint    # проверка стилей (stylelint) и скриптов (eslint)
```

## Использование

Добавьте на `<select>` атрибут `data-select`, и компонент инициализируется автоматически при подключении скрипта:

```html
<select class="select" name="select" data-select>
  <optgroup label="1-2">
    <option value="option-1">option-1</option>
    <option value="option-2">option-2</option>
  </optgroup>
  <optgroup label="3-4">
    <option value="option-3">option-3</option>
    <option value="option-4" disabled>option-4</option>
  </optgroup>
</select>

<select name="select-new" data-select>
  <option value="option-1">option-1</option>
  <option value="option-2" selected>option-2</option>
</select>
```

Автоинициализация находится в конце `src/scripts/components/Select.js`:

```js
new Select(document.querySelectorAll("[data-select]"));
```

Конструктор принимает один элемент или `NodeList`, а вторым аргументом объект с параметрами.

### Параметры

| Параметр           | По умолчанию | Описание                                                                    |
| ------------------ | ------------ | --------------------------------------------------------------------------- |
| `placeholder`      | `null`       | Текст кнопки до выбора. Если не задан, показывается текст первой опции.     |
| `mainClass`        | `"select"`   | Базовый класс, если у исходного `<select>` классов нет.                     |
| `openClass`        | `"open"`     | Модификатор открытого состояния (`select--open`).                           |
| `disabledClass`    | `"disabled"` | Модификатор отключённого состояния (`select--disabled`).                    |
| `onOpenCallback`   | `() => {}`   | Вызывается при открытии списка.                                             |
| `onCloseCallback`  | `() => {}`   | Вызывается при закрытии списка.                                             |
| `onChangeCallback` | `() => {}`   | Вызывается при выборе опции, аргумент — выбранный элемент `<option>`.        |

### Методы экземпляра

- `open()`, `close()`, `toggle()`: открыть, закрыть или переключить список.
- `selectOption({ index })`: выбрать опцию по индексу.
- `disabled = true | false`: включить или отключить компонент.

## Разметка компонента (БЭМ)

```
.select                          обёртка (+ .select--open, .select--disabled)
├── .select__input               исходный <select>, визуально скрыт
├── .select__button              кнопка-триггер
│   ├── .select__button-text
│   └── .select__button-icon > .select__button-svg
└── .select__dropdown
    └── .select__options
        ├── .select__options-item          (+ --selected, --disabled)
        └── .select__group > .select__group-list
            ├── .select__group-name
            └── .select__options-item
```

Стили компонента лежат в `src/scripts/components/Select.scss`.

## Структура проекта

```
├── public/                     статические файлы (копируются в build/public)
├── src/
│   ├── index.html              демо-страница
│   ├── scripts/
│   │   ├── index.js            точка входа
│   │   └── components/
│   │       ├── Select.js       логика компонента
│   │       └── Select.scss     стили компонента
│   └── styles/                 глобальные стили
└── webpack/                    конфигурация Webpack (common / dev / prod)
```

## Ограничения

- Множественный выбор (`multiple`) пока не поддерживается: заготовка в коде закомментирована.
- Селект без опций, а также дочерние теги кроме `<option>` и `<optgroup>` приводят к ошибке.
- Изменения в списке опций после инициализации не отслеживаются, только атрибуты самого `<select>`.
- Класс выбранной опции захардкожен как `select__options-item--selected` и не зависит от `mainClass`.

## Лицензия

MIT
