// Import Components 
import { useContext, useEffect, useState, createContext } from "react";
import maplibregl from "maplibre-gl"
import 'maplibre-gl/dist/maplibre-gl.css';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';

// Import Functions
import { addLayersToMap, addPopupsToMap, transformTileUrl } from "../libraries/MapFunctions"

// Import Data
import { API_KEY, BG_URL } from "../config";
import layerJSON from '../data/layerData.json'
import popupJSON from '../data/popupData.json'
import { Images } from '../libraries/Images'

// Create a Map Context to give multiple components access to the Map, regardless of the depenency tree within the DOM
export const MapContext = createContext();

export const MapProvider = ({ children }) => {
    const [map, setMap] = useState(null);

    useEffect(() => {

        // Max boundary available to the map in WGS84
        const bounds = [
            [ -8.82, 49.79 ],
            [  2.92, 60.94 ]
        ]

        const newMap = new maplibregl.Map({
            container: 'map-container',
            style: (
                // Add the style for the background map. Configureable in config.js
                BG_URL.includes('API_KEY') ? BG_URL.replace('API_KEY', API_KEY) : BG_URL
            ),
            center: [-0.98, 51.95], // starting position [lng, lat]
            zoom: 7, // starting zoom
            maxBounds: bounds, // Geographical boundary for map
            maxZoom: 15,
            minZoom: 5,
            attributionControl: false,
            transformRequest: url => (
                BG_URL.includes('api.os.uk') ? transformTileUrl(url) : null
            )
        })

        // Adding Scalebar, ruler, and OS Attribution
        newMap.addControl(new maplibregl.ScaleControl());
        if (BG_URL.includes("api.os.uk")) {
            newMap.addControl(new maplibregl.AttributionControl({
                customAttribution: 'Contains OS data © Crown copyright and database rights 2023'
            }));
        }

        // Adding open source geocoding to replace Mapbox's paid version
        const geocoderApi = {
            forwardGeocode: async (config) => {
                const features = [];
                try {
                    const request =
                `https://nominatim.openstreetmap.org/search?q=${
                    config.query
                }&format=geojson&polygon_geojson=1&addressdetails=1`;
                    const response = await fetch(request);
                    const geojson = await response.json();
                    for (const feature of geojson.features) {
                        const center = [
                            feature.bbox[0] +
                        (feature.bbox[2] - feature.bbox[0]) / 2,
                            feature.bbox[1] +
                        (feature.bbox[3] - feature.bbox[1]) / 2
                        ];
                        const point = {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: center
                            },
                            place_name: feature.properties.display_name,
                            properties: feature.properties,
                            text: feature.properties.display_name,
                            place_type: ['place'],
                            center
                        };
                        features.push(point);
                    }
                } catch (e) {
                    console.error(`Failed to forwardGeocode with error: ${e}`);
                }
    
                return {
                    features
                };
            }
        };

        const geocoder = new MaplibreGeocoder(geocoderApi, {
            maplibregl: maplibregl,
            bbox: [-8.82, 49.79, 2.92, 60.94],
            countries: "gb",
            placeholder: "Geographic Search",
            showResultsWhileTyping: true,
            collapsed: true
        });

        newMap.addControl(geocoder)

        // Set the created map to the active map
        setMap(newMap)

        // Delete the newMap variable, as the map is now contained within 'map'
        return () => {
            newMap.remove();
        }
    }, [])

    // Provide the map to the context
    return (
        <MapContext.Provider value={map}>
            {children}
        </MapContext.Provider>
    )
}

/** 
* A component that renders the main MapLibre Map, complete with a correctly styled background and layers (Layers provided by the data located in ../data/layerData.json).
*/  
const Map = () => {
    
    // Pull the map through via context
    const map = useContext(MapContext);
    
    // Code to initialise the map with the layers provided by the layerData JSON
    useEffect(() => {
        if (map) {
            map.on("load", () => {
                
                // Adding icons to map for layers that require them
                for (const [name, value] of Object.entries(Images)) {
                    map.loadImage(
                        value,
                        (error, image) => {
                            if (error) throw error;
                            map.addImage(name, image);
                        }
                    );
                }

                // For each layer within the JSON, add it to the map
                for (var layerData of layerJSON) {
                    addLayersToMap(layerData, map)
                    addPopupsToMap(layerData, popupJSON, map)
                }

                // Resize the map to the container it sits within (should stop any issues with mouse offsets)
                map.resize()
            })
        }
    }, [map])

    // Render map
    return (
        <div className='map-box'>
            <div id='map-container'/>
        </div>
    )
}

export default Map;