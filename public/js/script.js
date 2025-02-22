const socket = io();

console.log("connected");

// navigator.geolocation.getCurrentPosition((position) => {
//   const {latitude, longitude} = position.coords;
//   console.log(latitude, longitude);
// });

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    const {latitude, longitude} = position.coords;
    socket.emit(
      "send-location",
      {latitude, longitude},
      () => {
        console.log("Location shared!");
      },
      (error) => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap Dhairya implementation",
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
  const {id, latitude, longitude} = data;
  map.setView([latitude, longitude], 16);

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

socket.on("user-disconnect", (id) => {
  if (!markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
