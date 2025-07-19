let sellersDB = [];

// Load the seller database
fetch('../src/data/temp-AMS-Database.json')
  .then(res => res.json())
  .then(data => {
    sellersDB = data;
  })
  .catch(err => {
    console.error("Failed to load seller database:", err);
  });


// get user location function (using navigator.geolocation)
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
    } else {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({
          lat: pos.coords.latitude,
          long: pos.coords.longitude
        }),
        err => reject("Location access denied")
      );
    }
  });
}

// Haversine formula to get distance between 2 points
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km

  // Convert all to float to ensure no accidental string math
  lat1 = parseFloat(lat1);
  lon1 = parseFloat(lon1);
  lat2 = parseFloat(lat2);
  lon2 = parseFloat(lon2);

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}


document.getElementById("search").addEventListener("click", async () => {
  const selectedProcess = document.getElementById("process").value;

  //maximum distance is infinite by default
  const maxRate = parseInt(document.getElementById("rate").value) || Infinity;

  let userLocation;

  try {
    userLocation = await getUserLocation();
  } catch (err) {
    alert(err);
    return;
  }

  const filtered = sellersDB
    .filter(seller => {
      const hasProcess =
        selectedProcess === "both" ||
        seller.availableProcces.includes(selectedProcess);

      return hasProcess && seller.rate <= maxRate;
    })
    .map(seller => ({
      ...seller,
      distance: getDistanceKm(
        userLocation.lat,
        userLocation.long,
        seller.location.lat,
        seller.location.long
      )
    }))
    .sort((a, b) => a.distance - b.distance);

  renderResults(filtered);
});

// render results
function renderResults(sellers) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (sellers.length === 0) {
    container.innerHTML = "<p>No sellers found.</p>";
    return;
  }

  sellers.forEach(seller => {
    const card = document.createElement("div");
    card.className = "seller-card";

    // Format WhatsApp link
    const contact = seller.contact.trim();
    const contactForWA = contact.startsWith('+') ? contact.slice(1) : contact;
    const waLink = `https://wa.me/${contactForWA}`;

    card.innerHTML = `
      <strong>${seller.name}</strong><br>
      <a href="${waLink}" target="_blank" style="color:green; text-decoration:none;">
        ${contact}
      </a><br>
      Rs ${seller.rate} 
      <span style="float:right; font-size: 0.9em;">
        ~ ${seller.distance.toFixed(1)} km
      </span>
    `;

    container.appendChild(card);
  });
}