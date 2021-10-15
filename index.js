// Map init
var map = L.map('map').fitWorld();

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// JSON
const text = document.querySelector("#jsonTextarea");
var myLayer = L.geoJSON().addTo(map);

function update(str) {
    myLayer.clearLayers();
    myLayer.addData(JSON.parse(str));
}

function updateValue(e) {
    update(e.srcElement.value);
}
text.addEventListener('change', updateValue);
update(text.value);

// Copy to clipboard
document.querySelector("#copy").addEventListener("click", function () {
    text.select();
    document.execCommand("copy");
});
