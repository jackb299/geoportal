// Import Components
import { useContext, useState } from "react"
import { MapContext } from "./Map"
import { motion } from "framer-motion"
import Tippy from "@tippyjs/react";
import 'tippy.js/animations/scale.css';
import { TfiClose } from "react-icons/tfi";
import { FaFilter } from "react-icons/fa6";
import { BsQuestionCircle, BsCheckLg } from "react-icons/bs"
import { MdDoNotDisturbAlt } from "react-icons/md"

// Import Functions
import { filterBuilder, availableOperators, operatorHelp, checkInput, layerHelp, fieldHelp } from "../libraries/FilterFunctions"

// Import Data
import filterJSON from '../data/filterData.json'
import layerJSON from '../data/layerData.json'

/** 
* A component that renders the Filter Builder menu, which allows the user to dynamically filter layers based on select boxes and inputs.
*/  
export const FilterButton = () => {

    // Set the default state for the menu
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLayer, setSelectedLayer] = useState(false)
    const [selectedField, setSelectedField] = useState(false)
    const [selectedOperator, setSelectedOperator] = useState(false)
    const [inputValue, setInputValue] = useState(false)

    // Create an array to keep track of the filter history as it is being created for the filters
    const [filterHistory, setFilterHistory] = useState([]);

    // Grab the global map to allow for updating layer filters
    const map = useContext(MapContext)

    // Function for controlling the effects of the filter submit button
    const handleSubmit = (e) => {
        e.stopPropagation()

        // Build the filter based on the filled out filter form
        const filter = filterBuilder(selectedField, selectedOperator, inputValue)

        // Get information related to the selected layer and field, to make sure that it doesn't have any label layers or dependent layers, as well as having access to the proper names for labelling
        var layerInfo = layerJSON.find((layer) => layer.id === selectedLayer) || false;
        var fieldInfo = filterJSON.find((layer) => layer.id === selectedLayer).options.find((field) => field.field === selectedField) || false;

        // If the layer has labels or child layers, apply filter to both
        if (layerInfo && layerInfo.layers.length > 1) {

            // Get both of the layer ids for the layers within the main layer (i.e. the geometry layer and the label layer)
            var layer = layerInfo.layers[0].style.id
            var labelLayer = layerInfo.layers[1].style.id

            // Get the current filters of both layers before changing (so that we can revert)
            var oldLayerFilter = map.getFilter(layer)
            var oldLabelLayerFilter = map.getFilter(labelLayer)

            // Keep track of the filter history for each layer, to be able to revert
            setFilterHistory([...filterHistory, {layers: [layer, labelLayer], filters: [oldLayerFilter, oldLabelLayerFilter], filterText: [`${layerInfo.name} Filter:`, `${fieldInfo.name} ${selectedOperator} ${inputValue}`]}])

            // Set the filter to the new filter for each layer
            map.setFilter(layer, filter)
            map.setFilter(labelLayer, filter)

        }
        // Else apply the filter to the singular layer
        else if (layerInfo) {

            // Get the current active filter for the selected layer
            var oldFilter = map.getFilter(selectedLayer)

            // Add the current filter to the filterHistory, allowing us to revert to the old filter when turned off
            setFilterHistory([...filterHistory, {layers: [selectedLayer], filters: [oldFilter], filterText: [`${layerInfo.name} Filter:`, `${fieldInfo.name} ${selectedOperator} ${inputValue}`]}])

            // Set the layer's current filter to the new one created
            map.setFilter(selectedLayer, filter)
        }
    };

    // Function to handle to handle changing the applied filter back to the initial state of the layer before filtering
    const revertFilter = (layers, oldFilters) => {
        layers.forEach((layer, index) => {

            // Handle if centroid/label layers use specific filters that need to be reinstated in a specific way
            if (layer.includes('centroid') || layer.includes('label')) {
                map.setFilter(layer, oldFilters[index])
            } 
            else {
                map.setFilter(layer, oldFilters[index]);
            }
        })

        // Remove the previous filter from the filterHistory tracker
        setFilterHistory(prevHistory => prevHistory.filter(entry => entry.layers !== layers && entry.filters !== oldFilters));
    }

    // Function to handle the effects of clicking the menu button
    const handleMenuButtonClick = (e) => {
        e.stopPropagation()
        setIsOpen(!isOpen)
    };


    return (
        <motion.div
                initial={false}
                animate={isOpen ? "open" : "closed"}
        >
            <div>
                <motion.button 
                    id='filterButton' 
                    className='menu-button' 
                    onClick={handleMenuButtonClick}
                    whileTap={{scale: 0.8}}
                >
                    <motion.div 
                        variants={{
                            open: { opacity: 1 },
                            closed: { opacity: 0 }
                        }}
                        transition={{ duration: 0.2 }}
                        style={{ originY: 0.55 }}
                    >
                        <TfiClose className="icon" size={20} />
                    </motion.div>
                    <motion.div 
                        variants={{
                            open: { opacity: 0 },
                            closed: { opacity: 1 }
                        }}
                        transition={{ duration: 0.2 }}
                        style={{ originY: 0.55 }}
                    >
                        <FaFilter className="icon" size={20} />
                    </motion.div>
                </motion.button>
            </div>

            <motion.div 
                id="filterContainer" 
                className="menu-container"
                variants={{
                    open: {
                      clipPath: "inset(0% 0% 0% 0% round 10px)",
                      transition: {
                        duration: 0.4,

                      }
                    },
                    closed: {
                      clipPath: "inset(1% 99% 99% 1% round 10px)",
                      transition: {
                        duration: 0.4
                      }
                    }
                  }}
                  style={{ pointerEvents: isOpen ? "auto" : "none" }}
            >
                <div className="filter-header">Filter Builder</div>
                <LayerSelect selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} setSelectedField={setSelectedField} setSelectedOperator={setSelectedOperator}/>
                <FieldSelect selectedLayer={selectedLayer} selectedField={selectedField} setSelectedField={setSelectedField} setSelectedOperator={setSelectedOperator}/>
                <OperatorSelect selectedLayer={selectedLayer} selectedField={selectedField} selectedOperator={selectedOperator} setSelectedOperator={setSelectedOperator}/>
                <FilterInput selectedLayer={selectedLayer} selectedOperator={selectedOperator} inputValue={inputValue} setInputValue={setInputValue} handleSubmit={handleSubmit} filterHistory={filterHistory}/>
                {
                    filterHistory.length > 0 && <div id="activeFiltersHeader" className="filter-header">Active Filters:</div>
                }
                {
                    filterHistory.map((entry, index) => (
                        <button key={index} className="active-filter-button" onClick={() => revertFilter(entry.layers, entry.filters)}>
                            <span>{entry.filterText[0]}</span>
                            <span>{entry.filterText[1]}</span>
                            <span>Click Me to Remove Filter</span>
                        </button>
                    ))
                }
            </motion.div>
        </motion.div>
    )
}

