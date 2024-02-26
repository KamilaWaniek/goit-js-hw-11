import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// Dostęp z DOM
const searchQuery = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const fetchButton = document.querySelector('button[type="button"');

let page = 1;
let currentQuery = '';
let totalHits = 0;
let lightbox;

// Serwis backeundu API Pixabay + paginacja
const searchParams = new URLSearchParams({
  key: '42570748-ed659c792c9eb8886cec3511f',
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  page: page,
  per_page: 40,
});

//Pobieranie zdjęć
const fetchPhotos = async () => {
  searchParams.set('q', searchQuery.elements[0].value.split(' ').join('+'));
  const searchResults = await axios.get(
    `https://pixabay.com/api/?${searchParams}`
  );
  return searchResults.data;
};

// Wyświetlenie zdjęć zgodnych z hasłem wyszukiwania
function renderPhotos(data, append = false) {
  if (data.hits.length <= 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
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
        }) => ` <li class="gallery-item">
        <a class="gallery-link" href="${largeImageURL}">
          <img class="gallery-image" src="${webformatURL}" alt="${tags}" width="298" />
        </a>
        <div class="container-stats">
          <div class="block">
            <h2 class="title">Likes</h2>
            <p class="amount">${likes}</p>
          </div>
          <div class="block">
            <h2 class="title">Views</h2>
            <p class="amount">${views}</p>
          </div>
          <div class="block">
            <h2 class="title">Comments</h2>
            <p class="amount">${comments}</p>
          </div>
          <div class="block">
            <h2 class="title">Downloads</h2>
            <p class="amount">${downloads}</p>
          </div>
        </div>
      </li>`
      )
      .join('');

    if (append) {
      gallery.innerHTML += markup;
    } else {
      gallery.innerHTML = markup;
    }

    lightbox = new SimpleLightbox('.gallery a');

    //Płynne przewijanie strony
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
      fetchButton.classList.add('hidden');
    } else {
      fetchButton.classList.remove('hidden');
      const dataHits = photos.totalHits;
      Notiflix.Notify.success(`We found ${dataHits} images.`);
    }
  } catch (error) {
    Notiflix.Notify.failure(`ERROR: ${error}`);
  }
});

fetchButton.addEventListener('click', async () => {
  searchParams.set('page', ++page);
  try {
    const photos = await fetchPhotos(currentQuery, page);
    renderPhotos(photos, true);
    loadMorePhotos(photos.hits.length);
    if (photos.hits.length === 0) {
      fetchButton.classList.add('hidden');
    }
  } catch (error) {
    Notiflix.Notify.failure(`ERROR: ${error}`);
  }
});

// Technika nieskończonego przewijania (Infinite Scroll)
function loadMorePhotos() {
  if (page * 40 >= totalHits) {
    fetchButton.classList.add('hidden');
    Notiflix.Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  } else {
    fetchButton.classList.remove('hidden');
  }
}
