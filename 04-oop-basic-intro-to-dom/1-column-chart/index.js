export default class ColumnChartV1 {
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
