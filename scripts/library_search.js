const filters = ["Cat 1", "Cat 2", "Cat 3", "Cat 4", "Cat 5", "Cat 6", "Cat 7", "Cat 8", "Cat 9", "Cat 10"];
let selectedFilters = [];

document.getElementById("searchBtn").addEventListener("click", () => {
  document.getElementById("searchBox").classList.toggle("hidden");
  document.querySelector(".buttons").remove();
  showFilters();
});

function showFilters() {
  const container = document.getElementById("filterTags");
  container.innerHTML = "";

  filters.forEach(filter => {
    const tag = document.createElement("div");
    tag.className = "filter-tag";
    tag.innerText = filter;

    if (selectedFilters.includes(filter)) {
      tag.classList.add("active");
    }

    tag.onclick = () => {
      if (selectedFilters.includes(filter)) {
        // Remove from selected
        selectedFilters = selectedFilters.filter(f => f !== filter);
      } else {
        // Add to selected
        selectedFilters.push(filter);
      }
      showFilters();
    };

    container.appendChild(tag);
  });
}

function performSearch() {
  const searchTerm = document.getElementById("searchInput").value.trim();
  const selectedText = selectedFilters.length > 0 ? selectedFilters.join(", ") : "All";
  alert(`Searching "${searchTerm}" in categories: ${selectedText}`);
}