/** 
* A component that renders the Layer Select dropdown box, which allows the user to select the layer they would like to filter.
*/  
export const LayerSelect = ({ selectedLayer, setSelectedLayer, setSelectedField, setSelectedOperator }) => {

    // Function to make sure that when the layer has been changed, set the other select boxes to default (i.e. false)
    const handleLayerChange = (layer) => {
        setSelectedLayer(layer)
        setSelectedField(false)
        setSelectedOperator(false)
    }

    return (
        <div className="filter-selector-div">
            <select 
                id="layerSelect" 
                className="filter-selector"
                onChange={e => handleLayerChange(e.target.value)}
                onClick={e => e.stopPropagation()}
                value={selectedLayer ? selectedLayer : "default"}
            >
                <option id="defaultLayerSelect" value="default">Please Select a Layer</option>
                {
                    filterJSON.map((layer) => (
                        <option key={layer.id + "_filter"} id={layer.id + "_filter"} value={layer.id}>
                            {layer.name}
                        </option>
                    ))
                }
            </select>
            <Tippy
                content={
                    <>
                        <span>Field Help:</span>
                        <br/>
                        <br/>
                        {
                            layerHelp(selectedLayer)
                        }
                    </>
                }
                placement="right"
                theme="filterhelp"
                animation="scale"
            >
                <div>
                    <BsQuestionCircle size={25} className="filter-selector-help"></BsQuestionCircle>
                </div>
            </Tippy>
        </div>
    )
}

