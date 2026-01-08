document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- ELEMENTS ---------------- */
  const dropdown = document.getElementById("group-dropdown");
  const trigger = dropdown?.querySelector(".group-dropdown-trigger");
  const label = dropdown?.querySelector(".group-dropdown-label");
  const menu = dropdown?.querySelector(".group-dropdown-menu");
  const arrow = trigger?.querySelector(".group-dropdown-arrow");
  const orderBtn = document.getElementById("toggle-order");
  const sortArrow = orderBtn?.querySelector(".arrow");
  const items = menu ? Array.from(menu.querySelectorAll("li")) : [];

  /* ---------------- DROPDOWN LOGIC ---------------- */
  function updateArrowPosition(index) {
    if (!arrow || index < 0) return;
    
    const item = items[index];
    const triggerRect = trigger.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    // Compute vertical offset relative to the button center
    const offset = itemRect.top + itemRect.height / 2 - (triggerRect.top + triggerRect.height / 2);

    arrow.style.transition = "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
    arrow.style.transform = `translateY(${offset}px) rotate(90deg)`;
  }

  function resetArrow() {
    if (!arrow) return;
    arrow.style.transition = "transform 0.25s ease";
    arrow.style.transform = "translateY(0) rotate(0deg)";
  }

  // Toggle Dropdown Open/Closed
  trigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle("open");
    trigger.setAttribute("aria-expanded", isOpen);

    if (isOpen) {
      const currentIndex = items.findIndex(li => li.dataset.group === window.OppState.mode);
      updateArrowPosition(currentIndex >= 0 ? currentIndex : 0);
    } else {
      resetArrow();
    }
  });

  // Handle Menu Item Selection
  menu?.addEventListener("click", (e) => {
    const item = e.target.closest("li");
    if (!item) return;

    // Update Global State
    window.OppState.mode = item.dataset.group;
    
    // Update UI Labels
    if (label) label.textContent = item.textContent;

    // Close Dropdown
    dropdown.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
    resetArrow();

    // Trigger the Renderer (from opps-renderer.js)
    if (window.renderOpportunities) {
      window.renderOpportunities();
    }
  });

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (dropdown && !dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
      trigger?.setAttribute("aria-expanded", "false");
      resetArrow();
    }
  });

  /* ---------------- SORT TOGGLE LOGIC ---------------- */
  
  orderBtn?.addEventListener("click", () => {
    // Update Global State
    window.OppState.chronological = !window.OppState.chronological;
    
    // Update Arrow Visuals
    sortArrow?.classList.toggle("up", !window.OppState.chronological);

    // Trigger the Renderer
    if (window.renderOpportunities) {
      window.renderOpportunities();
    }
  });

  // Optional: Initial arrow reset
  requestAnimationFrame(() => resetArrow());
});
