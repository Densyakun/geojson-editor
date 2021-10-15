// Map init
var map = L.map('map').fitWorld();
function invalidateSize() {
    map.invalidateSize();
}
document.getElementById('collapseJson').addEventListener('shown.bs.collapse', invalidateSize);
document.getElementById('collapseJson').addEventListener('hidden.bs.collapse', invalidateSize);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// JSON
const text = document.querySelector("#jsonTextarea");
var myLayer = L.geoJSON().addTo(map);

var json;
function update(str) {
    try {
        json = JSON.parse(str);
        myLayer.clearLayers();
        myLayer.addData(json);
    } catch (error) { }
}

function updateValue(e) {
    update(e.srcElement.value);
}
text.addEventListener('input', updateValue);
update(text.value);

// Copy to clipboard
document.querySelector("#copy").addEventListener("click", function () {
    text.select();
    document.execCommand("copy");
});

// Add control
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseJson" aria-expanded="false" aria-controls="collapseJson">JSON</button>';
};

info.addTo(map);
