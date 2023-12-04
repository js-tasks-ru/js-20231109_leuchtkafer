class Tooltip {
  static instance;
  element;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize () {
    this.createListeners();
  }

  get template() {
    return `<div class="tooltip">This is tooltip</div>`;
  }

  onDocumentPointerover = (event) => {
    if (event.target.dataset.tooltip) {
      this.render();
      this.element.textContent = event.target.dataset.tooltip;
    }
  }

  onDocumentPointerout = (event) => {
    if (event.target.dataset.tooltip) {
      this.remove();
    }
  }

  render() {
    this.createElement();
    document.body.appendChild(this.element);
  }

  createElement() {
    const element = document.createElement('template');
    element.insertAdjacentHTML('afterbegin', this.template);
    this.element = element.firstElementChild;
  }

  createListeners() {
    document.addEventListener('pointerover', this.onDocumentPointerover);
    document.addEventListener('pointerout', this.onDocumentPointerout);
  }

  destroyListeners() {
    document.removeEventListener("pointerover", this.onDocumentPointerover);
    document.addEventListener('pointerout', this.onDocumentPointerout);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.destroyListeners();
  }
}

export default Tooltip;
