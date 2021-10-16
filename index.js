// Map init
var map = L.map('map').fitWorld();

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// JSON
var myLayer = L.geoJSON().addTo(map);

var json;
function update(str) {
    try {
        json = JSON.parse(str);
        myLayer.clearLayers();
        myLayer.addData(json);
    } catch (error) { }
}

// Ace Editor
ace.config.set('basePath', 'https://pagecdn.io/lib/ace/1.4.12/');
var editor = ace.edit("collapseJson", {
    mode: "ace/mode/json",
    selectionStyle: "text"
})
editor.setOptions({
    autoScrollEditorIntoView: true,
    copyWithEmptySelection: true,
});
editor.setOption("mergeUndoDeltas", "always");

editor.setTheme("ace/theme/monokai");

editor.setValue('{\n' +
    '    "type": "Feature",\n' +
    '    "geometry": {\n' +
    '      "type": "Point",\n' +
    '      "coordinates": [125.6, 10.1]\n' +
    '    },\n' +
    '    "properties": {\n' +
    '      "name": "Dinagat Islands"\n' +
    '    }\n' +
    '}');

editor.session.on('change', function (delta) {
    update(editor.getValue());
});
update(editor.getValue());

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

function resize() {
    map.invalidateSize();
    editor.resize();
}
document.getElementById('collapseJson').addEventListener('shown.bs.collapse', resize);
document.getElementById('collapseJson').addEventListener('hidden.bs.collapse', resize);
