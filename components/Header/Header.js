import "./Header.css";

const API_KEY = import.meta.env.VITE_CLIENT_ID; // Asegúrate de que esta clave esté bien definida
const BASE_URL = "https://api.themoviedb.org/3/search/movie";

const template = () => `
  <p class="logo" id="logo">chillflix</p>
  <div id="search-container">
    <input type="text" id="searchInput" placeholder="Buscar películas...">
    <div id="suggestions"></div>
    <button id="searchBtn">Buscar</button>
  </div>
`;

const Header = () => {
  document.querySelector("header").innerHTML = template();
  initializeSearch();
};

const initializeSearch = () => {
  const input = document.querySelector("#searchInput");
  const suggestionsContainer = document.querySelector("#suggestions");

  input.addEventListener("input", async (event) => {
    const query = event.target.value.trim();
    if (query.length > 0) {
      try {
        const suggestions = await fetchSuggestions(query);
        displaySuggestions(suggestions);
        suggestionsContainer.style.display = "block";
      } catch (error) {
        console.error("Error al obtener sugerencias:", error);
        suggestionsContainer.style.display = "none";
      }
    } else {
      suggestionsContainer.style.display = "none";
    }
  });

  document.querySelector("#searchBtn").addEventListener("click", handleSearch);

  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  });

  // Redirigir al hacer clic en el logo
  document.querySelector("#logo").addEventListener("click", () => {
    window.location.href = "/"; // Redirige a la página principal
  });
};

const fetchSuggestions = async (query) => {
  const response = await fetch(
    `${BASE_URL}?query=${query}&include_adult=false&language=en-US&page=1&api_key=${API_KEY}`
  );
  if (!response.ok) {
    throw new Error("Error en la llamada a la API");
  }
  const data = await response.json();
  return data.results.slice(0, 5);
};

const displaySuggestions = (movies) => {
  const suggestionsContainer = document.querySelector("#suggestions");
  suggestionsContainer.innerHTML = "";

  movies.forEach((movie) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.className = "suggestion-item";
    suggestionItem.textContent = movie.title || movie.original_name;
    suggestionItem.addEventListener("click", () => {
      document.querySelector("#searchInput").value =
        movie.title || movie.original_name;
      handleSearch();
      suggestionsContainer.style.display = "none";
    });
    suggestionsContainer.appendChild(suggestionItem);
  });
};

const handleSearch = () => {
  const input = document.querySelector("#searchInput");
  const value = input.value.trim();
  if (value) {
    const container = document.querySelector("#results");
    container.innerHTML = "";
    getPhotos(value, "Resultados de Búsqueda");
    input.value = "";
    document.querySelector("#suggestions").innerHTML = "";
  }
};

export default Header;
