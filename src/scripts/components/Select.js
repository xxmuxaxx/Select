import "./Select.scss";

const mutationObserverOptions = {
  attributes: true,
};

const tagToHTML = (node, className, childrens, label) => {
  switch (node.tagName) {
    case "OPTION":
      const disabled = node.disabled
        ? `${className}__options-item--disabled`
        : "";

      return `
        <li class="${className}__options-item ${disabled}" data-select="option">
          ${node.textContent}
        </li>
      `;

    case "OPTGROUP":
      let html = "";

      childrens.forEach((children) => {
        html += tagToHTML(children, className);
      });

      return `
        <li class="${className}__group">
          <ul class="${className}__group-list">
            <li class="${className}__group-name">
              ${label}
            </li>
            ${html}
          </ul>
        </li>
      `;

    default:
      throw new Error("This tag is not supported");
  }
};

const template = (params) => {
  const className = params.mainClass;
  const childrens = params.children;
  const options = params.options;

  if (!options.length)
    throw new Error("Select without options is not supported");

  const placeholder = params.placeholder;
  const buttonText = placeholder ? placeholder : options[0].textContent;

  let html = "";

  childrens.forEach((children) => {
    switch (children.tagName) {
      case "OPTGROUP":
        const childrens = children.children;
        const label = children.label;

        html += tagToHTML(children, className, childrens, label);
        break;

      case "OPTION":
        html += tagToHTML(children, className);
        break;

      default:
        throw new Error("This tag is not supported");
    }
  });

  return `
    <div class="${className}__button" data-select="trigger">
      <p class="${className}__button-text" data-select="text">
        ${buttonText}
      </p>
      <div class="${className}__button-icon">
        <svg class="${className}__button-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 284.929 284.929">
          <path d="M282.082,76.511l-14.274-14.273c-1.902-1.906-4.093-2.856-6.57-2.856c-2.471,0-4.661,0.95-6.563,2.856L142.466,174.441 L30.262,62.241c-1.903-1.906-4.093-2.856-6.567-2.856c-2.475,0-4.665,0.95-6.567,2.856L2.856,76.515C0.95,78.417,0,80.607,0,83.082 c0,2.473,0.953,4.663,2.856,6.565l133.043,133.046c1.902,1.903,4.093,2.854,6.567,2.854s4.661-0.951,6.562-2.854L282.082,89.647 c1.902-1.903,2.847-4.093,2.847-6.565C284.929,80.607,283.984,78.417,282.082,76.511z" />
        </svg>
      </div>
    </div>
    <div class="${className}__dropdown" data-select="dropdown">
      <ul class="${className}__options">
        ${html}
      </ul>
    </div>
  `;
};

class Select {
  constructor(base, options = {}) {
    if (base instanceof NodeList) {
      return base.forEach((item) => new Select(item, options));
    }

    this.params = Object.assign(initilaState, options);

    this.mainClass = !Boolean(base.classList[0])
      ? this.params.mainClass
      : base.classList[0];

    // Base element
    this.base = base;
    this.multiple = this.base.multiple;
    this.options = this.base.options;
    this.children = [...this.base.children];
    this.classes = [this.mainClass, ...this.base.classList].join(" ");

    // Component element
    this.$wrapper = document.createElement("div");
    this.$wrapper.className = this.classes;
    this.$wrapper.insertAdjacentHTML("afterbegin", template(this));

    this.$trigger = this.$wrapper.querySelector('[data-select="trigger"]');
    this.$text = this.$wrapper.querySelector('[data-select="text"]');
    this.$dropdown = this.$wrapper.querySelector('[data-select="dropdown"]');
    this.$options = [
      ...this.$wrapper.querySelectorAll('[data-select="option"]'),
    ];

    // State
    this.isOpen = false;
    this.isDisabled = this.base.disabled;
    this.openClass = `${this.mainClass}--${this.params.openClass}`;
    this.disabledClass = `${this.mainClass}--${this.params.disabledClass}`;
    this.inputClass = `${this.mainClass}__input`;
    this.selectedOption = null;

    // Callbacks
    this.onOpenCallback = this.params.onOpenCallback;
    this.onCloseCallback = this.params.onCloseCallback;
    this.onChangeCallback = this.params.onChangeCallback;

    // Support
    this.mutationObserver = new MutationObserver(
      this.baseChangeHandler.bind(this)
    );

    this.init();
  }

