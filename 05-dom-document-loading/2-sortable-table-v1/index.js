export default class SortableTable {
  element;
  subElements = null;
  previousSortedHeader;

  constructor(headerConfig = [], data = []) {
    this.header = headerConfig;
    this.body = data;

    this.createElement();

    this.subElements = { body: this.element.querySelector('.sortable-table__body') };
  }

  createHeaderTemplate() {
    return this.header
      .map(item => {
        return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
        <span>${item.title}</span>
        ${item.sortable ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>` : ''}
      </div>`;
      })
      .join('');
  }

  createCellsTemplate(item) {
    return this.header
      .map(title => {
        return `${title.id === 'images' ? `<img class="sortable-table-image" alt="Image" src=${item[title.id][0].url}>` : `<div class="sortable-table__cell">${item[title.id]}</div>`}`;
      }).join('');
  }

  createBodyTemplate() {
    return this.body
      .map(item => {
        return `<a href="/products/${item.id}" class="sortable-table__row">
            ${this.createCellsTemplate(item)}
          </a>`;
      })
      .join('');
  }

  get template() {
    return `<div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.createHeaderTemplate()}
      </div>
      
      <div data-element="body" class="sortable-table__body">
          ${this.createBodyTemplate()}
      </div>
    </div>`;
  }

  createElement() {
    const element = document.createElement('template');
    element.insertAdjacentHTML('afterbegin', this.template);
    this.element = element.firstElementChild;
  }

  sortStrings(field, order) {
    this.body = order === 'desc' ? this.body.sort((a, b) => b[field].localeCompare(a[field], ['ru', 'en'], { caseFirst: 'upper' })) : this.body.sort((a, b) => a[field].localeCompare(b[field], ['ru', 'en'], { caseFirst: 'upper' }));
  }

  sortNumbers(field, order) {
    this.body = order === 'desc' ? this.body.sort((a, b) => b[field] - a[field]) : this.body.sort((a, b) => a[field] - b[field]);
  }

  sort(field, order) {
    if (this.previousSortedHeader) {
      this.previousSortedHeader.removeAttribute('data-order');
    }

    const targetTitle = document.querySelector(`[data-id="${field}"]`);
    const currentSortType = this.header.find(item => item.id === field).sortType;

    if (currentSortType === 'string') {
      this.sortStrings(field, order);
    } else {
      this.sortNumbers(field, order);
    }

    this.subElements.body.innerHTML = this.createBodyTemplate();

    targetTitle.setAttribute('data-order', order);

    this.previousSortedHeader = targetTitle;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

