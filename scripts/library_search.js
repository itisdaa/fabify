const filterContainer = document.getElementById('filter-tags');
const btnLeft = document.getElementById('scroll-left');
const btnRight = document.getElementById('scroll-right');

let selectedFilters = []; // store selected filter names

// Scroll events
btnLeft.addEventListener('click', () => {
  filterContainer.scrollBy({ left: -150, behavior: 'smooth' });
});

btnRight.addEventListener('click', () => {
  filterContainer.scrollBy({ left: 150, behavior: 'smooth' });
});

// Check button states
function updateButtonState() {
  btnLeft.disabled = filterContainer.scrollLeft <= 0;
  const maxScrollLeft = filterContainer.scrollWidth - filterContainer.clientWidth;
  btnRight.disabled = filterContainer.scrollLeft >= maxScrollLeft - 1;
}

filterContainer.addEventListener('scroll', updateButtonState);
window.addEventListener('load', updateButtonState);

// Handle filter selection
document.querySelectorAll('#filter-tags .filter').forEach(filter => {
  filter.addEventListener('click', () => {
    const filterName = filter.textContent.trim();

    // Toggle selection
    filter.classList.toggle('selected');

    if (filter.classList.contains('selected')) {
      selectedFilters.push(filterName);
    } else {
      selectedFilters = selectedFilters.filter(f => f !== filterName);
    }

    console.log("Selected Filters:", selectedFilters);
  });
});
