export default class RangePicker {
  element;
  periodDates = [];
  selectedDays = [];

  constructor ({ from = new Date(), to = new Date() } = {}) {
    this.from = from;
    this.to = to;
    this.currentPeriod = {
      from: this.from,
      to: this.to,
    };
    this.element = this.createElement();
    this.subElements = {
      input: this.element.querySelector('[data-element="input"]'),
      selector: this.element.querySelector('[data-element="selector"]')
    };
    this.isOpened = false;

    this.createListeners();
  }

  getISODate = (date, day) => {
    const date1 = new Date(new Date(date).setDate(day));
    return new Date(date1.getTime() - (date1.getTimezoneOffset() * 60000)).toISOString();
  };

  daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  startDay = (date) => {
    const day = new Date(new Date(date).setDate(1)).getDay();

    return day ? day : 7;
  };

  gridTemplate = (date) => {
    const days = this.daysInMonth(date);
    let restDays = '';
    for (let i = 2; i <= days; i++) {
      restDays += `<button type="button" class="rangepicker__cell" data-value="${this.getISODate(date, i)}">${i}</button>`;
    }
    return `<button type="button" class="rangepicker__cell" data-value="${this.getISODate(date, 1)}" style="--start-from: ${this.startDay(date)}">1</button>${restDays}`;
  }

  monthTemplate = (date) => {
    const month = date.toLocaleDateString('ru', {month: 'long'});
    return `<div class="rangepicker__calendar">
      <div class="rangepicker__month-indicator">
        <time datetime="${month}">${month}</time>
      </div>
      <div class="rangepicker__day-of-week">
        <div>Пн</div>
        <div>Вт</div>
        <div>Ср</div>
        <div>Чт</div>
        <div>Пт</div>
        <div>Сб</div>
        <div>Вс</div>
      </div>
      <div class="rangepicker__date-grid">
        ${this.gridTemplate(date)}
      </div>
    </div>`;
  }

  removeTime = (date = new Date()) => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  get rangePickerTemplate() {
    return `<div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
       ${this.monthTemplate(this.currentPeriod.from)}
       ${this.monthTemplate(this.currentPeriod.to)}`;
  }

  get template () {
    return `<div class="rangepicker">
    <div class="rangepicker__input" data-element="input">
      <span data-element="from">${this.from.toLocaleDateString('ru')}</span> -
      <span data-element="to">${this.to.toLocaleDateString('ru')}</span>
    </div>
    <div class="rangepicker__selector" data-element="selector"></div>
  </div>`;
  }

  showCalendar = () => {
    this.element.classList.toggle('rangepicker_open');

    if (this.element.classList.contains('rangepicker_open') && !this.element.classList.contains('rangepicker__cell')) {
      if (!this.isOpened) {
        this.subElements.selector.innerHTML = this.rangePickerTemplate;
        this.setRangeDays();
        this.isOpened = true;
      }
    }
  }

  hideCalendar = (event) => {
    if (!event.target.closest('.rangepicker__selector') && !event.target.closest('[data-element="input"]')) {
      this.element.classList.remove('rangepicker_open');
    }
  }

  getDaysBetweenDates = (from, to) => {
    const millisecondsToDays = ms => ms / (24 * 60 * 60 * 1000);
    const milliseconds = Math.abs(new Date(to).setHours(24) - new Date(from));

    return Math.floor(millisecondsToDays(milliseconds));
  };

  deletePreviousSelectedDays = () => {
    const fromElement = this.element.querySelector('.rangepicker__selected-from');
    const toElement = this.element.querySelector('.rangepicker__selected-to');
    if (fromElement) fromElement.classList.remove('rangepicker__selected-from');
    if (toElement) toElement.classList.remove('rangepicker__selected-to');
    const previousBetweenDays = [...this.element.querySelectorAll('.rangepicker__selected-between')];
    if (previousBetweenDays) previousBetweenDays.forEach(item => item.className = 'rangepicker__cell');
  }

