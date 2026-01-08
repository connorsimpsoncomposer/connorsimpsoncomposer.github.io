document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const toggles = document.querySelectorAll(
    ".filter-toggles input:not(#show-favorites-only)",
  );
  const favCheckbox = document.getElementById("show-favorites-only");
  const clearBtn = document.getElementById("clear-filters");
  const counter = document.getElementById("results-counter");

  const applyAllFilters = () => {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    // 1. Get standard attribute filters (travel, funding, etc.)
    const activeAttributeFilters = Array.from(toggles)
      .filter((t) => t.checked)
      .map((t) => t.dataset.filter);

    // 2. Check the Favorite checkbox state
    const isFavoriteFilterOn = favCheckbox && favCheckbox.checked;

    const allActiveCards = window.OppState.getCards().filter(
      (c) => !c.classList.contains("is-archived"),
    );

    let visibleCount = 0;
    const isFiltered =
      activeAttributeFilters.length > 0 || query !== "" || isFavoriteFilterOn;

    if (clearBtn) clearBtn.style.display = isFiltered ? "inline-flex" : "none";
    if (counter) counter.style.display = isFiltered ? "block" : "none";

    allActiveCards.forEach((card) => {
      const wrapper = card.closest(".opportunity-card-wrapper");
      if (!wrapper) return;

      const content = card.textContent.toLowerCase();
      const matchesSearch = content.includes(query);
      const isHidden = card.dataset.hidden === "true";
      const isFavorite = card.dataset.favorite === "true";

      // 3. Logic: Check standard attributes (travel, funding, etc.)
      const matchesAttributes = activeAttributeFilters.every(
        (filter) => card.dataset[filter] === "true",
      );

      // 4. Logic: Check the Favorites filter
      const matchesFavoriteToggle = isFavoriteFilterOn ? isFavorite : true;

      const satisfiesFilters =
        matchesSearch && matchesAttributes && matchesFavoriteToggle;
      const shouldBeVisible = satisfiesFilters && !isHidden;

      // Apply visibility
      if (shouldBeVisible) {
        wrapper.style.display = "block";
        visibleCount++;
      } else {
        wrapper.style.display = "none";
      }
    });

    // Update Counter Text
    if (counter && isFiltered) {
      counter.textContent =
        visibleCount === 0
          ? `No matching opportunities found.`
          : `Showing ${visibleCount} of ${allActiveCards.length} matching opportunities`;
    }

    // Hide empty category groups
    document.querySelectorAll(".opportunity-category").forEach((group) => {
      const visibleInGroup = group.querySelectorAll(
        ".opportunity-card-wrapper[style*='display: block']",
      );
      group.style.display =
        visibleInGroup.length === 0 && isFiltered ? "none" : "block";
    });
  };

  // Event Listeners
  searchInput?.addEventListener("input", applyAllFilters);
  toggles.forEach((t) => t.addEventListener("change", applyAllFilters));
  favCheckbox?.addEventListener("change", applyAllFilters);

  clearBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (searchInput) searchInput.value = "";
    toggles.forEach((t) => (t.checked = false));
    if (favCheckbox) favCheckbox.checked = false;

    applyAllFilters();
    searchInput?.focus();
  });

  applyAllFilters();
});
