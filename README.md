<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT LOGO -->
<div align="center">
  <a href="https://github.com/jackb299/geoportal">
    <img src="public\images\logo\geoportal_logo_no_background.PNG" alt="Logo" width="300" height="80">
  </a>
  <p align="center">
    A simple, clean, yet feature rich web based mapping portal for displaying spatial data.
    <br />
    <a href="https://github.com/jackb299/geoportal"><strong>Explore the docs »</strong></a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#data-entry">Data Entry</a></li>
        <ul>
          <li><a href="#layerdatajson">Layer Data</a></li>
          <li><a href="#categorydatajson">Category Data</a></li>
          <li><a href="#altstylesdatajson">Alternate Styles Data</a></li>
          <li><a href="#legenddatajson">Legend Data</a></li>
          <li><a href="#popupdatajson">Popup Data</a></li>
          <li><a href="#filterdatajson">Filter Data</a></li>
        </ul>
        <li><a href="#adding-images">Add Images</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

This project was born from the need to create a simple interface that can be deployed to display spatial data to end-users. The mapping interface itself uses the MapLibre library, which allows flexible interaction between all the spatial layers and the portal itself. It is easily configureable to suit the needs where it is to be deployed, with only small edits to JSON data files necessary to tailor the portal to your needs.

At this point in time it contains a fully featured Layer Select menu, with support for:
- Style switching of individual layers.
- Reactive legend which will match the currently selected style.
- Checkmark legends which allow for the turning on/off of specific features.
- Adaptive opacity slider.
- Drag and drop interface for changing the layer draw order.

As well as a Filter Builder menu, which supports the dynamic filtering of a curated list of layers you would like the end-users to be able to filter. The menu itself contains multiple validation steps, to ensure that the end-user does not incorrectly filter a layer.

Both of these menus contain support for dynamic help-text, guiding the end-user in the best way to use the portal.

Finally there is a menu for additional tools. This is user editable prior to setup to contain further tools that can expand the usefulness of the portal. Currently as standard for the repo, it contains a button for toggling the background map labels

