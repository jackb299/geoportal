import maplibregl from "maplibre-gl"
import { VT_URL, WMS_URL } from "../config"

import { LocalGeoJSONs } from './Geojsons'
export function addLayersToMap(layerData, map) {
    /** 
    * A function to add a given set of layers to a provided MapLibre map. The data is parsed in as a list of Objects with a set structure available within the README of this repo.
    * @param {Object} layerData - An Object containing all the information necessary to add the layer correctly to the map. The structure of this Object is available within the README of this repo.
    */
    
    for (var layer of layerData.layers) {
        // Add sources depending whether the source is a WMS, Vector Tile (VT) or a local GeoJSON (GEOJSON)
        if (layer.type === 'VT') {
            map.addSource(layer.style.source, {
                'type': "vector",
                // If the sourceData url is VT_URL (i.e. using a lot of sources from one place) then use that and specify the layer name) else just use the URL as standard
                'tiles': [
                    (layer.sourceData.url === "VT_URL" ? VT_URL.replace("LAYERNAME", layer.sourceData.layerName) : layer.sourceData.url)
                ],
                'minZoom': 0,
                'maxZoom': 20
            });
        } else if (layer.type === 'WMS') {
            map.addSource(layer.style.source, {
                'type': 'raster',
                // If the sourceData url is WMS_URL (i.e. using a lot of sources from one place) then use that and specify the layer name) else just use the URL as standard
                'tiles': [
                    (layer.sourceData.url === "WMS_URL" ? WMS_URL.replace("LAYERNAME", layer.sourceData.layerName) : layer.sourceData.url)
                ],
                'tileSize': 256
            });
        } else if (layer.type === 'GEOJSON') {
            map.addSource(layer.style.source, {
                'type': 'geojson',
                'data': LocalGeoJSONs[layer.style.id]
            })
        }

        // Add layers to the map
        map.addLayer(
            layer.style
        );
    }
}

export function addPopupsToMap(layerData, popupData, map) {
    /** 
    * A function to generate the necessary HTML for the Popups, based on the layer clicked.
    * @param {Object} layerData - An Object containing all the information necessary to add the layer correctly to the map. The structure of this Object is available within the README of this repo.
    * @param {Object} popupData - An Object containing all the popup information necessary to generate the correct HTML to add to the map. The structure of this Object is available within the README of this repo.
    */

    // Check if the layer clicked on actually has valid popups, if not, do not create them
    if (layerData.id in popupData ) {

        // Handle if the layer has a popup override, usually used when multiple layers share the same popup style and columns.
        var popupInfo = {};
        if (layerData.hasOwnProperty('popupOverrideName')) {
            popupInfo = popupData[layerData.popupOverrideName]
        }
        else {
            popupInfo = popupData[layerData.id]
        }

        // Use the map's click event handler to place a popup at the coordinates clicked
        map.on("click", layerData.id, (e) => {

            // Build the HTML that will display the Main Label of the popup
            var popupHTML =
                `<h3>${e.features[0].properties[popupInfo.mainLabel]}</h3>
                <ul>`;

            // Add list elements for each of the fields contained within popupInfo
            for (var value of popupInfo.popups) {
                popupHTML += '<li>' + value.text + ': ' + e.features[0].properties[value.property] + '</li>'
            }

            // Close the html list
            popupHTML += '</ul>'

            // Create the popup object that Maplibre interfaces with
            new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popupHTML)
                .addTo(map)
        })

        // Change the mouse pointer type when entering the area of a layer that has popups
        map.on("mouseenter", layerData.id, () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on("mouseleave", layerData.id, () => {
            map.getCanvas().style.cursor = '';
        });
    }
}

export function transformTileUrl(url) {
    /** 
    * A function to generate the necessary URL for the OS API for the MapLibre Map due to the default for OS Maps being in EPSG:27700
    * @param {string} url - The url that the MapLibre map is sending
    * @return {string} Formatted URL with the correct alterations.
    */
    // Check that the URL is that of a tile request, if so, append the SRS information.
    if (url.includes('api.os.uk/maps/vector/v1/vts/tile')) {
        return {
            url: url + '&srs=3857'
        }
    }
        
    // Otherwise, just add the correct SRS to the resource
    if (url.includes('https://api.os.uk/maps/vector/v1/vts/resources')) {
        return {
            url: url + '&srs=3857'
        }
    }
}