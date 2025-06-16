// app.js

// -- VISIT MESSAGE WITH localStorage --
const welcomeMsg = document.getElementById('welcome-msg');
if (welcomeMsg) {
  function showVisitMessage() {
    const now = Date.now();
    const lastVisit = localStorage.getItem('lastVisit');

    if (!lastVisit) {
      welcomeMsg.textContent = "Welcome! Let us know if you have any questions.";
    } else {
      const diff = now - Number(lastVisit);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) {
        welcomeMsg.textContent = "Back so soon! Awesome!";
      } else if (days === 1) {
        welcomeMsg.textContent = "You last visited 1 day ago.";
      } else {
        welcomeMsg.textContent = `You last visited ${days} days ago.`;
      }
    }
    localStorage.setItem('lastVisit', now.toString());
  }
  showVisitMessage();
}

// -- FETCH BOOKS FROM OPEN LIBRARY API (index.html only) --
const booksContainer = document.getElementById('books-container');
if (booksContainer) {
  async function fetchBooks() {
    try {
      const response = await fetch(
        'https://openlibrary.org/search.json?q=city+life&limit=6'
      );
      const data = await response.json();
      displayBooks(data.docs);
    } catch (error) {
      booksContainer.textContent = 'Failed to load books.';
      console.error(error);
    }
  }

  function displayBooks(books) {
    booksContainer.innerHTML = '';
    books.forEach(book => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="Cover of ${book.title}" />
        <div class="card-content">
          <h3>${book.title}</h3>
          <p>Author: ${book.author_name ? book.author_name[0] : 'Unknown'}</p>
          <button class="learn-more" onclick="window.open('https://openlibrary.org${book.key}', '_blank')">Learn More</button>
        </div>
      `;
      booksContainer.appendChild(card);
    });
  }

  fetchBooks();
}

// -- FETCH CITY DATA FROM TELEPORT API (cityguide.html only) --
const cityInfoContainer = document.getElementById('city-info-container');
if (cityInfoContainer) {
  async function fetchCityInfo() {
    try {
      const response = await fetch('https://api.teleport.org/api/urban_areas/');
      const data = await response.json();
      const urbanAreas = data._links['ua:item'].slice(0, 6); // limit to 6 cities

      const cityPromises = urbanAreas.map(area =>
        fetch(area.href + 'scores/').then(res => res.json())
      );
      const cityData = await Promise.all(cityPromises);
      displayCityInfo(cityData, urbanAreas);
    } catch (error) {
      cityInfoContainer.textContent = 'Failed to load city info.';
      console.error(error);
    }
  }

  function displayCityInfo(cityData, urbanAreas) {
    cityInfoContainer.innerHTML = '';
    cityData.forEach((data, i) => {
      const cityName = urbanAreas[i].name;
      const summary = data.summary || 'No description available.';
      const image = data.teleport_city_score_image || 'https://via.placeholder.com/300x160?text=City';

      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img src="${image}" alt="Image of ${cityName}" />
        <div class="card-content">
          <h3>${cityName}</h3>
          <p>${summary.replace(/<[^>]*>?/gm, '').slice(0, 150)}...</p>
          <button class="learn-more" onclick="window.open('${urbanAreas[i].href}', '_blank')">Learn More</button>
        </div>
      `;
      cityInfoContainer.appendChild(card);
    });
  }

  fetchCityInfo();
}

// -- No specific JS needed for contact.html at the moment
