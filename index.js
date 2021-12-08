// Map init
const attribution = new ol.control.Attribution({
    collapsible: false
});

const vectorLayer = new ol.layer.VectorTile();

class InfoControl extends ol.control.Control {
    constructor(opt_options) {
        const options = opt_options || {};

        const element = document.createElement('div');
        element.id = 'info';
        element.className = 'ol-unselectable ol-control';

        super({
            element: element,
            target: options.target,
        });
    }
}

class ZoomControl extends ol.control.Control {
    constructor(opt_options) {
        const options = opt_options || {};

        const element = document.createElement('div');
        element.id = 'zoom-info';
        element.className = 'ol-unselectable ol-control';

        super({
            element: element,
            target: options.target,
        });
    }
}

class FitControl extends ol.control.Control {
    constructor(opt_options) {
        const options = opt_options || {};

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.innerHTML = 'Fit';

        const element = document.createElement('div');
        element.className = 'fit-button ol-unselectable ol-control';
        element.appendChild(button);

        super({
            element: element,
            target: options.target,
        });

        button.addEventListener('click', this.handle.bind(this), false);
    }

    handle() {
        this.getMap().getView().fit(new ol.source.Vector({
            features: new ol.format.GeoJSON().readFeatures(editor.getValue(), {
                featureProjection: map.getView().getProjection(),
            }),
        }).getExtent());
    }
}

class JsonControl extends ol.control.Control {
    constructor(opt_options) {
        const options = opt_options || {};

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-bs-toggle', 'collapse');
        button.setAttribute('data-bs-target', '#collapseJson');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', 'collapseJson');
        button.innerHTML = 'JSON';

        const element = document.createElement('div');
        element.className = 'json-button ol-unselectable ol-control';
        element.appendChild(button);

        super({
            element: element,
            target: options.target,
        });
    }
}

const map = new ol.Map({
    controls: ol.control.defaults({ attribution: false }).extend([
        attribution,
        new ol.control.ScaleLine(),
        new InfoControl(),
        new ol.control.FullScreen({
            source: 'fullscreen',
        }),
        new ZoomControl(),
        new FitControl(),
        new JsonControl(),
    ]),
    interactions: ol.interaction.defaults().extend([new ol.interaction.DragRotateAndZoom()]),
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        vectorLayer,
    ],
    target: 'map',
    view: new ol.View({
        center: [0.0, 0.0],
        zoom: 0,
    })
});

function checkSize() {
    const small = map.getSize()[0] < 600;
    attribution.setCollapsible(small);
    attribution.setCollapsed(small);
}

window.addEventListener('resize', checkSize);
checkSize();

function showZoom() {
    document.getElementById('zoom-info').innerHTML = 'Zoom level: ' + map.getView().getZoom().toFixed(4);
}
showZoom();

var currZoom = map.getView().getZoom();
map.on('moveend', function (e) {
    var newZoom = map.getView().getZoom();
    if (currZoom != newZoom) {
        showZoom(newZoom);
        currZoom = newZoom;
    }
});


// JSON
const replacer = function (key, value) {
    if (value.geometry) {
        let type;
        const rawType = value.type;
        let geometry = value.geometry;

        if (rawType === 1) {
            type = 'MultiPoint';
            if (geometry.length == 1) {
                type = 'Point';
                geometry = geometry[0];
            }
        } else if (rawType === 2) {
            type = 'MultiLineString';
            if (geometry.length == 1) {
                type = 'LineString';
                geometry = geometry[0];
            }
        } else if (rawType === 3) {
            type = 'Polygon';
            if (geometry.length > 1) {
                type = 'MultiPolygon';
                geometry = [geometry];
            }
        }

        return {
            'type': 'Feature',
            'geometry': {
                'type': type,
                'coordinates': geometry,
            },
            'properties': value.tags,
        };
    } else {
        return value;
    }
};

var json;
function update(str) {
    try {
        json = JSON.parse(str);
        vectorLayer.setSource(null);

        const tileIndex = geojsonvt(json, {
            maxZoom: 24,
            extent: 4096,
            debug: 1,
        });
        const format = new ol.format.GeoJSON({
            dataProjection: new ol.proj.Projection({
                code: 'TILE_PIXELS',
                units: 'tile-pixels',
                extent: [0, 0, 4096, 4096],
            }),
        });
        const vectorSource = new ol.source.VectorTile({
            tileUrlFunction: function (tileCoord) {
                return JSON.stringify(tileCoord);
            },
            tileLoadFunction: function (tile, url) {
                const tileCoord = JSON.parse(url);
                const data = tileIndex.getTile(
                    tileCoord[0],
                    tileCoord[1],
                    tileCoord[2]
                );
                const geojson = JSON.stringify(
                    {
                        type: 'FeatureCollection',
                        features: data ? data.features : [],
                    },
                    replacer
                );
                const features = format.readFeatures(geojson, {
                    extent: vectorSource.getTileGrid().getTileCoordExtent(tileCoord),
                    featureProjection: map.getView().getProjection(),
                });
                tile.setFeatures(features);
            },
        });

        vectorLayer.setSource(vectorSource);
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

function resize() {
    map.updateSize();
    checkSize();
    editor.resize();
}
document.getElementById('collapseJson').addEventListener('shown.bs.collapse', resize);
document.getElementById('collapseJson').addEventListener('hidden.bs.collapse', resize);

// File
const fileSelect = document.getElementById("fileSelect"),
    fileElem = document.getElementById("fileElem");

fileSelect.addEventListener("click", function (e) {
    if (fileElem)
        fileElem.click();
}, false);

fileElem.addEventListener("change", function (e) {
    handleFiles(fileElem.files);
}, false);

function handleFiles(files) {
    if (files.length !== 0) {
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = () => {
                editor.setValue(reader.result);

                map.getView().fit(new ol.source.Vector({
                    features: new ol.format.GeoJSON().readFeatures(editor.getValue(), {
                        featureProjection: map.getView().getProjection(),
                    }),
                }).getExtent());
            };

            reader.readAsText(file);
        }
    }
}

// Drag and drop
document.addEventListener("dragenter", drag, false);
document.addEventListener("dragover", drag, false);
document.addEventListener("drop", drop, false);

function drag(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    const dt = e.dataTransfer;
    const files = dt.files;

    handleFiles(files);
}

// File Download
function handleDownload() {
    document.getElementById("download").href = window.URL.createObjectURL(new Blob([editor.getValue()], { "type": "application/geo+json" }));
}

// displayFeatureInfo
const displayFeatureInfo = function (pixel) {
    const features = [];
    map.forEachFeatureAtPixel(pixel, function (feature) {
        features.push(feature);
    });
    if (features.length > 0) {
        const info = [];
        let i, ii;
        for (i = 0, ii = features.length; i < ii; ++i) {
            info.push(features[i].get('name'));
        }
        document.getElementById('info').innerHTML = info.join(', ') || '&nbsp';
    } else {
        document.getElementById('info').innerHTML = '&nbsp;';
    }
};

map.on('pointermove', function (evt) {
    if (evt.dragging) {
        return;
    }
    const pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
});

map.on('click', function (evt) {
    displayFeatureInfo(evt.pixel);
});
