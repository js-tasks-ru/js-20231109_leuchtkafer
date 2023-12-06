import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

class ColumnChartV1 {
  chartHeight = 50;
  element;

  constructor({ data = [], label = '', link = '#', value = 0, formatHeading} = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;

    this.element = this.createElement();
  }

  columnClasses() {
    return `column-chart ${!this.data.length ? 'column-chart_loading' : ''}`;
  }

  createHeaderTemplate() {
    return `${this.formatHeading ? this.formatHeading(this.value) : this.value}`;
  }

  createColumnsTemplate() {
    const maxValue = Math.max(...this.data);

    return this.data
      .map(item => {
        const scale = this.chartHeight / maxValue;
        const percent = (item / maxValue * 100).toFixed(0);

        return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  get template() {
    return `<div class="${this.columnClasses()}" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        ${this.label}
        ${this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : ''}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
            ${this.createHeaderTemplate()}
        </div>
        <div data-element="body" class="column-chart__chart">
           ${this.createColumnsTemplate()}
        </div>
      </div>
    </div>`;
  }

  createElement() {
    const element = document.createElement('template');
    element.insertAdjacentHTML('afterbegin', this.template);
    return element.firstElementChild;
  }

  update(newData) {
    this.data = newData;
    this.element.querySelector('.column-chart__header').innerHTML = this.createHeaderTemplate();
    this.element.querySelector('.column-chart__chart').innerHTML = this.createColumnsTemplate();
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
  }
}

export default class ColumnChart extends ColumnChartV1 {
  subElements;
  element;

  constructor({ url = '', label = '', range = {
    from: '',
    to: ''
  }} = {}) {
    super();

    this.url = url;
    this.label = label;
    this.from = range.from;
    this.to = range.to;

    this.element = this.createElement();
    this.createListener();
    this.subElements = {
      body: this.element.querySelector('div[data-element="body"]')
    };
  }
  // специально не использовала второй аргумент params и положила параметры в ссылку, тк почему-то перестало работать в процессе решения задачи (параметры не прокидывались)
  async loadData(from, to) {
    this.element.classList.add('column-chart_loading');
    return await fetchJson(`${BACKEND_URL}/${this.url}?from=${from}&to=${to}`);
  }

  convertDate(date) {
    return date.toLocaleDateString('ru').split('.').reverse().join('-');
  }

  async update(from, to) {
    let response;

    try {
      response = await this.loadData(this.convertDate(from), this.convertDate(to));
      const values = Object.values(response);
      const valuesLength = Object.values(response).length;
      this.value = valuesLength;
      super.update(values);
      this.element.classList.remove('column-chart_loading');
    } catch (error) {
      new Error(error);
    }
    return response;
  }

  createListener() {
    document.addEventListener('DOMContentLoaded', () => this.update(this.from, this.to));
  }
}
