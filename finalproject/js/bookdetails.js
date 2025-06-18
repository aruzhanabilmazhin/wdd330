// Parse the work ID from the URL
const params = new URLSearchParams(window.location.search);
const workID = params.get('work');

if (!workID) {
  document.getElementById("title").textContent = "No book selected.";
} else {
  const apiUrl = `https://openlibrary.org${workID}.json`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      document.getElementById("title").textContent = data.title || "No title found";

      // Load authors (array of objects with keys)
      if (data.authors && data.authors.length > 0) {
        const authorIDs = data.authors.map(a => a.author.key);
        loadAuthors(authorIDs);
      }

      // Load description
      const desc = typeof data.description === "string" ? data.description : data.description?.value;
      document.getElementById("description").textContent = desc || "No description available.";

      // Try to load cover
      if (data.covers && data.covers.length > 0) {
        document.getElementById("cover").src = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`;
        document.getElementById("cover").alt = `Cover of ${data.title}`;
      } else {
        document.getElementById("cover").alt = "No cover image available";
      }
    })
    .catch(err => {
      console.error("Error fetching book data:", err);
      document.getElementById("title").textContent = "Failed to load book details.";
    });
}

// Load authors' names
function loadAuthors(authorKeys) {
  const promises = authorKeys.map(key =>
    fetch(`https://openlibrary.org${key}.json`).then(res => res.json())
  );

  Promise.all(promises).then(authors => {
    const names = authors.map(a => a.name).join(", ");
    document.getElementById("author").textContent = `By: ${names}`;
  });
}
