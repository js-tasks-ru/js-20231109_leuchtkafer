export default class DoubleSlider {
  element;
  thumbPositionLeft;
  thumbPositionRight;
  barWidth;
  range;
  progress;

  constructor({
    min = 50,
    max = 150,
    formatValue,
    selected = {
      from: 0,
      to: 0
    }
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = {
      from: selected.from,
      to: selected.to,
    };

    this.createElement();
    this.createListeners();
    this.bar = this.element.querySelector('.range-slider__inner');
    this.progress = this.element.querySelector('.range-slider__progress');
    this.range = this.max - this.min;
  }

  get template() {
    return `<div class="range-slider" style="width: 300px">
      <span data-element="from">${this.formatValue ? this.formatValue(this.selected.from || this.min) : this.selected.from || this.min}</span>
        <div class="range-slider__inner">
          <span class="range-slider__progress" style="left: ${this.selected.from ?? this.min}%; right: ${this.selected.to ?? this.max}%"></span>
          <span class="range-slider__thumb-left" style="left: ${this.selected.from}"></span>
          <span class="range-slider__thumb-right" style="right: ${this.selected.to}"></span>
        </div>
      <span data-element="to">${this.formatValue ? this.formatValue(this.selected.to || this.max) : this.selected.to || this.max}</span>
    </div>`;
  }

  createElement() {
    const element = document.createElement('template');
    element.insertAdjacentHTML('afterbegin', this.template);
    this.element = element.firstElementChild;
  }

  moveAtLeft = (clientX) => {
    this.barWidth = this.element.querySelector('.range-slider__inner').getBoundingClientRect().width;
    const elem = this.element.querySelector('.range-slider__thumb-left');
    const elemWidth = elem.offsetWidth;
    const elemFrom = this.element.querySelector('[data-element="from"]');
    const shiftX = clientX - (this.thumbPositionLeft - (elemWidth / 2));
    let valInPx = shiftX < 0 ? 0 : shiftX > this.barWidth ? this.barWidth : shiftX;

    if (shiftX < this.min) {
      elemFrom.textContent = this.min;
    }

    const valInPercent = valInPx / this.barWidth * 100;
    elem.style.left = `${valInPercent}%`;
    this.progress.style.left = `${valInPercent}%`;
    const roundValue = (this.min + (this.range / 100 * valInPercent)).toFixed();
    elemFrom.textContent = this.formatValue ? this.formatValue(roundValue) : roundValue;
    this.selected.from = +roundValue;
  }

  moveAtRight = (clientX) => {
    this.barWidth = this.element.querySelector('.range-slider__inner').getBoundingClientRect().width;
    const elem = this.element.querySelector('.range-slider__thumb-right');
    const elemWidth = elem.offsetWidth;
    const elemTo = this.element.querySelector('[data-element="to"]');
    const shiftX = this.thumbPositionRight - clientX + (elemWidth / 2);
    let valInPx = shiftX < 0 ? 0 : shiftX > this.barWidth ? this.barWidth : shiftX;

    if (shiftX > this.max) {
      elemTo.textContent = this.max;
    }

    const valInPercent = valInPx / this.barWidth * 100;
    elem.style.right = `${valInPercent}%`;
    this.progress.style.right = `${valInPercent}%`;
    const roundValue = (this.max - (this.range / 100 * valInPercent)).toFixed();
    elemTo.textContent = this.formatValue ? this.formatValue(roundValue) : roundValue;
    this.selected.to = +roundValue;
  }

  onDocumentPointermoveLeft = (event) => {
    if (event.target === this.element.querySelector('.range-slider__thumb-left')) {
      this.moveAtLeft(event.clientX);
    }
  }

  onDocumentPointermoveRight = (event) => {
    if (event.target === this.element.querySelector('.range-slider__thumb-right')) {
      this.moveAtRight(event.clientX);
    }
  }

  dispatchEvent = () => {
    this.element.dispatchEvent(new CustomEvent('range-select', {
      bubles: true,
      detail: this.selected,
    }));
  }

  onThumbLeftPointerdown = (event) => {
    event.target.style.zIndex = '1000';
    this.thumbPositionLeft = this.bar.getBoundingClientRect().left;


    document.addEventListener('pointermove', this.onDocumentPointermoveLeft);
    document.addEventListener('pointerup', this.onDocumentPointerUp);
  }

  onDocumentPointerUp = () => {
    this.dispatchEvent();
    document.removeEventListener('pointermove', this.onDocumentPointermoveLeft);
    document.removeEventListener('pointermove', this.onDocumentPointermoveRight);
  };

  onThumbRightPointerdown = (event) => {
    event.target.style.zIndex = '1000';
    this.thumbPositionRight = this.bar.getBoundingClientRect().right;

    document.addEventListener('pointermove', this.onDocumentPointermoveRight);
    document.addEventListener('pointerup', this.onDocumentPointerUp);
  }

  createListeners() {
    this.element.querySelector('.range-slider__thumb-left').addEventListener('pointerdown', this.onThumbLeftPointerdown);
    this.element.querySelector('.range-slider__thumb-right').addEventListener('pointerdown', this.onThumbRightPointerdown);
  }

  destroyListeners() {
    this.element.querySelector('.range-slider__thumb-left').removeEventListener('pointerdown', this.onThumbLeftPointerdown);
    this.element.querySelector('.range-slider__thumb-right').removeEventListener('pointerdown', this.onThumbRightPointerdown);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.destroyListeners();
    this.remove();
  }
}
