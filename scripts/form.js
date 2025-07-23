document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("printForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const entries = Object.fromEntries(formData.entries());

        // Display dictionary in console tab
        console.log("Form Submission:", entries);

        // Basic validation alert (TO CHANGE after db integration)
        alert("Form is validated and data is captured. Ready for integration.");
    });
});
