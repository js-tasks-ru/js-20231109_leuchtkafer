export default class SortableList {
  draggableElement;
  placeholderElement;
  elementWidth;
  elementHeight;
  shiftX;
  shiftY;

  constructor({ items = []}) {
    this.items = items;
    this.element = this.createElement();

    this.createListeners();
  }

  get template () {
    return `<ul class="sortable-list">${this.items.map(item => {
      if (typeof item !== 'string') item.classList.add('sortable-list__item');
      return typeof item === 'string' ? item : item.outerHTML;
    }).join('')}
    </ul>`;
  }

  get placeholderTemplate () {
    return `<div class="sortable-list__placeholder" style="width:${this.elementWidth}px; height:${this.elementHeight}px"></div>`;
  }

  createElement = () => {
    const element = document.createElement('template');
    element.insertAdjacentHTML('afterbegin', this.template);
    return element.firstElementChild;
  }

  createPlaceholderElement = () => {
    const element = document.createElement('template');
    element.insertAdjacentHTML('afterbegin', this.placeholderTemplate);
    return element.firstElementChild;
  }

  removeItem = (text) => {
    const number = parseInt(text);
    const index = this.items.findIndex(item => item.textContent.includes(number));
    this.items.splice(index, 1);
    document.querySelector('.sortable-list').innerHTML = this.template;
    this.element = this.createElement();
  }

  moveAt = (pageX, pageY) => {
    this.draggableElement.style.left = pageX - this.shiftX + 'px';
    this.draggableElement.style.top = pageY - this.shiftY + 'px';
  }

  onDocumentPointermove = (event) => {
    this.moveAt(event.clientX, event.clientY);

    const itemBelowIndex = Math.round((event.clientY - this.element.getBoundingClientRect().top) / this.element.clientHeight * this.element.children.length);

    if (itemBelowIndex) {
      this.placeholderElement.remove();
      this.element.children[itemBelowIndex].insertAdjacentElement('beforebegin', this.placeholderElement);
    }
  }

  onDocumentPointerUp = () => {
    this.draggableElement.classList.remove('sortable-list__item_dragging');
    this.draggableElement.removeAttribute('style');

    this.placeholderElement.replaceWith(this.draggableElement.cloneNode(true));

    document.removeEventListener('pointermove', this.onDocumentPointermove);

    this.draggableElement.remove();

    this.placeholderElement = null;
    this.draggableElement = null;
  }

  replaceElement = (element) => {
    this.draggableElement.style.width = `${this.elementWidth}px`;
    this.draggableElement.style.height = `${this.elementHeight}px`;

    this.element.append(this.draggableElement);
    this.draggableElement.classList.add('sortable-list__item_dragging');

    element.replaceWith(this.createPlaceholderElement());
    this.placeholderElement = this.element.querySelector('.sortable-list__placeholder');
  }

  getShifts = (pageX, pageY, element) => {
    this.shiftX = pageX - element.getBoundingClientRect().left;
    this.shiftY = pageY - element.getBoundingClientRect().top;
  }

  dragElement = (event) => {
    const item = event.target.closest('.sortable-list__item');
    this.draggableElement = item.cloneNode(true);
    this.elementWidth = item.getBoundingClientRect().width;
    this.elementHeight = item.getBoundingClientRect().height;

    this.getShifts(event.clientX, event.clientY, item);
    this.replaceElement(item);

    this.draggableElement.ondragstart = () => {
      return false;
    };

    document.addEventListener('pointermove', this.onDocumentPointermove);
    document.addEventListener('pointerup', this.onDocumentPointerUp);
  }

  clickElement = (event) => {
    if (event.target.closest('[data-grab-handle]')) {
      this.dragElement(event);
    }

    if (event.target.closest('[data-delete-handle]')) {
      this.removeItem(event.target.textContent);
    }
  }

  createListeners() {
    this.element.addEventListener('pointerdown', this.clickElement);
  }

  destroyListeners() {
    this.element.removeEventListener('pointerdown', this.clickElement);
    document.removeEventListener('pointerup', this.onDocumentPointerUp);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.destroyListeners();
    this.remove();
  }
}
