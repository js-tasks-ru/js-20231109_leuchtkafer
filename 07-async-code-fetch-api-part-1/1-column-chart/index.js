import fetchJson from './utils/fetch-json.js';
import ColumnChartV1 from "../../04-oop-basic-intro-to-dom/1-column-chart";

const BACKEND_URL = 'https://course-js.javascript.ru';

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
    const url = new URL(`${BACKEND_URL}/${this.url}`);
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);
    this.element.classList.add('column-chart_loading');

    return await fetchJson(url);
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
      console.log(error);
    }
    return response;
  }

  createListener() {
    document.addEventListener('DOMContentLoaded', async () => this.update(this.from, this.to));
  }
}
