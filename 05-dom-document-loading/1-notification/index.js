export default class NotificationMessage {
  static notification = null;
  element;
  timerId;

  constructor(message = '', { type = 'success', duration = 500 } = {}) {
    this.message = message;
    this.type = type;
    this.duration = duration;

    this.createElement();
  }

  get template() {
    return `<div class="notification ${this.type}" style="--value: ${this.duration / 1000}s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
        ${this.message}
      </div>
    </div>
  </div>`;
  }

  render(wrapper) {
    if (NotificationMessage.notification) {
      NotificationMessage.notification.destroy();
    }
    const container = wrapper ? wrapper : document.body;
    container.appendChild(this.element);

    NotificationMessage.notification = this;

    this.timerId = setTimeout(() => this.remove(), this.duration);
  }

  createElement() {
    const element = document.createElement('template');
    element.insertAdjacentHTML('afterbegin', this.template);
    this.element = element.firstElementChild;
  }

  show(wrapper) {
    this.render(wrapper);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    clearTimeout(this.timerId);

    this.remove();
  }
}
