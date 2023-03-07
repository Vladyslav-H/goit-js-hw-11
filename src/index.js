// <-----------------------IMPORTS------------------------>

import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { PixabayApi } from './pixabay-api';

// <-----------------------VARIABLES------------------------>

const searchFormEl = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtnEl = document.querySelector('.load-more');

const { height: searchFormHeight } = searchFormEl.getBoundingClientRect();
document.body.style.paddingTop = `${searchFormHeight}px`;

const pixabayApi = new PixabayApi();

const lightboxSettings = {
  alertErrorMessage: 'Image not found, next image will be loaded',
  animationSpeed: 500,
};

const lightbox = new SimpleLightbox('.gallery a', lightboxSettings);

// <-----------------------FUNCTIONS------------------------>

async function onSearchFormSubmit(event) {
  event.preventDefault();

  pixabayApi.query = event.currentTarget.elements['searchQuery'].value.trim();
  pixabayApi.page = 1;

  try {
    const { data } = await pixabayApi.axiosFoto(pixabayApi.query);

    if (!data.totalHits) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      galleryEl.innerHTML = '';
      loadMoreBtnEl.classList.add('is-hidden');

      return;
    }

    galleryEl.innerHTML = createGalleryMarkup(data.hits);
    lightbox.refresh();

    data.totalHits <= pixabayApi.per_page
      ? loadMoreBtnEl.classList.add('is-hidden')
      : loadMoreBtnEl.classList.remove('is-hidden');

    Notify.info(`Hooray! We found ${data.totalHits} images.`);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  } catch (error) {
    Notify.failure(`${error}`);
  }
}

function createGalleryMarkup(arr) {

  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card"><a class='photo-link' href='${largeImageURL}'>
        <img src="${webformatURL}" alt="${tags}" loading="lazy" width='340' height='240'/></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b><br>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b><br>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b><br>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b><br>
      ${downloads}
    </p>
  </div>
  </div>`
    )
    .join('');
}

async function onLoadMoreBtnElClick() {
  pixabayApi.incrementPage();

  try {
    const { data } = await pixabayApi.axiosFoto(pixabayApi.query);
    const { height: cardHeight } =
      galleryEl.firstElementChild.getBoundingClientRect();

    galleryEl.insertAdjacentHTML('beforeend', createGalleryMarkup(data.hits));
    lightbox.refresh();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    if (data.totalHits <= pixabayApi.per_page * pixabayApi.page) {
      loadMoreBtnEl.classList.add('is-hidden');

      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    Notify.failure(`${error}`);
  }
}

// <-----------------------EVENTLISTENERS------------------------>

searchFormEl.addEventListener('submit', onSearchFormSubmit);
loadMoreBtnEl.addEventListener('click', onLoadMoreBtnElClick);
