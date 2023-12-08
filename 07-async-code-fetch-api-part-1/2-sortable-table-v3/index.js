import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = null;
  previousSortedHeader;
  loading = false;
  step = 30;
  start = 0;
  end = this.step;

  constructor(headersConfig, {
    data = [],
    sorted = {},
    url = '',
    isSortLocally = false
  } = {}) {

    this.header = headersConfig;
    this.body = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = url;

    this.createElement();

    this.subElements = {
      body: this.element.querySelector('.sortable-table__body'),
      header: this.element.querySelector('.sortable-table__header'),
      loading: this.element.querySelector('[data-element="loading"]'),
      emptyPlaceholder: this.element.querySelector('[data-element="emptyPlaceholder"]'),
    };

    this.createListeners();
    this.loadData();
  }

  render () {
    this.subElements.body.innerHTML = this.createBodyTemplate();
  }

  sort(field, order) {
    this.sorted = { id: field, order };
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

    if (targetTitle) {
      targetTitle.setAttribute('data-order', order);
      this.previousSortedHeader = targetTitle;
      this.sorted = { id: field, order };
    }

    this.updateRangeListing();
  }

  createHeaderTemplate = () => {
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

  createCellsTemplate = (item) => {
    return this.header
      .map(title => {
        if (title.id === 'images') {
          return `<img class="sortable-table-image" alt="Image" src=${item[title.id][0].url}>`;
        }
        return `<div class="sortable-table__cell">${item[title.id]}</div>`;
      }).join('');

  }

  createBodyTemplate = () => {
    return this.body
      .map(item => {
        return `<a href="/products/${item.id}" class="sortable-table__row">
            ${this.createCellsTemplate(item)}
          </a>`;
      })
      .join('');
  }

  get template () {
    return `<div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.createHeaderTemplate()}
      </div>
      
      <div data-element="body" class="sortable-table__body">
        ${this.createBodyTemplate()}
      </div>
      
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-outline">Reset all filters</button>
      </div>
    </div>
    </div>`;
  }

  createElement = () => {
    const element = document.createElement('template');
    element.insertAdjacentHTML('afterbegin', this.template);
    this.element = element.firstElementChild;
  }

  sortStrings = (field, order) => {
    if (order === 'desc') {
      return this.body.sort((a, b) => b[field].localeCompare(a[field], ['ru', 'en'], { caseFirst: 'upper' }));
    }

    return this.body.sort((a, b) => a[field].localeCompare(b[field], ['ru', 'en'], { caseFirst: 'upper' }));
  }

  sortNumbers = (field, order) => {
    if (order === 'desc') {
      return this.body.sort((a, b) => b[field] - a[field]);
    }

    return this.body.sort((a, b) => a[field] - b[field]);
  }

  sortOnClient = (field, order) => {
    const currentSortType = this.header.find(item => item.id === field).sortType;

    if (currentSortType === 'string') {
      this.body = this.sortStrings(field, order);
    } else {
      this.body = this.sortNumbers(field, order);
    }
  }

  loadData = (id = null, order = null) => {
    this.loading = true;
    this.subElements.loading.style.display = 'block';
    this.subElements.emptyPlaceholder.style.display = 'none';

    let url = new URL(`${BACKEND_URL}/${this.url}`);
    url.searchParams.set('_sort', id ?? this.sorted.id);
    url.searchParams.set('_order', order ?? this.sorted.order);
    url.searchParams.set('_start', this.start);
    url.searchParams.set('_end', this.end);

    return new Promise((resolve) => resolve(fetchJson(url)))
      .then(response => {
        if (this.start >= this.step) {
          this.body.push(...response);
        } else {
          this.body = response;
        }
        if (!response.length) {
          this.subElements.emptyPlaceholder.style.display = 'block';
        }
      })
      .finally(() => {
        this.loading = false;
        this.subElements.loading.style.display = 'none';
      })
      .catch(err => new Error(err));
  }

  sortOnServer = (field, order) => {
    this.loadData(field, order).then(() => this.render());
  }

  onHeaderClick = (event) => {
    const targetDataset = event.target.dataset.hasOwnProperty('id') ? event.target.dataset : event.target.parentNode.dataset;
    const { id, order, sortable } = targetDataset;

    if (sortable) {
      this.sort(id, order);
    }
  }

  updateRangeListing = () => {
    this.end += this.step;
    this.start += this.step;
  }

  addObserver = () => {
    let observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.loading) {
          this.loadData();
          this.updateRangeListing();
          this.subElements.body.innerHTML = this.createBodyTemplate();
        }
        observer.unobserve(entry.target);
        observer.observe(this.element.querySelector('a:last-child'));
      });
    }, {
      threshold: 1
    });

    observer.observe(this.element.querySelector('a:last-child'));
  }

  onDomLoaded = () => {
    if (this.sorted && Object.keys(this.sorted).length) {
      const { id, order } = this.sorted;
      this.loadData(id, order).then(() => {
        this.render();
        this.addObserver();
      });
    } else {
      this.loadData().then(() => {
        this.render();
        this.addObserver();
      });
    }
  }

  createListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
    document.addEventListener('DOMContentLoaded', this.onDomLoaded);
  }

  removeListeners() {
    this.subElements.header.removeEventListener('pointerdown', this.onHeaderClick);
    document.removeEventListener('DOMContentLoaded', this.onDomLoaded);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeListeners();
    this.remove();
  }
}
