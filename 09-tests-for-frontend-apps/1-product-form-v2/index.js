import SortableList from '../2-sortable-list/index.js';
import ProductFormV1 from '../../08-forms-fetch-api-part-2/1-product-form-v1/index.js';

export default class ProductForm extends ProductFormV1 {
  imageListTemplate () {
    const imageTemplates = this.formData.images.map(item => this.imageListItemTemplate(item.source, item.url));
    const sortableList = new SortableList({items: imageTemplates});
    return sortableList.element.innerHTML;
  }
}