/** 
* A component that renders the Field Select dropdown box, which allows the user to select the field they would like to filter. The list of fields being drawn programatically from the selected layer.
*/ 
export const FieldSelect = ({ selectedLayer, selectedField, setSelectedField, setSelectedOperator }) => {

    // Function to handle resetting the Operator select box if the field is changed
    const handleFieldChange = (field) => {
        setSelectedField(field)
        setSelectedOperator(false)
    } 

    // Get the available fields for the currently selected layer
    const layerFields = filterJSON.find((layer) => layer.id === selectedLayer) || false;

    return (
        <div className="filter-selector-div">
            <select 
                id="fieldSelect" 
                className="filter-selector"
                onChange={e => handleFieldChange(e.target.value)}
                onClick={e => e.stopPropagation()}
                value={selectedField ? selectedField : "default"}
                disabled={layerFields ? "" : "disabled"}
            >
                <option id="defaultLayerSelect" value="default">Please Select a Field</option>
                {layerFields &&
                    layerFields.options.map((field) => (
                        <option key={field.field + "_filter"} id={field.field + "_filter"} value={field.field}>
                            {field.name}
                        </option>
                    ))
                }
            </select>
            <Tippy
                content={
                    <>
                        <span>Field Help:</span>
                        <br/>
                        <br/>
                        {
                            fieldHelp(selectedField, selectedLayer)
                        }
                    </>
                }
                placement="right"
                theme="filterhelp"
                animation="scale"
            >
                <div>
                    <BsQuestionCircle size={25} className="filter-selector-help"></BsQuestionCircle>
                </div>
            </Tippy>
        </div>
    )

}

/** 
* A component that renders the Operator Select dropdown box, which allows the user to select the Operator they would like to use to filter. This list is dynamically set by the type provided by the selected field.
*/ 
export const OperatorSelect = ({ selectedLayer, selectedField, selectedOperator, setSelectedOperator }) => {

    // Find the valid operators for the selected field based on the field's type (i.e. if it is text, dont include the greater/less than operators)
    const layerFields = filterJSON.find((layer) => layer.id === selectedLayer) || false;
    const fieldInfo = (layerFields ? layerFields.options.find((field) => field.field === selectedField) : false);

    return (
        <div className="filter-selector-div">
            <select 
                id="operatorSelect" 
                className="filter-selector"
                onChange={e => setSelectedOperator(e.target.value)}
                onClick={e => e.stopPropagation()}
                value={selectedOperator ? selectedOperator : "default"}
                disabled={selectedField && fieldInfo ? "" : "disabled"}
            >
                <option id="defaultOperatorSelect" value="default">Please Select an Operator</option>
                {fieldInfo &&
                    availableOperators(fieldInfo)
                }
            </select>
            <Tippy
                content={
                    <>
                        <span>Operator Help:</span>
                        <br/>
                        <br/>
                        {
                            operatorHelp(selectedOperator)
                        }
                    </>
                }
                placement="right"
                theme="filterhelp"
                animation="scale"
            >
                <div>
                    <BsQuestionCircle size={25} className="filter-selector-help"></BsQuestionCircle>
                </div>
            </Tippy>
        </div>
    )
}

/** 
* A component that renders the Filter Input box, which allows the user to provide the input they wish to filter the layer by. It also handles the validation for the input.
*/ 
export const FilterInput = ({ selectedLayer, selectedOperator, inputValue, setInputValue, handleSubmit, filterHistory }) => {

    return (
        <div className="filter-input-div">
            <input type="text" className="filter-input-box" id="filterInput" placeholder="Input Filter Values Here.." value={inputValue || ''} onInput={e => setInputValue(e.target.value)}></input>
            {
                checkInput(inputValue, selectedOperator, selectedLayer, filterHistory) === 'Valid' ? (
                    <motion.button 
                        className="filter-input-submit"
                        onClick={e => handleSubmit(e)}
                        whileTap={{scale: 0.8}}
                    >
                        <BsCheckLg size={25} />
                    </motion.button>
                ) : (
                    <Tippy
                        content={
                            <>
                                <span>Invalid Input:</span>
                                <br/>
                                <br/>
                                {
                                    <span>
                                        {
                                            selectedOperator ? checkInput(inputValue, selectedOperator) : "Please select a Layer, Field and Operator"
                                        }
                                    </span>
                                }
                            </>
                        }
                        placement="right"
                        theme="filterhelp"
                        animation="scale"
                    >
                        <button className="filter-input-submit">
                            <MdDoNotDisturbAlt size={25} />
                        </button>
                    </Tippy>
                )
            }
        </div>
    )
}