  get selectedOptionIndex() {
    return this.options.findIndex((option) => option.selected);
  }

  /**
   * @param {boolean} isDisabled
   */
  set disabled(isDisabled = false) {
    if (isDisabled) {
      this.$wrapper.classList.add(this.disabledClass);
      this.isDisabled = true;
      this.close();
    } else {
      this.$wrapper.classList.remove(this.disabledClass);
      this.isDisabled = false;
    }
  }

  init() {
    this.base.className = "";
    this.base.classList.add(this.inputClass);
    this.base.insertAdjacentElement("afterend", this.$wrapper);
    this.$wrapper.insertAdjacentElement("afterbegin", this.base);

    this.disabled = this.isDisabled;

    this.$trigger.addEventListener("click", this.toggle.bind(this));

    this.options.forEach((option, index) => {
      if (option.selected) this.selectOption({ index });
    });

    this.$options.forEach(($option, index) => {
      $option.addEventListener(
        "click",
        this.selectOption.bind(this, { index })
      );
    });

    this.mutationObserver.observe(this.base, mutationObserverOptions);
  }

  baseChangeHandler(mutationRecords) {
    const baseMutationLastRecord = mutationRecords[mutationRecords.length - 1];

    if (baseMutationLastRecord.type === "attributes") {
      this.baseAttributesChangeHandler(baseMutationLastRecord.attributeName);
    }
  }

  baseAttributesChangeHandler(attributeName) {
    this[attributeName] = this.base[attributeName];
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.$wrapper.classList.add(this.openClass);
    this.isOpen = true;
    this.onOpenCallback();
    this.onClickOutHandler = this.onClickOut.bind(this);
    document.addEventListener("click", this.onClickOutHandler);
  }

  close() {
    this.$wrapper.classList.remove(this.openClass);
    this.isOpen = false;
    this.onCloseCallback();
    document.removeEventListener("click", this.onClickOutHandler);
  }

  resetOptions() {
    this.$options.forEach((option) =>
      option.classList.remove("select__options-item--selected")
    );
  }

  selectOption({ index }) {
    this.options[index].selected = true;
    this.resetOptions();
    this.$options[index].classList.add("select__options-item--selected");
    this.selectedOption = index;

    const text = this.options[this.selectedOption].textContent;

    this.changeName(text);
    this.onChangeCallback(this.options[this.selectedOption]);
    this.close();
  }

  // selectMultipleOption({ index }) {
  //   if (this.options[index].selected) {
  //     this.options[index].selected = false;
  //     this.$options[index].classList.remove("select__options-item--selected");
  //   } else {
  //     this.options[index].selected = true;
  //     this.$options[index].classList.add("select__options-item--selected");
  //   }

  //   this.selectedOption = [...this.options].filter((option) => option.selected);

  //   const text = this.selectedOption.map((option) => option.textContent);

  //   this.changeName(text.join(", ") || this.options[0].textContent);
  //   this.onChangeCallback(this.options[this.selectedOption]);
  // }

  changeName(text) {
    this.$text.textContent = text;
  }

  getSelectedOption() {
    return console.log(...this.options.filter((option) => option.selected));
  }

  onClickOut(event) {
    if (!this.$wrapper.contains(event.target)) this.close();
  }
}

const initilaState = {
  placeholder: null,
  mainClass: "select",
  openClass: "open",
  disabledClass: "disabled",
  onOpenCallback: () => {},
  onCloseCallback: () => {},
  onChangeCallback: () => {},
};

new Select(document.querySelectorAll("[data-select]"));
