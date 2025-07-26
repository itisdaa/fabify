const selectedData = {
  purpose: [],
  material: [],
  detail: [],
  touches: []
};

function handleSelection(containerClass, key, allowMultiple = false) {
  const container = document.querySelector(`.options.${containerClass}`);
  const options = container.querySelectorAll("span");

  container.addEventListener("click", (e) => {
    if (e.target.tagName !== "SPAN") return;

    const value = e.target.textContent;

    if (allowMultiple) {
      e.target.classList.toggle("selected");

      const index = selectedData[key].indexOf(value);
      if (index === -1) {
        selectedData[key].push(value);
      } else {
        selectedData[key].splice(index, 1);
      }
    } else {
      options.forEach(opt => opt.classList.remove("selected"));
      e.target.classList.add("selected");
      selectedData[key] = [value];
    }

    console.log(selectedData);
  });
}

handleSelection("cyan", "purpose");
handleSelection("amber", "material");
handleSelection("green", "detail");
handleSelection("violet", "touches", true); // multi-select only for touches

document.getElementById("fileInput").addEventListener("change", function () {
  document.getElementById("screen1").classList.add("hidden");
  document.getElementById("screen2").classList.remove("hidden");
});

function submitData() {
  const specialNotes = document.getElementById("specialNotes").value.trim();

  // Validation: Check if 3 required fields are filled
  const missing = [];
  if (selectedData.purpose.length === 0) missing.push("Purpose");
  if (selectedData.material.length === 0) missing.push("Material");
  if (selectedData.detail.length === 0) missing.push("Detail Importance");

  if (missing.length > 0) {
    alert("Please select:\n- " + missing.join("\n- "));
    return;
  }

  // All good
  const fullData = {
    notes: specialNotes,
    ...selectedData
  };

  console.log("Submitted Data:", fullData);
  alert("Data captured in console. Ready for backend!");
}


document.getElementById("fileInput").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  // Convert file to blob URL for <view-3d>
  const fileURL = URL.createObjectURL(file);
  const viewer = document.getElementById("viewer");
  viewer.setAttribute("src", fileURL);

  document.getElementById("screen1").classList.add("hidden");
  document.getElementById("screen2").classList.remove("hidden");
});
