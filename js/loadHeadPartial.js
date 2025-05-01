function loadHeadPartial() {
  const script = document.currentScript;
  const baseDirectory = script.getAttribute('data-base');

  if (!baseDirectory) {
    console.error('No data-base attribute found on script tag.');
    return;
  }

  const headPath = `${baseDirectory}/partials/head.html`;
  const stylesheetPath = `${baseDirectory}/stylesheet.css`;

  // goofy way to load font awesome icons
  const loadFontAwesome = () => {
    if (!document.querySelector('script[src="https://kit.fontawesome.com/ac42e3d270.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://kit.fontawesome.com/ac42e3d270.js';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    loadFontAwesome();
    fetch(headPath)
      .then(response => response.text())
      .then(html => {
        const template = document.createElement('template');
        template.innerHTML = html;
        document.head.appendChild(template.content.cloneNode(true));
      })
      .catch(error => console.error(`Error loading head partial: ${error}`));
  });
}

loadHeadPartial();

