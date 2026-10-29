const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const itemCount = document.getElementById("itemCount");
let activeCategory = "All";

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function renderProducts() {
  const term = searchInput.value.trim().toLowerCase();
  const visible = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = [p.name, p.category, p.description, p.tag].join(" ").toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
  itemCount.textContent = `${visible.length} ${visible.length === 1 ? "item" : "items"}`;
  emptyState.hidden = visible.length > 0;
  grid.innerHTML = visible.map((p, index) => {
    const image = p.image
      ? `<img src="${safeText(p.image)}" alt="${safeText(p.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="placeholder-shape" style="display:none">F.</div>`
      : `<div class="placeholder-shape">${String(index + 1).padStart(2, "0")}</div>`;
    const url = /^https?:\/\//i.test(p.url || "") ? p.url : "";
const platform = p.platform || "Shopee";
const shopButton = url
  ? `<a class="shop-link" href="${safeText(url)}" target="_blank" rel="noopener noreferrer sponsored">Shop on ${safeText(platform)} ↗</a>`
  : "";
    return `<article class="product-card">
      <div class="product-image">
  ${url ? `<a href="${safeText(url)}" target="_blank" rel="noopener noreferrer sponsored">${image}</a>` : image}
  <span class="product-tag">${safeText(p.tag || p.category)}</span></div>
      <div class="product-info"><p class="product-category">${safeText(p.category)}</p>
      <h3 class="product-name">${safeText(p.name)}</h3>
      <p class="product-description">${safeText(p.description)}</p>
      <div class="product-bottom"><span class="product-price">${safeText(p.price || "")}</span>
     ${shopButton}</div></div>
    </article>`;
  }).join("");
}
document.getElementById("categories").addEventListener("click", event => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".category").forEach(b => b.classList.toggle("active", b === button));
  renderProducts();
});
searchInput.addEventListener("input", renderProducts);
document.getElementById("year").textContent = new Date().getFullYear();
renderProducts();
