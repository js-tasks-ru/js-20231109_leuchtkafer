export default class ColumnChart {
  chartHeight = 50;
  link = '#';
  element;

  constructor({ data, label, link, value, formatHeading} = {}) {
    this.data = data ?? [];
    this.label = label ?? '';
    this.link = link ?? '';
    this.value = value ? value.toLocaleString() : 0;

    if (formatHeading) {
      this.value = formatHeading(this.value);
    }

    this.render();
  }

  columnClasses() {
    return `column-chart ${!this.data.length && 'column-chart_loading'}`;
  }

  getColumns() {
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
        ${this.link && `<a class="column-chart__link" href="${this.link}">View all</a>`}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
           ${this.getColumns()}
        </div>
      </div>
    </div>`;
  }

  render() {
    const element = document.createElement('template');
    element.insertAdjacentHTML('afterbegin', this.template);
    this.element = element.firstElementChild;
  }

  update(newData) {
    this.data = newData;
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
  }
}
