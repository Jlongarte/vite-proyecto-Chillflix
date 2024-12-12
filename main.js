import "./style.css";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import MainContent from "./components/MainContent/MainContent";

const initialize = () => {
  Header();
  Hero();
  MainContent();
  getPhotos("movie", "Mi Lista");
  getPhotos("series", "Últimas añadidas");
  getPhotos("documentaries", "Documentales");
  getPhotos("animation", "Animación");
  Footer();
};

const getPhotos = async (keyword, title, isSearch = false) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${keyword}&include_adult=false&language=en-US&page=1&api_key=${
        import.meta.env.VITE_CLIENT_ID
      }`
    );
    const results = await response.json();

    const photos = results.results.filter(
      (item) =>
        item.backdrop_path &&
        (item.media_type === "movie" || item.media_type === "tv")
    );

    if (photos.length === 0) {
      if (isSearch) {
        printNoResultsMessage();
      }
    } else {
      printPhotos(
        photos,
        isSearch ? `Resultados para "${keyword}"` : title,
        isSearch
      );
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    if (isSearch) {
      printNoResultsMessage();
    }
  }
};

const printNoResultsMessage = () => {
  const existingModal = document.querySelector(".error-modal");
  if (existingModal) {
    document.body.removeChild(existingModal);
  }

  const errorModal = document.createElement("div");
  errorModal.classList.add("error-modal");

  errorModal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal" aria-label="Cerrar modal">
        <i class="fa fa-times"></i>
      </button>
      <div class="modal-header">
        <h2 class="error-title">Ups...</h2>
        <p class="error-message">Parece que no tenemos lo que buscas.</p>
        <p>Intenta buscar otro término o explorar nuestras categorías destacadas 😊</p>
      </div>
    </div>
  `;

  document.body.appendChild(errorModal);

  errorModal.querySelector(".close-modal").addEventListener("click", () => {
    document.body.removeChild(errorModal);
  });

  errorModal.addEventListener("click", (event) => {
    if (event.target === errorModal) {
      document.body.removeChild(errorModal);
    }
  });
};

const printPhotos = (photos, title, isSearch = false) => {
  const container = document.querySelector("#results");

  if (isSearch) {
    container.innerHTML = "";
  }

  const carouselContainer = document.createElement("div");
  carouselContainer.classList.add("mylist-carousel");

  const carouselHTML = `
    <div class="mylist-carousel-container">
      <div class="title"><h3>${title}</h3></div>
      <div class="mylist-carousel-list">
        <ul class="mylist-slider-content" id="mylist-slider-content">
          ${photos
            .map((photo) => {
              const imageUrl = `https://image.tmdb.org/t/p/w500${photo.backdrop_path}`;
              const mediaType = photo.media_type;
              const mediaId = photo.id;
              return `
              <li>
                <div>
                  <img src="${imageUrl}" 
                       alt="${photo.original_name || photo.title}" 
                       class="image-link" 
                       data-media-id="${mediaId}" 
                       data-media-type="${mediaType}" />
                </div>
              </li>`;
            })
            .join("")}
        </ul>
      </div>
    </div>
  `;

  carouselContainer.innerHTML = carouselHTML;
  container.appendChild(carouselContainer);
  initializeImageClickEvents();
};

const openMovieModal = async (mediaId, mediaType) => {
  const existingModal = document.querySelector(".movie-modal");
  if (existingModal) {
    document.body.removeChild(existingModal);
  }

  const modal = document.createElement("div");
  modal.classList.add("movie-modal");

  const apiUrl = `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${
    import.meta.env.VITE_CLIENT_ID
  }`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data || (!data.title && !data.name)) {
      printNoResultsMessage();
      return;
    }

    const posterUrl = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
    const genresList = data.genres.map((genre) => genre.name).join(", ");
    const title = data.title || data.name;
    const releaseDate = data.release_date || data.first_air_date;

    modal.innerHTML = `
      <div class="modal-content">
        <button class="close-modal" aria-label="Cerrar modal">
          <i class="fa fa-times"></i>
        </button>
        <div class="modal-header">
          <img src="${posterUrl}" alt="${title}" class="modal-poster">
          <div class="modal-text">
            <h2>${title}</h2>
            <p class="modal-overview">${data.overview}</p>
            <div class="modal-details">
              <p><strong>Géneros:</strong> ${genresList}</p>
              <p><strong>Año:</strong> ${
                releaseDate ? releaseDate.split("-")[0] : "N/A"
              }</p>
              <p><strong>Puntuación:</strong> ${data.vote_average.toFixed(
                1
              )}/10</p>
            </div>
            <button class="btn-go-to-movie" onclick="window.open('https://www.themoviedb.org/${mediaType}/${
      data.id
    }', '_blank')">
              Ver más en TMDb
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".close-modal").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        document.body.removeChild(modal);
      }
    });
  } catch (error) {
    console.error("Error al cargar los detalles de la película:", error);
    printNoResultsMessage();
  }
};

const initializeImageClickEvents = () => {
  document.querySelectorAll(".image-link").forEach((imageElement) => {
    imageElement.addEventListener("click", (event) => {
      const mediaId = event.target.getAttribute("data-media-id");
      const mediaType = event.target.getAttribute("data-media-type");
      openMovieModal(mediaId, mediaType);
    });
  });
};

const handleSearch = () => {
  const input = document.querySelector("#searchInput");
  const query = input.value.trim();

  if (query) {
    const container = document.querySelector("#results");
    container.innerHTML = "";
    getPhotos(query, "Resultados de Búsqueda", true);
    input.value = "";
    const suggestions = document.querySelector("#suggestions");
    if (suggestions) {
      suggestions.innerHTML = "";
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Header();
  Footer();

  document.querySelector("#searchBtn").addEventListener("click", handleSearch);

  document
    .querySelector("#searchInput")
    .addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
      }
    });

  document
    .querySelector("#searchInput")
    .addEventListener("input", async (event) => {
      const query = event.target.value.trim();
      if (query.length > 0) {
        const suggestions = await fetchSuggestions(query);
        displaySuggestions(suggestions);
      } else {
        document.querySelector("#suggestions").innerHTML = "";
      }
    });
});

initialize();
