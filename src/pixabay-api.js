import axios from 'axios';

export class PixabayApi {
  #BASE_URL = 'https://pixabay.com/api';
  #API_KEY = '34120548-945725edde00f4b24886c20bc';
  constructor() {
    this.query = '';
    this.page = 1;
    this.per_page = 40;
  }

  axiosFoto() {
    const searchParams = new URLSearchParams({
      q: this.query,
      page: this.page,
      per_page: this.per_page,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
    });

    return axios
      .get(`${this.#BASE_URL}/?key=${this.#API_KEY}&${searchParams}`);
  }
  incrementPage() {
    this.page++;
  }
}
