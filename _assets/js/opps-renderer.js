window.initializeCardMetadata = function (card) {
  // 1. Get Today at absolute Midnight Local Time
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  const deadlineAttr = card.dataset.deadline;
  if (!deadlineAttr) return;

  // 2. Parse Deadline safely as Local Time (YYYY/MM/DD)
  // Replacing - with / prevents JS from assuming UTC
  const dateParts = deadlineAttr.split("-");
  const deadlineDate = new Date(
    dateParts[0],
    dateParts[1] - 1,
    dateParts[2],
  ).getTime();

  // 3. Calculate Day Difference
  const diffDays = Math.round((deadlineDate - today) / (1000 * 60 * 60 * 24));

  const badgeContainer = card.querySelector(".opportunity-title");
  card.querySelector(".due-soon-badge")?.remove();

  // --- LOGIC ---
  if (diffDays >= 0 && diffDays <= 7) {
    const badge = document.createElement("span");
    badge.className = "due-soon-badge";

    let label = "";
    if (diffDays === 0) {
      label = "Due Today";
      badge.classList.add("is-urgent");
    } else if (diffDays === 1) {
      label = "Due Tomorrow";
    } else {
      label = `Due in ${diffDays} days`;
    }

    badge.innerHTML = `
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" style="display:inline; vertical-align:middle; margin-right:2px;">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg> ${label}
    `;
    badgeContainer?.appendChild(badge);

    // Safety: Remove archive class if it was accidentally added
    card.classList.remove("is-archived");
  }

  // Only archive if it is strictly LESS than 0 (Yesterday or older)
  if (diffDays < 0) {
    card.classList.add("is-archived");
  }
};

window.renderOpportunities = function () {
  const flat = document.querySelector(".opportunity-flat");
  const grouped = document.querySelector(".opportunity-groups");
  const mode = window.OppState.mode;

  const allCards = window.OppState.getCards();
  const activeCards = allCards.filter(
    (c) => !c.classList.contains("is-archived"),
  );

  const currentVisibleContainer =
    flat.style.display !== "none" ? flat : grouped;
  const currentWrappers = window.OppState.getWrappers(currentVisibleContainer);

  window.sweepCards(currentWrappers, () => {
    // --- STEP 1: DOM RESTRUCTURING ---
    if (mode === "none") {
      grouped.style.display = "none";
      flat.style.display = "block";

      window.OppState.sort(activeCards).forEach((card) => {
        const wrap = card.closest(".opportunity-card-wrapper");
        if (wrap) flat.appendChild(wrap);
      });
    } else {
      grouped.innerHTML = "";
      flat.style.display = "none";
      grouped.style.display = "block";

      const groups = {};
      activeCards.forEach((card) => {
        const key = card.dataset[mode] || "Unspecified";
        (groups[key] ||= []).push(card);
      });

      Object.entries(groups).forEach(([name, items]) => {
        const details = document.createElement("details");
        details.className = "opportunity-category";
        details.open = true;
        details.innerHTML = `
          <summary class="opportunity-category-header">
            <h2>${name}</h2>
          </summary>
          <div class="opportunity-category-list"></div>
        `;

        const list = details.querySelector(".opportunity-category-list");
        window.OppState.sort(items).forEach((card) => {
          const wrap = card.closest(".opportunity-card-wrapper");
          if (wrap) list.appendChild(wrap);
        });
        grouped.appendChild(details);
      });
    }

    // --- STEP 2: METADATA & BADGE INITIALIZATION ---
    // Run this on all cards now that they are in their new positions
    document.querySelectorAll(".opportunity-card").forEach((card) => {
      window.initializeCardMetadata(card);
    });

    // --- STEP 3: STATE UPDATES & FILTERS ---
    if (window.updateFavorites) window.updateFavorites();
    if (window.updateHidden) window.updateHidden();

    // CRITICAL: Explicitly check the favorites filter state
    const favCheckbox = document.getElementById("show-favorites-only");
    const isFavFilterActive = favCheckbox ? favCheckbox.checked : false;

    // Trigger the actual filtering logic
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      // Dispatch the event to ensure the filter script catches the new DOM elements
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
};
