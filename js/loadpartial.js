// this function loads partial html files for insertion into other html files
// input is file name/path
function loadPartial(id, filename) {
  fetch(filename)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    })
    .catch(error => console.error(`Error loading ${filename}:`, error));
}
