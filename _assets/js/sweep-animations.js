window.sweepCards = function(wrappers, callback) {
  if (wrappers.length === 0) {
    callback();
    return;
  }

  // Fade and slide OUT
  wrappers.forEach((wrapper, i) => {
    wrapper.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    wrapper.style.transform = `translateX(${i % 2 === 0 ? "120%" : "-120%"})`;
    wrapper.style.opacity = "0";
  });

  setTimeout(() => {
    callback();

    // Find the container
    const isGrouped = window.OppState.mode !== "none";
    const container = isGrouped 
      ? document.querySelector(".opportunity-groups") 
      : document.querySelector(".opportunity-flat");
    
    const newWrappers = window.OppState.getWrappers(container);

    // Prepare and slide IN
    newWrappers.forEach((wrapper, i) => {
      wrapper.style.transition = "none";
      wrapper.style.transform = `translateX(${i % 2 === 0 ? "-120%" : "120%"})`;
      wrapper.style.opacity = "0";
      
      void wrapper.offsetWidth; // Force reflow
      
      wrapper.style.transition = "transform 0.4s ease-out, opacity 0.4s ease-out";
      wrapper.style.transform = "translateX(0)";
      wrapper.style.opacity = "1";
    });
  }, 350 + (wrappers.length > 20 ? 100 : wrappers.length * 20)); // Cap the stagger delay
};
