const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const itemCount = document.getElementById("itemCount");
const categoryButtons = document.getElementById("categories");
const sortSelect = document.getElementById("sortSelect");

let activeCategory = "All";
let showFavoritesOnly = false;
let activeSort = "default";

const FAVORITES_KEY = "myShopCartFavorites";

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function renderProducts() {
  const term = searchInput.value.trim().toLowerCase();
  const favorites = getFavorites();

  // Filter products by category, search term, and favorites.
  const visible = products.filter(p => {
    const matchesCategory =
      activeCategory === "All" ||
      activeCategory === "Favorites" ||
      p.category === activeCategory;

    const matchesSearch = [
      p.name,
      p.category,
      p.description,
      p.tag
    ].join(" ").toLowerCase().includes(term);

    const matchesFavorites =
      !showFavoritesOnly || favorites.includes(p.name);

    return matchesCategory && matchesSearch && matchesFavorites;
  });

  // Sort the filtered products alphabetically when selected.
  if (activeSort === "az") {
    visible.sort((a, b) =>
      String(a.name ?? "").localeCompare(
        String(b.name ?? ""),
        undefined,
        { sensitivity: "base", numeric: true }
      )
    );
  } else if (activeSort === "za") {
    visible.sort((a, b) =>
      String(b.name ?? "").localeCompare(
        String(a.name ?? ""),
        undefined,
        { sensitivity: "base", numeric: true }
      )
    );
  }

 itemCount.textContent =
  visible.length + " " + (visible.length === 1 ? "item" : "items");
  emptyState.textContent = showFavoritesOnly
    ? "No favorites yet. Tap the heart on a product to save it here."
    : "No products match your search. Try another keyword or category.";

  emptyState.hidden = visible.length > 0;

  grid.innerHTML = visible.map((p, index) => {
    const isFavorite = favorites.includes(p.name);

    const image = p.image
      ? `<img src="${safeText(p.image)}"
          alt="${safeText(p.name)}"
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
         <div class="placeholder-shape" style="display:none">F.</div>`
      : `<div class="placeholder-shape">${String(index + 1).padStart(2, "0")}</div>`;

    const url = /^https?:\/\//i.test(p.url || "") ? p.url : "";
    const platform = p.platform || "Shopee";

    const shopButton = url
      ? `<a class="shop-link"
            href="${safeText(url)}"
            target="_blank"
            rel="noopener noreferrer sponsored">
            Shop on ${safeText(platform)} ↗
         </a>`
      : "";

    const productImage = url
      ? `<a class="product-image-link"
            href="${safeText(url)}"
            target="_blank"
            rel="noopener noreferrer sponsored">${image}</a>`
      : image;

    return `
      <article class="product-card">
        <div class="product-image">
          ${productImage}
          <span class="product-tag">${safeText(p.tag || p.category)}</span>
          <button
            class="favorite-button${isFavorite ? " is-favorite" : ""}"
            type="button"
            data-favorite="${safeText(p.name)}"
            aria-label="${isFavorite ? "Remove from" : "Add to"} favorites: ${safeText(p.name)}"
            aria-pressed="${isFavorite}">
            ${isFavorite ? "♥" : "♡"}
          </button>
        </div>

        <div class="product-info">
          <p class="product-category">${safeText(p.category)}</p>
          <h3 class="product-name">${safeText(p.name)}</h3>
          <p class="product-description">${safeText(p.description)}</p>
          <div class="product-bottom">
            ${shopButton}
          </div>
        </div>
      </article>`;
  }).join("");
}

// Sort products using the dropdown in index.html.
if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    activeSort = sortSelect.value;
    renderProducts();
  });
}

// Existing product category filters, plus Favorites.
categoryButtons.addEventListener("click", event => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;
  showFavoritesOnly = activeCategory === "Favorites";

  document.querySelectorAll("#categories .category").forEach(b => {
    b.classList.toggle("active", b === button);
  });

  renderProducts();
});

// Save or remove a product from the wishlist.
grid.addEventListener("click", event => {
  const button = event.target.closest("button[data-favorite]");
  if (!button) return;

  const productName = button.dataset.favorite;
  let favorites = getFavorites();

  if (favorites.includes(productName)) {
    favorites = favorites.filter(name => name !== productName);
  } else {
    favorites.push(productName);
  }

  saveFavorites(favorites);
  renderProducts();
});

// Make the large category cards clickable filters.
const categoryCardMap = {
  "skincare-tile": "Skincare",
  "makeup-tile": "Makeup",
  "fashion-tile": "Fashion",
  "home-tile": "Home & Living"
};

const categoryShowcase = document.querySelector(".category-showcase");

if (categoryShowcase) {
  categoryShowcase.addEventListener("click", event => {
    const card = event.target.closest(".category-tile");
    if (!card) return;

    const matchingClass = Object.keys(categoryCardMap).find(className =>
      card.classList.contains(className)
    );

    if (!matchingClass) return;

    event.preventDefault();

    activeCategory = categoryCardMap[matchingClass];
    showFavoritesOnly = false;

    const matchingButton = document.querySelector(
      `#categories button[data-category="${activeCategory}"]`
    );

    document.querySelectorAll("#categories .category").forEach(button => {
      button.classList.toggle("active", button === matchingButton);
    });

    renderProducts();

    document.getElementById("shop").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

// Update the product display as the customer searches.
searchInput.addEventListener("input", renderProducts);

// Display the current year in the footer.
document.getElementById("year").textContent = new Date().getFullYear();

// Initial product display.
renderProducts();