The following URL is setup to act as an example of Geoportal running as intended:
https://simple-geoportal.netlify.app/

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![React][React.js]][React-url]
* [![MapLibre][MapLibre]][MapLibre-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

Below are instructions for setting up the portal to run locally.

### Prerequisites

To run the portal, the main prerequisite is NPM, which can be installed as follows:
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/jackb299/geoportal.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage
Here are a few ways that Geoportal can be customised to suit your needs, as well as usage instructions.

### Environment Setup
There are a number of environment variables that can be provided to alter the global behaviour of some of the code. The singular **non-optional** environment variable is the `REACT_APP_API_KEY`. To setup the environment variables in the simplest way, you just have to include a .env file at the root of the workspace. Here is an example of how you would set one up:
```env
REACT_APP_API_KEY='your_background_map_api_key'
REACT_APP_BG_URL='https://optional/background/map/style/you/want/to/use/api_key=API_KEY'
REACT_APP_VT_URL='https://optional/url/to/use/as/a/base/for/your/vector/tile/layers/layerName=LAYERNAME'
REACT_APP_WMS_URL='https://optional/url/to/use/as/a/base/for/your/wms/layers/layerName=LAYERNAME'
``` 

The `REACT_APP_BG_URL` is an optional environment variable that can be used to swap out the background map from the OS API to an alternative. Be sure to include the relevant api key either in the URL itself, or by using the `REACT_APP_API_KEY` variable, and replacing the key in the url with `API_KEY`.

The `REACT_APP_VT_URL` and `REACT_APP_WMS_URL` are optional environment variables that are there to provide an easier way of setting up the layerData JSON. They are most useful if you have many layers all being sourced from the same source, just with alternate layer names within the query parameters. This is useful if you have your own tile-server which is serving you tiles, such as Geoserver. Please remember to replace the layer name query parameter within the url with `LAYERNAME`.

### Data Entry
In order to customise the data visible within Geoportal, there are a number of JSON files that need editing with references to your data, its source, and its style. These JSON files are located in `/src/data/`. Below I will detail the structure of these JSONs, along with examples on how to set them up:

#### layerData.json
This file is responsible for detailing all the layers that Geoportal will make available to the end-user. It has a relatively simple strucutre, which provides the code all the information needed to add the layer to the menus, and for the map to correctly style the layer. Here is an example of how you would add a layer:
```json
// Vector Tile Layer
{
  "id": "layer_id",
  "name": "Layer Name/Title",
  "description": "A helpful description which would tell the end-user what the layer is",
  "category": "category_id_of_layer",
  "layers": [
      {
          "type": "VT",
          "sourceData": {
              "url": "https://example/vector/tile/url/layerName=LAYERNAME",
              "layerName": "layer_id"
          },
          "style": {
              "id": "layer_id",
              "source": "layer_source_id",
              "type": "layer_type",
              "source-layer": "layer_id",
              "maxzoom": 16,
              "minzoom": 10,
              "layout": {
                  "visibility": "none"
              },
              "paint": {
                  "circle-color": "#ffa500",
                  "circle-stroke-width": 0.75,
                  "circle-radius": 4,
                  "circle-opacity": 1
              }
          }
      }
  ]
}
```
Here is what each key represents:
* **id**:
This is the principal id of the layer you want to add, it will be referenced in multiple locations, and is MapLibre's main way of keeping track of the layer.
* **name**:
This is the friendly name of the layer, and will be used as the layer's title in the layer menu.
* **description**:
This is the description that the help-text will display to the end-user for this layer
* **category**:
This is the id of the category you want this layer to sit within, categories and their ids are detailed in the `categoyrData.json`
* **layers**:
This array is where you can put multiple layers, each layer within this array will be plotted under the same main layer. This is useful if you have a label layer, as well as a polygon layer.
* **type**:
This is the type of layer you want to add. There are two types supported: VT (Vector Tile) or WMS (WebMappingService). The one you wish to use depends on the level of interactivity you want with the layer. WMS does not support property interfacing, as the features are called as PNGs.
* **sourceData**:
This contains all the information necessary to add the source of your layer to the webmap, it should contain a `url` key, which your layer will be called from. If the URL requires a layer name query parameter, please replace that layer name parameter with the string LAYERNAME. The sourceData should also contain a `layerName` key, which relates to the name of the layer at that url. If you're calling data from a file, please use `"url": "file", "layerName": "the name of your layer"`
* **style**:
This is the chosen style of the layer, it is what tells MapLibre how you want the layer to be presented as. This can be whatever the user likes, but it has to follow the MapLibre style specification, located [here](https://maplibre.org/maplibre-style-spec/)

For a WMS layer, the options are more limited,  as the layer cannot be dynamically styled. Here is an example of a WMS layer:
```json
// WMS Layer
{
  "id": "layer_id",
  "name": "Layer Name/Title",
  "description": "A helpful description which would tell the end-user what the layer is",
  "category": "category_id_of_layer",
  "layers": [
      {
          "type": "WMS",
          "sourceData": {
              "url": "https://example/wms/url/layerName=LAYERNAME",
              "layerName": "layer_id"
          },
          "style": {
              "id": "layer_id",
              "source": "layer_source_id",
              "type": "raster",
              "layout": {
                  "visibility": "none"
              },
              "paint": {}
          }
      }
  ]
}
```

And finally for a local GeoJSON layer, the style follows the same as the Vector Tile:
```json
// Local GeoJSON layer
{
    "id": "layer_id",
    "name": "Layer Name/Title",
    "description": "A helpful description which would tell the end-user what the layer is",
    "category": "category_id_of_layer",
    "layers": [
        {
            "type": "GEOJSON",
            "sourceData": {
                "url": "file",
                "layerName": "layer_id"
            },
            "style": {
                "id": "layer_id",
                "source": "layer_source_id",
                "maxzoom": 20,
                "minzoom": 0,
                "type": "line",
                "layout": {
                    "visibility": "none"
                },
                "paint": {
                    "line-color": "#f486da",
                    "line-width": 5
                }
            }
        }
    ]
}
```

**NOTE**: There are environment variables that allow you to set a global source URL for both Vector Tiles and WMS layers. These should be set up in your .env as `REACT_APP_VT_URL` and `REACT_APP_WMS_URL`, replacing where you would normally specify the layer name with `LAYERNAME`
#### categoryData.json
This file is responsible for detailing all the categories that Geoportal will make available to the end-user. It is simpler that the layerData. Here is an example of how you would add a new category:
```json
{
    "label": "Category Name/Title",
    "description": "A helpful description which would tell the end-user what the category contains",
    "id": "category_id",
    "layers": [
        "layer_id_1",
        "layer_id_2",
        ...  
    ]
}
```
Here is what each key represents:
* **label**:
This is the name you want the category to be displayed as within the layer menu.
* **description**:
This is the description that the help-text will display to the end-user for this layer.
* **id**:
This is the id of the category, used by the codebase to correctly place the layers.
* **layers**:
This is an array of layer ids that the category contains, it is currently unused, but will be used to dictate what layers get turned on/off by a universal off button for the category.

#### altStylesData.json
This file is responsible for detailing the available alternate styles for each of the added layers. These styles are switchable within the layer menu, via a dropdown box. Here is the specification for the json:
```json
{
  "id": "layer_id",
  "styles": [
      {
          "id": "default",
          "styleName": "Default",
          "property": "fill-color",
          "value": "#000000"
      },
      {
          "id": "alt_style_id",
          "styleName": "Alternate Style Name",
          "property": "paint-property-to-change",
          "value": "value-of-the-property"
      }
  ]
}
```
Here is what each key represents:
* **id**:
This is the id of the layer the style will be added to
* **styles**:
This array will contain all the styles you want added to the layer
* **id (style)**:
This is the id of the style, used by the codebase to correctly place the layers.
Note: When adding alternate styles, you have to specify the default style.
* **styleName**:
This is the friendly name of the style seen in the style dropdown
* **property**:
This is the paint property that the style will change. E.g. "fill-color".
* **value**:
This is the value you want to set the above property to when this style is chosen. E.g. "#FFFFFF"

#### legendData.json
This file is responsible for detailing the legends for each of the added layers. It should contain the default legend for that layer, along with any other legends for any other alternate styles you have added within `altStylesData.json`. Here is an example of the structure:
```json
{
    "id": "layer_id",
    "legends": [
        {
            "styleName": "default",
            "values": [
	        {
	        "name": "Legend Value Name",
	        "colour": "#ADD8E6",
	        "type": "line"
	        },
	        ...
            ]
        }
	...
    ]
    ...
}
```
Here is what each key represents:
* **id**:
This is the id of the layer you want to add the legend to.
* **legends**:
This is an array of legends that are applicable to the layer, at minimum this needs to contain the default legend for that layer, so that the layer menu can load.
* **styleName**:
This is the id of the style, it should be "default" when no alternate styles are available. If there are other styles available, it should match the style id within `altStylesData.json` for that layer.
* **values**:
This Array should contain all the legend values for the legend itself, the number of these relates to the number of items your legend has.
* **name**:
This is the name for the specific legend item, e.g. "Trench".
* **colour**:
This is the colour of the key of the legend, it should match whatever that item is styled as, e.g. "#FFFFFF".
* **type**:
This is the type of key that the legend item has. It can be one of the following: "line" for line features, "poly" for polygon features, "point" for point features, and "image" if the feature uses a custom image within the map.
* **Optional: image**
This would dictate the name of the image that the item uses, if type is set as "image". E.g. "city-15". A list of available images is located within `/src/libraries/Images.js`.

#### popupData.json
This file is responsible for providing data for Popups for a given layer. This is 100% optional, as not every layer needs to have Popups. If the layer is not present in here it just wont generate them on clicking a feature for that layer on the map. Here is an example of the structure:
```json
"layer_id": {
  "mainLabel": "field_you_want_as_the_title",
  "popups": [
      {
          "text": "Field Name",
          "property": "field_id"
      },
      {
          "text": "Field Name 2",
          "property": "field_id_2"
      },
      ...
  ]
},
```
Here is what each key represents:
* **layer_id**:
This is the id of the layer you want to add the popups to.
* **mainLabel**:
This is the field within the features of the layer that you want to be present at the top of the popup as a title.
* **popups**:
This Array contains all the rows within the popup. They should be based on the data contained within the features in your layer.
* **text**:
This is the user-friendly name of the field you want to display in the popup.
* **property**:
This is the id of the field within the feature that the values are stored within. E.g. "name"

#### filterData.json
This file is responsible for determining what layers within the map are available to be filtered, and what in that layer can be filtered. Like the popups, not every layer needs to be specified in here, just the ones you want the end-user to be able to filter. Here is an example of the structure:
```json
{
    "id": "layer_id",
    "name": "Layer Name/Title",
    "options": [
        {
            "name": "Field Name",
            "field": "field_id",
            "help": "A description of the field to help the user determine valid inputs",
            "type": "text"
        },
        {
            "name": "Field Name 2",
            "field": "field_id_2",
            "help": "A description of the field to help the user determine valid inputs",
            "type": "number"
        }
        ...
    ]
}
```
Here is what each key represents:
* **id**:
This is the id of the layer you want to make filterable.
* **name**:
This is the friendly name for the layer you want the end-user to see.
* **options**:
This Array contains all possible fields the end-user will be able to filter the layer by.
* **name (options)**:
This is the user-friendly name of the field you want to display in the field options list.
* **field**:
This is the id of the field of the features within the layer you want to filter by.
* **help**:
This is the help-text you want visible to the end-user which will assist in describing what this field is.
* **type**:
This is the type of the field, either "text" for text-based fields, or "number" for numerical fields.

### Adding Images
You are able to style layers with custom icons using MapLibre's build in "symbol" layer type. But in order to do this, the icons need to be loaded into the map. This is more in-depth than adding layers/legends/popups etc. But not much more complicated. Here are the instructions:
* First add the icon file to `/src/icons/`. The file should be a file-type that MapLibre supports as an icon (either PNG or SVG).
* Next open up `/src/libraries/Images.js`
* You want to add the image path to the imports list at the top of the file like so:
```js
import 'imageName' from '/src/icons/file_name.png'
```
* Next add the image to the exported `Images` Object:
```js
"image-name": imageName,
```
Once the aobe steps have been performed, the icon should be available to your layers. You would just have to make sure the layer type is "symbol" and set the "icon-image" layout property to the "image-name" you used in the Images.js file:
```json
"layout": [
  "icon-image": "image-name",
]
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [X] Basic Functionality Layer Menu
- [X] Basic Functionality Filter Menu
- [X] Basic Functionality Tools Menu
- [X] Help Text Implementation
- [X] Layer Draw Order Changer
- [X] Layer Opacity Slider
- [ ] Map Measurement Tools
- [ ] Map Export as Image
- [ ] Feature Select Tool
    - [ ] CSV export from selected features
    - [ ] Select using DB connection
- [ ] Save/Load Viewport Settings
- [ ] Upload Local GeoJSON

See the [open issues](https://github.com/jackb299/geoportal/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-shield]: https://img.shields.io/github/license/jackb299/geoportal.svg?style=for-the-badge
[license-url]: https://github.com/jackb299/geoportal/blob/master/LICENSE.txt
[product-screenshot]: /public/images/Geoportal_Screenshot.png
[React.js]: https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Maplibre]: https://img.shields.io/badge/MapLibre-blue?logo=maplibre
[Maplibre-url]: https://maplibre.org/
