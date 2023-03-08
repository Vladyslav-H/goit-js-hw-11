// <-----------------------IMPORTS------------------------>

import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { PixabayApi } from './pixabay-api';

// <-----------------------VARIABLES------------------------>

const searchFormEl = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const targetEl = document.querySelector('.target-element');

const { height: searchFormHeight } = searchFormEl.getBoundingClientRect();
document.body.style.paddingTop = `${searchFormHeight}px`;

const pixabayApi = new PixabayApi();

const lightboxSettings = {
  alertErrorMessage: 'Image not found, next image will be loaded',
  animationSpeed: 500,
};

const lightbox = new SimpleLightbox('.gallery a', lightboxSettings);

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

const intersectionObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(async entry => {
    if (!entry.isIntersecting) {
      return;
    }
    pixabayApi.incrementPage();
    try {
      const { data } = await pixabayApi.axiosFoto(pixabayApi.query);
 
      galleryEl.insertAdjacentHTML('beforeend', createGalleryMarkup(data.hits));
      lightbox.refresh();
 
      if (data.totalHits <= pixabayApi.page * pixabayApi.per_page) {
        
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        intersectionObserver.unobserve(targetEl);
      }
    } catch (error) {
      Notify.failure(`${error}`);
    }
  });
}, options);

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
    
      return;
    }
    galleryEl.innerHTML = createGalleryMarkup(data.hits);
    
    targetEl.classList.remove('is-hidden');
     intersectionObserver.observe(targetEl);

    Notify.info(`Hooray! We found ${data.totalHits} images.`);

    lightbox.refresh();

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

// <-----------------------EVENTLISTENERS------------------------>

searchFormEl.addEventListener('submit', onSearchFormSubmit);

