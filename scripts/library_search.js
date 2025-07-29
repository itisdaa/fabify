const catButtons = document.querySelectorAll('.cat-button:not(.nav)');
const searchInput = document.getElementById('searchInput');
const selectedCategories = new Set();

catButtons.forEach(button => {
  button.addEventListener('click', () => {
    const cat = button.getAttribute('data-cat');
    if (selectedCategories.has(cat)) {
      selectedCategories.delete(cat);
      button.classList.remove('active');
    } else {
      selectedCategories.add(cat);
      button.classList.add('active');
    }
    console.log("Selected categories:", [...selectedCategories]);
  });
});

function scrollCats(direction) {
  const container = document.getElementById('categoryScroll');
  const scrollAmount = window.innerWidth < 600 ? 100 : 150;
  container.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  });
}

function handleSearch() {
  console.log("Search clicked with:", searchInput.value);
}

searchInput.addEventListener('input', (e) => {
  console.log('Current search:', e.target.value);
});