  setRangeDays = () => {
    const daysBetween = this.getDaysBetweenDates(this.from, this.to);
    const days = [...this.element.querySelectorAll('.rangepicker__cell')];
    const actualDate = this.getISODate(this.from, this.from.getDate());
    const startIndex = days.findIndex(item => item.dataset.value === actualDate);
    const lastIndex = daysBetween + startIndex - 1;

    if (startIndex === -1) return;

    for (let i = startIndex + 1; i < lastIndex; i++) {
      days[i].classList.add('rangepicker__selected-between');
      this.selectedDays.push(days[i]);
    }

    const startElement = this.element.querySelector(`[data-value="${this.getISODate(this.from, this.from.getDate())}"]`);
    const endElement = this.element.querySelector(`[data-value="${this.getISODate(this.to, this.to.getDate())}"]`);

    if (startElement) {
      startElement.classList.add('rangepicker__selected-from');
      this.selectedDays.push(startElement);
    }
    if (endElement) {
      endElement.classList.add('rangepicker__selected-to');
      this.selectedDays.push(endElement);
    }
  };

  chooseDate = (event) => {
    if (event.target.classList.contains('rangepicker__cell')) {
      const selectedDate = new Date(event.target.dataset.value);
      this.periodDates.push(selectedDate);
      this.deletePreviousSelectedDays();

      // if (this.selectedDays.length) {
      //   this.selectedDays.forEach(element => element.className = 'rangepicker__cell');
      //   this.selectedDays = [];
      // }

      if (this.periodDates.length === 2) {
        const min = Math.min(...this.periodDates);
        const max = Math.max(...this.periodDates);
        this.from = this.removeTime(new Date(this.getISODate(min, new Date(min).getDate())));
        this.to = this.removeTime(new Date(this.getISODate(max, new Date(max).getDate())));

        this.setRangeDays();

        this.element.dispatchEvent(new CustomEvent('date-select', {
          bubles: true,
          detail: {
            from: this.from,
            to: this.to,
          }
        }));

        this.element.querySelector('[data-element="from"]').textContent = this.from.toLocaleDateString('ru');
        this.element.querySelector('[data-element="to"]').textContent = this.to.toLocaleDateString('ru');
        this.periodDates = [];
      }
    }
  }

  createElement = () => {
    const element = document.createElement('template');
    element.insertAdjacentHTML('afterbegin', this.template);
    return element.firstElementChild;
  }

  changePeriod = (direction) => {
    if (direction === 'left') {
      this.currentPeriod.from.setMonth(this.currentPeriod.from.getMonth() - 1);
      this.currentPeriod.to.setMonth(this.currentPeriod.to.getMonth() - 1);
    } else {
      this.currentPeriod.from.setMonth(this.currentPeriod.from.getMonth() + 1);
      this.currentPeriod.to.setMonth(this.currentPeriod.to.getMonth() + 1);
    }

    this.subElements.selector.innerHTML = this.rangePickerTemplate;
  }

  controlClick = (event) => {
    if (event.target.classList.contains('rangepicker__selector-control-left')) {
      this.changePeriod('left');
    }
    else if (event.target.classList.contains('rangepicker__selector-control-right')) {
      this.changePeriod('right');
    }

    this.setRangeDays();
  }

  createListeners () {
    document.body.addEventListener('click', this.hideCalendar, { capture: true });
    this.subElements.selector.addEventListener('click', this.chooseDate);
    this.subElements.selector.addEventListener('click', this.controlClick);
    this.subElements.input.addEventListener('click', this.showCalendar);
  }

  destroyListeners = () => {
    document.body.removeEventListener('click', this.hideCalendar, { capture: true });
    this.subElements.selector.removeEventListener('click', this.chooseDate);
    this.subElements.selector.removeEventListener('click', this.controlClick);
    this.element.querySelector('[data-element="input"]').removeEventListener('click', this.showCalendar);
  }

  remove() {
    this.element.remove();
  }
  destroy() {
    this.destroyListeners();
    this.remove();
  }
}
