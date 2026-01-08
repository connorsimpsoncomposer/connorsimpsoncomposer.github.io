window.updateFavorites = function () {
  const favorites = JSON.parse(localStorage.getItem("composer_opps_favorites")) || [];
  const favCountLabel = document.getElementById("fav-count");
  const actionsPod = document.getElementById("favorites-actions");
  const favFilterPill = document.querySelector(".favorite-pill"); // The Label container
  
  // 1. Sync the Cards
  document.querySelectorAll(".favorite-btn").forEach((btn) => {
    const card = btn.closest(".opportunity-card");
    if (!card) return;
    const isFav = favorites.includes(btn.dataset.id);
    
    btn.classList.toggle("is-active", isFav);
    card.dataset.favorite = isFav ? "true" : "false";
  });

  // 2. Update the Count Label
  if (favCountLabel) {
    favCountLabel.textContent = `(${favorites.length})`;
  }

  // 3. Toggle Visibility of the Filter Pill and Action Pod
  // We only show these if the user actually has favorites
  if (favorites.length > 0) {
    if (favFilterPill) favFilterPill.style.display = "inline-flex";
    if (actionsPod) {
      actionsPod.style.display = "flex";
      actionsPod.classList.add("animate-pop");
    }
  } else {
    if (favFilterPill) favFilterPill.style.display = "none";
    if (actionsPod) {
      actionsPod.style.display = "none";
      actionsPod.classList.remove("animate-pop");
    }
    // If the favorites filter was active, turn it off since list is empty
    const favCheckbox = document.getElementById("show-favorites-only");
    if (favCheckbox) favCheckbox.checked = false;
  }
};

window.clearAllFavorites = function () {
  const favorites = JSON.parse(localStorage.getItem("composer_opps_favorites")) || [];
  if (favorites.length === 0) return;

  if (confirm(`Remove all ${favorites.length} favorites?`)) {
    localStorage.removeItem("composer_opps_favorites");
    window.updateFavorites();
    // Refresh the view
    document.getElementById("search-input")?.dispatchEvent(new Event("input", { bubbles: true }));
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Handle Star Button Clicks
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".favorite-btn");
    if (!btn) return;

    const id = btn.dataset.id;
    let favorites = JSON.parse(localStorage.getItem("composer_opps_favorites")) || [];

    favorites = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    
    localStorage.setItem("composer_opps_favorites", JSON.stringify(favorites));

    window.updateFavorites();
    
    // Trigger filter refresh
    document.getElementById("search-input")?.dispatchEvent(new Event("input", { bubbles: true }));
  });

  // Handle the Filter Toggle
  // Note: We use "change" because it is now a checkbox
  document.getElementById("show-favorites-only")?.addEventListener("change", () => {
    document.getElementById("search-input")?.dispatchEvent(new Event("input", { bubbles: true }));
  });

  window.updateFavorites();
});
