import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchQuery = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const fetchBtn = document.querySelector('button[type="button"');

let page = 1;
let currentQuery = '';
let totalHits = 0;
let lightbox;

// Serwis backeundu API Pixabay
const searchParams = new URLSearchParams({
  key: '42570748-ed659c792c9eb8886cec3511f',
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  page: page,
  per_page: 30,
});

const fetchPhotos = async () => {
  searchParams.set('q', searchQuery.elements[0].value.split(' ').join('+'));
  const searchResults = await axios.get(
    `https://pixabay.com/api/?${searchParams}`
  );
  return searchResults.data;
};

function renderPhotos(data, append = false) {
  if (data.hits.length <= 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your text. Please try again.'
    );
    gallery.innerHTML = '';
  } else {
    const markup = data.hits
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => `<div class="photo-card"><a class="gallery__item" href="${largeImageURL}">
  <img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes: ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views: ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${downloads}</b>
    </p>
  </div>
</div>`
      )
      .join('');

    if (append) {
      gallery.innerHTML += markup;
    } else {
      gallery.innerHTML = markup;
    }

    lightbox = new SimpleLightbox('.gallery a');

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}

searchQuery.addEventListener('submit', async event => {
  event.preventDefault();

  const searchPhrase = searchQuery.elements[0].value.trim();
  if (searchPhrase === '') {
    Notiflix.Notify.warning('Please enter a text!');
    return;
  }

  try {
    page = 1;
    const photos = await fetchPhotos(searchQuery, page);
    totalHits = photos.totalHits;
    renderPhotos(photos);

    if (photos.hits.length === 0) {
      fetchBtn.classList.add('hidden');
    } else {
      fetchBtn.classList.remove('hidden');
      const dataHits = photos.totalHits;
      Notiflix.Notify.success(`We found ${dataHits} images.`);
    }
  } catch (error) {
    Notiflix.Notify.failure(`ERROR: ${error}`);
  }
});

fetchBtn.addEventListener('click', async () => {
  searchParams.set('page', ++page);
  try {
    const photos = await fetchPhotos(currentQuery, page);
    renderPhotos(photos, true);
    loadMorePhotos(photos.hits.length);
    if (photos.hits.length === 0) {
      fetchBtn.classList.add('hidden');
    }
  } catch (error) {
    Notiflix.Notify.failure(`ERROR: ${error}`);
  }
});

function loadMorePhotos() {
  if (page * 30 >= totalHits) {
    fetchBtn.classList.add('hidden');
    Notiflix.Notify.failure(
      "We're sorry, but it is the end of search results."
    );
  } else {
    fetchBtn.classList.remove('hidden');
  }
}
