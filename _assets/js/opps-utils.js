window.getDeadlineText = function (deadlineStr) {
  if (!deadlineStr) return "";

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset time to midnight for clean day-counting

  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Past Due";
  if (diffDays === 0) return "Due Today";
  if (diffDays === 1) return "Due Tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays} days`;

  return "";
};

window.OppState = {
  chronological: true,
  mode: "none",
  getCards: () => Array.from(document.querySelectorAll(".opportunity-card")),
  getWrappers: (container) =>
    Array.from(container.querySelectorAll(".opportunity-card-wrapper")),

  sort: (arr) => {
    return arr.sort((a, b) => {
      // Use the pre-existing data-deadline from your Liquid template
      const dateA = a.dataset.deadline || "9999-12-31";
      const dateB = b.dataset.deadline || "9999-12-31";
      return window.OppState.chronological
        ? dateA.localeCompare(dateB)
        : dateB.localeCompare(dateA);
    });
  },
};


document.addEventListener("DOMContentLoaded", () => {
  const flatContainer = document.querySelector(".opportunity-flat");
  if (!flatContainer) return;

  const allCards = window.OppState.getCards();
  allCards.forEach((card) => {
    if (!card.closest(".opportunity-card-wrapper")) {
      const wrapper = document.createElement("div");
      wrapper.className = "opportunity-card-wrapper";
      card.parentNode.insertBefore(wrapper, card);
      wrapper.appendChild(card);
    }
    window.initializeCardMetadata(card);
  });

  const activeCards = allCards.filter(
    (c) => !c.classList.contains("is-archived"),
  );
  const sorted = window.OppState.sort(activeCards);

  const fragment = document.createDocumentFragment();
  sorted.forEach((card) => {
    const wrap = card.closest(".opportunity-card-wrapper");
    if (wrap) fragment.appendChild(wrap);
  });

  flatContainer.innerHTML = "";
  flatContainer.appendChild(fragment);

  if (window.updateFavorites) window.updateFavorites();
  if (window.updateHidden) window.updateHidden();

  document
    .getElementById("search-input")
    ?.dispatchEvent(new Event("input", { bubbles: true }));
});
