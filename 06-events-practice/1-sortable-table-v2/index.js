import SortableTableV1 from "../../05-dom-document-loading/2-sortable-table-v1";

export default class SortableTable extends SortableTableV1 {
  previousSortedHeader;

  constructor(headersConfig, {
    data = [],
    sorted = {},
    isSortLocally = true
  } = {}) {
    super();

    this.header = headersConfig;
    this.body = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.createElement();

    this.subElements = {
      body: this.element.querySelector('.sortable-table__body'),
      header: this.element.querySelector('.sortable-table__header')
    };

    this.createListeners();
  }

  sort(field, order) {
    if (this.previousSortedHeader) {
      order = this.previousSortedHeader.getAttribute('data-order') === 'asc' ? 'desc' : 'asc';
      this.previousSortedHeader.removeAttribute('data-order');
    } else {
      order = !order || order === 'asc' ? 'desc' : 'asc';
    }

    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }

    const targetTitle = this.element.querySelector(`[data-id="${field}"]`);

    targetTitle.setAttribute('data-order', order);

    this.previousSortedHeader = targetTitle;

    this.subElements.body.innerHTML = this.createBodyTemplate();
  }

  sortOnClient(field, order) {
    const currentSortType = this.header.find(item => item.id === field).sortType;

    if (currentSortType === 'string') {
      this.body = this.sortStrings(field, order);
    } else {
      this.body = this.sortNumbers(field, order);
    }
  }

  sortOnServer(field, order) {
    console.log(`Сортировка на сервере. Поле: ${field} порядок: ${order}`);
  }

  createListeners() {
    this.subElements.header.addEventListener('pointerdown', (event) => this.onHeaderClick(event));
    document.addEventListener("DOMContentLoaded", this.onDomLoaded);
  }

  removeListeners() {
    this.subElements.header.removeEventListener('pointerdown', (event) => this.onHeaderClick(event));
    document.removeEventListener("DOMContentLoaded", this.onDomLoaded);
  }

  onHeaderClick(event) {
    const targetDataset = event.target.dataset.hasOwnProperty('id') ? event.target.dataset : event.target.parentNode.dataset;
    const { id, order, sortable } = targetDataset;

    if (sortable) {
      this.sort(id, order);
    }
  }

  onDomLoaded() {
    if (this.sorted) {
      const { id, order } = this.sorted;
      this.sort(id, order);
    }
  }

  destroy() {
    this.removeListeners();
    this.remove();
  }
}
