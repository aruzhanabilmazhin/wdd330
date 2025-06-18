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
      welcomeMsg.textContent =
        days === 0
          ? "Back so soon! Awesome!"
          : `You last visited ${days} day${days > 1 ? "s" : ""} ago.`;
    }
    localStorage.setItem('lastVisit', now.toString());
  }
  showVisitMessage();
}

// -- FETCH BOOKS FROM OPEN LIBRARY API --
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
      const cover = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : 'https://via.placeholder.com/150x220?text=No+Cover';

      // Change: link to your own bookdetails.html with work ID
      const workKey = book.key.startsWith('/works/') ? book.key : `/works/${book.key}`;

      card.innerHTML = `
        <img src="${cover}" alt="Cover of ${book.title}" />
        <div class="card-content">
          <h3>${book.title}</h3>
          <p>Author: ${book.author_name ? book.author_name[0] : 'Unknown'}</p>
          <a class="learn-more" href="bookdetails.html?work=${workKey}">Learn More</a>
        </div>
      `;
      booksContainer.appendChild(card);
    });
  }

  fetchBooks();
}

// -- FETCH CITY DATA FROM TELEPORT API --
const cityInfoContainer = document.getElementById('city-info-container');
if (cityInfoContainer) {
  async function fetchCityInfo() {
    try {
      const response = await fetch('https://api.teleport.org/api/urban_areas/');
      const data = await response.json();
      const urbanAreas = data._links['ua:item'].slice(0, 6); // Limit to 6 cities

      const cityPromises = urbanAreas.map(async (area) => {
        const [scoreRes, imageRes] = await Promise.all([
          fetch(area.href + 'scores/'),
          fetch(area.href + 'images/')
        ]);
        const scoreData = await scoreRes.json();
        const imageData = await imageRes.json();

        return {
          name: area.name,
          summary: scoreData.summary || 'No description available.',
          url: area.href,
          image: imageData.photos?.[0]?.image?.web || 'https://via.placeholder.com/300x160?text=City'
        };
      });

      const cityData = await Promise.all(cityPromises);
      displayCityInfo(cityData);
    } catch (error) {
      cityInfoContainer.textContent = 'Failed to load city info.';
      console.error(error);
    }
  }

  function displayCityInfo(cityData) {
    cityInfoContainer.innerHTML = '';
    cityData.forEach((city) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img src="${city.image}" alt="Image of ${city.name}" />
        <div class="card-content">
          <h3>${city.name}</h3>
          <p>${city.summary.replace(/<[^>]*>?/gm, '').slice(0, 150)}...</p>
          <button class="learn-more" onclick="window.open('${city.url}', '_blank')">Learn More</button>
        </div>
      `;
      cityInfoContainer.appendChild(card);
    });
  }

  fetchCityInfo();
}
