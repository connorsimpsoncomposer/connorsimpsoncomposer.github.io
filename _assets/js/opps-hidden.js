window.updateHidden = function (stagger = false) {
  const STORAGE_KEY = "composer_opps_hidden";
  const hidden = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const btn = document.getElementById("unhide-all");

  if (btn) {
    const isCurrentlyVisible = btn.classList.contains("animate-pop");

    if (hidden.length > 0 && !isCurrentlyVisible) {
      btn.classList.add("animate-pop");
    } else if (hidden.length === 0) {
      btn.classList.remove("animate-pop");
      btn.style.display = "none";
    }
  }

  document.querySelectorAll(".opportunity-card").forEach((card, index) => {
    const id = card.querySelector(".hide-btn")?.dataset.id;
    const wrapper = card.closest(".opportunity-card-wrapper");
    if (!id || !wrapper) return;

    const isCurrentlyHidden = hidden.includes(id);
    card.dataset.hidden = isCurrentlyHidden ? "true" : "false";

    if (isCurrentlyHidden) {
      wrapper.classList.add("is-hidden-state");
    } else {
      // If we are unhiding (Undo or Show All)
      if (stagger) {
        setTimeout(
          () => wrapper.classList.remove("is-hidden-state"),
          index * 40,
        );
      } else {
        wrapper.classList.remove("is-hidden-state");
      }
    }
  });
};

document.addEventListener("click", (e) => {
  const STORAGE_KEY = "composer_opps_hidden";

  // 1. HANDLE INDIVIDUAL HIDE
  const hideBtn = e.target.closest(".hide-btn");
  if (hideBtn) {
    const id = hideBtn.dataset.id;
    const wrapper = hideBtn.closest(".opportunity-card-wrapper");

    // Add to storage
    let hidden = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (!hidden.includes(id)) hidden.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hidden));

    // Create the Undo Pill
    const undoPill = document.createElement("div");
    undoPill.className = "undo-inline-pill";
    undoPill.innerHTML = `<button class="undo-action-btn" data-id="${id}">Undo ↶</button>`;

    // Insert pill and trigger collapse
    wrapper.before(undoPill);
    window.updateHidden();

    // Auto-remove pill after 5 seconds
    setTimeout(() => {
      if (undoPill.parentElement) undoPill.remove();
    }, 5000);
    return;
  }

  // 2. HANDLE THE UNDO BUTTON INSIDE THE PILL
  const undoBtn = e.target.closest(".undo-action-btn");
  if (undoBtn) {
    const id = undoBtn.dataset.id;
    const pill = undoBtn.closest(".undo-inline-pill");

    // Remove from storage
    let hidden = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    hidden = hidden.filter((itemId) => itemId !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hidden));

    // Restore the card immediately
    window.updateHidden();

    // Remove the pill
    if (pill) pill.remove();
    return;
  }

  // 3. HANDLE SHOW ALL HIDDEN (RESET)
  if (e.target.closest("#unhide-all")) {
    localStorage.removeItem(STORAGE_KEY);
    window.updateHidden(true); // Stagger back in

    // Refresh counter
    const searchInput = document.getElementById("search-input");
    if (searchInput)
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
});
