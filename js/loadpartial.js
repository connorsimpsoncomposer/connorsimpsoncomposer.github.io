// this function loads partial html files for insertion into other html files
// input is file name/path
// loadpartial.js
function loadPartial(id, filename) {
  fetch(filename)
    .then((response) => response.text())
    .then((data) => {
      const target = document.getElementById(id);
      if (target) {
        target.innerHTML = data;
      }
    })
    .catch((error) => console.error(`Error loading ${filename}:`, error));
}
