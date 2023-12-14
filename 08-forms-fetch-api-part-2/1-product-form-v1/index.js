import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru/';
const STORAGE_IMAGE_URL = 'https://api.imgur.com/3/image';

export default class ProductForm {
  element;
  subcategories = [];

  constructor (productId) {
    this.productId = productId;
    this.formData = {
      title: '',
      description: '',
      quantity: 1,
      subcategory: '',
      status: 1,
      price: 100,
      discount: 0,
      images: []
    };
  }

  template = () =>`<div class="product-form">
    <form data-element="productForm" class="form-grid">
      ${this.productFormTemplate()}
    </form>
  </div>`;

  subCategoryTemplate = () => {
    return this.subcategories.map(item => item.subcategories.map(sub => `<option value="${sub.id}" ${this.formData.subcategory === sub.id ? 'selected' : ''} >${escapeHtml(`${item.title} > ${sub.title}`)}</option>`).join('')).join('');
  }

  imageListItemTemplate = (source, url) => {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
   <input type="hidden" name="url" value="${url}">
   <input type="hidden" name="source" value="${source}">
   <span>
     <img src="icon-grab.svg" data-grab-handle="" alt="grab">
     <img class="sortable-table__cell-img" alt="Image" src="${url}">
      <span>${source}</span>
    </span>
    <button type="button">
      <img src="icon-trash.svg" data-delete-handle="" alt="delete">
    </button>
  </li>`;
  }

  imageListTemplate = () => {
    return this.formData.images.map(item => this.imageListItemTemplate(item.source, item.url)).join('');
  }

  productFormTemplate = () => {
    return `<div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" value="${escapeHtml(this.formData.title)}" type="text" name="title" class="form-control" placeholder="Название товара" id="title">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea class="form-control" name="description" data-element="productDescription" placeholder="Описание товара" id="description">${escapeHtml(this.formData.description)}</textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          <ul class="sortable-list">
            ${this.imageListTemplate()}
          </ul>
        </div>
          
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
            ${this.subCategoryTemplate()}
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input type="number" value="${this.formData.price}" name="price" class="form-control" placeholder="100" id="price">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input type="number" name="discount" value="${this.formData.discount}" class="form-control" placeholder="0" id="discount">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input type="number" class="form-control" value="${this.formData.quantity}" name="quantity" placeholder="1" id="quantity">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status">
          <option ${this.formData.status === 1 ? 'selected' : ''} value="1">Активен</option>
          <option ${this.formData.status === 0 ? 'selected' : ''} value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>`;
  }

  createElement = () => {
    const element = document.createElement('template');
    element.insertAdjacentHTML('afterbegin', this.template());
    return element.firstElementChild;
  }

  async render () {
    const categories = await this.loadSubcategories();
    this.subcategories = categories.map(category => ({
      title: category.title,
      subcategories: category.subcategories
    }));
    if (this.productId) {
      this.formData = await this.getProduct();
    }
    this.element = this.createElement();
    this.subElements = {
      productForm: this.element.querySelector('[data-element="productForm"]'),
      imageListContainer: this.element.querySelector('[data-element="imageListContainer"]')
    };
    this.createListeners();
    return this.element;
  }

  async getProduct () {
    const product = await fetchJson(`${BACKEND_URL}api/rest/products/${this.productId}`);
    if (Array.isArray(product)) {
      return product[0];
    } else {
      return product;
    }
  }

  getRequestBody = () => {
    const formData = new FormData(this.subElements.productForm);
    const numberValues = ['price', 'discount', 'quantity', 'rating', 'quantity', 'status'];
    formData.delete('source');
    formData.delete('url');
    formData.forEach((value, key) => {
      value = numberValues.includes(key) ? +value : value;
      this.formData[key] = value;
    });
    return JSON.stringify(this.formData);
  }

  save = async () =>{
    await fetchJson(`${BACKEND_URL}api/rest/products`, {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: this.getRequestBody()
    });

    const eventName = this.productId ? 'product-updated' : 'product-saved';

    this.element.dispatchEvent(new CustomEvent(eventName, {
      bubles: true
    }));
  }

  submit = (event) =>{
    event.preventDefault();
    this.save();
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');
    fileInput.setAttribute('hidden', 'true');
    fileInput.setAttribute('id', 'image');
    fileInput.setAttribute('name', 'image');
    fileInput.setAttribute('type', 'file');

    this.subElements.productForm.appendChild(fileInput);

    fileInput.click();

    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      const uploadButton = this.subElements.productForm.querySelector('[name="uploadImage"]');
      if (!file) {
        return;
      }

      const imageData = new FormData(this.subElements.productForm).get('image');

      uploadButton.classList.add('is-loading');
      uploadButton.disabled = true;

      try {
        const response = await fetchJson(STORAGE_IMAGE_URL, {
          method: 'POST',
          headers: {
            authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: imageData
        });
        this.subElements.imageListContainer.insertAdjacentHTML('beforeend', this.imageListItemTemplate(escapeHtml(imageData.name), response.data.link));
      } catch (err) {
        console.log(err);
      }
      uploadButton.classList.remove('is-loading');
      uploadButton.disabled = false;

      fileInput.remove();
    };
  }

  deleteImage = (event) => {
    if (Object.keys(event.target.dataset).includes('deleteHandle')) {
      event.target.closest('li').remove();
    }
  }

  async loadSubcategories () {
    const response = await fetchJson(`${BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`);
    if (!response) {
      return;
    }
    return response;
  }

  createListeners () {
    this.subElements.productForm.addEventListener('submit', this.submit);
    this.subElements.productForm.querySelector('[name="uploadImage"]').addEventListener('click', this.uploadImage);
    this.subElements.imageListContainer.addEventListener('click', this.deleteImage);
  }

  destroyListeners = () => {
    this.subElements.productForm.removeEventListener('submit', this.submit);
    this.subElements.productForm.querySelector('[name="uploadImage"]').removeEventListener('click', this.uploadImage);
    this.subElements.imageListContainer.remove('click', this.deleteImage);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.destroyListeners();
    this.remove();
  }
}
