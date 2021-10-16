// Map init
var map = L.map('map', {
  preferCanvas: true
}).fitWorld();

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.attributionControl.setPosition('bottomleft');
map.zoomControl.setPosition('bottomright');


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
var editor = ace.edit("editor", {
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
info.setPosition('bottomright');

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

// File
const fileSelect = document.getElementById("fileSelect"),
  fileElem = document.getElementById("fileElem");

fileSelect.addEventListener("click", function (e) {
  if (fileElem) {
    fileElem.click();
  }
}, false);

fileElem.addEventListener("change", handleFiles, false);
function handleFiles() {
  const files = fileElem.files;
  if (files.length !== 0) {
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        editor.setValue(reader.result);
      };

      reader.readAsText(file);
    }
  }
}
