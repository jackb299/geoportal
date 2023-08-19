// Import Components
import { useState, useEffect, useContext } from "react";
import { MapContext } from "./Map";
import { BsEyeFill, BsEyeSlashFill, BsFillLockFill, BsFillUnlockFill, BsLayersFill, BsMapFill, BsQuestionCircle } from "react-icons/bs";
import { TfiClose } from "react-icons/tfi";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AnimatePresence, motion, useAnimation } from "framer-motion"
import Tippy from "@tippyjs/react";
import 'tippy.js/animations/scale.css';

// Import Data
import categoryJSON from '../data/categoryData.json'
import layerJSON from '../data/layerData.json'
import alternateStylesJSON from '../data/altStylesData.json';
import legendData from '../data/legendData.json';
import { Images } from '../libraries/Images'

// Import Functions
import { layerHelp } from "../libraries/FilterFunctions";

/** 
* A component that renders the layers menu, which allows the user to turn on/off layers, see legends, and style layers.
*/  
export const MenuButton = () => {

    // Set the default state for the menu
    const [isOpen, setIsOpen] = useState(false);
    const [activeLayers, setActiveLayers] = useState([])

    // Function to handle the effects of clicking the menu button
    const handleMenuButtonClick = (e) => {
        e.stopPropagation()
        setIsOpen(!isOpen)
    };

    const changeActiveLayers = (layer, active) => {
        if (active) {
            setActiveLayers([...activeLayers, layer])
        }
        else {
            setActiveLayers(activeLayers.filter(lyr => lyr !== layer))
        }
    }

    return (
        <motion.div
                initial={false}
                animate={isOpen ? "open" : "closed"}
        >
            <div>
                <motion.button 
                    id='menuButton' 
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
                        <BsLayersFill className="icon" size={20} />
                    </motion.div>
                </motion.button>
            </div>

            <motion.div 
                id="menuContainer" 
                className="menu-container"
                variants={{
                    open: {
                      clipPath: "inset(0% 0% 0% 0% round 10px)",
                      transition: {
                        duration: 0.4,
                      }
                    },
                    closed: {
                      clipPath: "inset(1% 1% 99% 99% round 10px)",
                      transition: {
                        duration: 0.4
                      }
                    }
                  }}
                  style={{ pointerEvents: isOpen ? "auto" : "none" }}
            >
                <div className="layer-header">Layers</div>
                {categoryJSON.map((category) => (
                    <CategoryButton key={category.id+"button"} categoryName={category.label} categoryId={category.id} categoryHelp={category.description} changeActiveLayers={changeActiveLayers}/>
                ))}
                <LayerOrderingMenu activeLayers={activeLayers}/>
            </motion.div>
        </motion.div>
    )
}

/** 
* A component that renders the individual Category buttons, which hold Layer buttons related to that category. The categories are provided by the data contained within the categoryData JSON.
*/  
export const CategoryButton = ({ categoryName, categoryId, categoryHelp, changeActiveLayers }) => {

    // State variable to track whether or not the category button is open
    const [categoryOpen, setCategoryOpen] = useState(false);
  
    // Function to handle the clicking of the category button itself
    const handleCategoryButtonClick = (e) => {
      // Prevent the click event from propagating to the sub-buttons
      e.stopPropagation();
      // Toggle the open state
      setCategoryOpen(!categoryOpen);
    };
  
    // Load the data from the categoryData JSON to build the layer menus, and filter the layer information down to only those layers who match the current category
    const categoryLayers = layerJSON.filter(layer => layer.category === categoryId)
  
    return (
      <motion.div
        id={categoryId}
        className="category-button"
        onClick={handleCategoryButtonClick}
        initial={false}
        animate={categoryOpen ? "open" : "closed"}
        variants={{
            open: {
                height: "100%",
                transition: {
                    duration: 0.3
                }
            },
            closed: {
                height: 20,
                transition: {
                    duration: 0.3
                }
            }
          }}
      >
        <div className="category-label">
            {categoryName}
            <Tippy
                content={
                    <>
                        <span>{categoryName} Help:</span>
                        <br/>
                        <br/>
                        <span>{categoryHelp}</span>
                    </>
                }
                placement="left"
                theme="layerhelp"
                animation="scale"
            >
                <div>
                    <BsQuestionCircle size={15} className="category-help"></BsQuestionCircle>
                </div>
            </Tippy>
        </div>

        <AnimatePresence>
        {
            categoryOpen && (
                <motion.div
                    initial={{
                        opacity: 0
                    }}
                    variants={{
                        open: { 
                            opacity: 1,
                            transition: {
                                duration: 0.6
                            }
                        },
                        closed: { 
                            opacity: 0,
                            transition: {
                                duration: 0.1
                            }
                        }
                    }}
                    exit={{ 
                        opacity: 0,
                        transition: 0.1
                    }}
                >
                    {categoryLayers.map((layer) => (
                        <div key={layer.id} className='layer-div'> 
                            <LayerButton key={`${layer.id}_button`} id={layer.id} layers={layer.layers} layerName={layer.name} changeActiveLayers={changeActiveLayers}/>
                        </div>
                    ))}
                </motion.div>
            )
        }
        </AnimatePresence>
      </motion.div>
    );
  };

/** 
* A component that renders the individual Layer buttons, which perform the main task of turning layers within the map on/off. The data for the layers is provided by the layerData JSON.
*/  
export const LayerButton = ({ id, layers, layerName, changeActiveLayers }) => {
    
    // Grab the global map to allow for updating layers
    const map = useContext(MapContext);

    // Create state variables to keep track of the layers' active status, and if the legend menu is open
    const [active, setActive] = useState(false);
    const [legendOpen, setLegendOpen] = useState(false)

    // Create the animations for the layer buttons, to allow the colour to change, as well as the button itself to grow/shrink
    const buttonControls = useAnimation();
    useEffect(() => {
        buttonControls.start({
            backgroundColor: active ? "#ff8200" : "#ffffff",
            color: active ? "#ffffff" : "#000000",
            maxHeight: legendOpen ? "100%" : "20px",
            //gridTemplateRows: legendOpen ? "auto" : "auto",
            transition: 0.1
        })
    })

    // Function to handle opening the legend menu
    const handleLegendButtonClick = (e) => {
        // Prevent the click event from propagating to the sub-buttons
        e.stopPropagation();
        // Toggle the expanded state
        setLegendOpen(!legendOpen);
        console.log(map.getStyle())
        map.moveLayer("bgs_geology_map", "uk_historical_earthquakes")
        console.log(map.getStyle())
      };

    // Set the buttons initial state to on if the layer starts as visible
    useEffect(() => {
        const visibility = map.getLayoutProperty(id, "visibility");
        setActive(visibility === 'visible');
    }, [id, map]);

    // Function to toggle the layer's visibility based on a user click
    const toggleLayer = (e) => {
        // Stopping the click propagating down to the category button
        e.stopPropagation()

        // Handle if the layer itself has other child layers that need to turn on/off with the parent, such as label layers
        if (layers.length > 1) {
            layers.forEach((layer) => {
                const visibility = map.getLayoutProperty(layer.style.id, "visibility");
                const newVisibility = visibility === 'visible' ? 'none' : 'visible';
                map.setLayoutProperty(layer.style.id, 'visibility', newVisibility)
        })
        } 
        else {
            const visibility = map.getLayoutProperty(id, "visibility");
            const newVisibility = visibility === 'visible' ? 'none' : 'visible';
            map.setLayoutProperty(id, 'visibility', newVisibility)
        }

        changeActiveLayers(id, !active)
        // Set the state variable to the inverse of what it was before
        setActive(!active);
    }

    return (
        <motion.div
            className="layer-button" 
            onClick={toggleLayer}
            animate={buttonControls}
        >
            <span className="layer-label">{layerName}</span>
            <Tippy
                content={
                    <>
                        <span>Layer Help:</span>
                        <br/>
                        <br/>
                        {
                            layerHelp(id)
                        }
                    </>
                }
                placement="left"
                theme="layerhelp"
                animation="scale"
            >
                <div>
                    <BsQuestionCircle size={15} className="layer-help"></BsQuestionCircle>
                </div>
            </Tippy>
            <button onClick={handleLegendButtonClick} className="legend-button">
                <BsMapFill className="legend-icon"/>
            </button>
            <AnimatePresence>
            <motion.div
                animate={legendOpen ? "open" : "closed"}
                variants={{
                    open: { 
                        opacity: 1,
                        transition: {
                            duration: 0.6
                        }
                    },
                    closed: { 
                        opacity: 0,
                        transition: {
                            duration: 0.1
                        }
                    }
                }}
                exit={{ 
                    opacity: 0,
                    transition: 0.1
                }}
                className="legend-container"
                //style={{ gridColumn: '1 / span2' }}
            >
                {
                    legendOpen && (
                        <Legend layerId={id}/>
                    )
                }
            </motion.div>
            </AnimatePresence>
        </motion.div>
      );
}

/** 
* A component that renders the Legend contained within the layer buttons, along with the code necessary for swapping styles. The data for the legends are provided by the data contained within the legendData JSON.
*/  
const Legend = ({ layerId }) => {
    
    // State for the current legend data
    const [currentLegend, setCurrentLegend] = useState(null);
    // State for selected checkboxes
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    // State for unselected checkboxes
    const [unselectedCheckboxes, setUnselectedCheckboxes] = useState([]);
    // State for currently active style
    const [activeStyle, setActiveStyle] = useState('default');
  
    // Access the map context
    const map = useContext(MapContext);
  
    // Fetch the legend data based on layerId and activeStyle
    useEffect(() => {
      const updatedLegendData = fetchLegendData(layerId, activeStyle);
      setCurrentLegend(updatedLegendData);
    }, [layerId, activeStyle]);
  
    // Update the checkboxes based on the currentLegend data
    useEffect(() => {
      if (currentLegend) {
        const legendFilters = currentLegend.values.map((legendValue) => ({
          filter: legendValue.filter,
          filterType: legendValue.filterType
        }));
        const defaultChecked = currentLegend.defaultChecked || false;
  
        // Handle if the legend itself is all checked on by default
        if (defaultChecked) {
          setSelectedCheckboxes(legendFilters);
          setUnselectedCheckboxes([]);
        } else {
          setSelectedCheckboxes([]);
          setUnselectedCheckboxes(legendFilters);
        }
      }
    }, [currentLegend]);

    // Function to handle when the style changes
    const handleStyleChange = (newStyle) => {
		setActiveStyle(newStyle);
	};
    
    // Fetch the legend data based on layerId and activeStyle
    const fetchLegendData = (layerId, activeStyle) => {
      const layerLegends = legendData.find((legend) => legend.id === layerId);
      const currentLegend = layerLegends.legends.find(
        (legend) => legend.styleName === activeStyle
      );  
      return currentLegend;
    };
  
    // Handle checkbox change
    const handleCheckboxChange = (legendValue) => {
      const isChecked = selectedCheckboxes.some(
        (checkbox) =>
          checkbox.filter === legendValue.filter &&
          checkbox.filterType === legendValue.filterType
      );
  
      // If the checkbox is checked, add it to the selectedCheckboxes
      if (isChecked) {
        const updatedCheckboxes = selectedCheckboxes.filter(
          (checkbox) =>
            checkbox.filter !== legendValue.filter ||
            checkbox.filterType !== legendValue.filterType
        );
        setSelectedCheckboxes(updatedCheckboxes);
        setUnselectedCheckboxes([...unselectedCheckboxes, legendValue]);
      } 

      // If unchecked update the unselectedCheckboxes
      else {
        const updatedCheckboxes = [...selectedCheckboxes, legendValue];
        setSelectedCheckboxes(updatedCheckboxes);
        const updatedUnselectedCheckboxes = unselectedCheckboxes.filter(
          (checkbox) =>
            checkbox.filter !== legendValue.filter ||
            checkbox.filterType !== legendValue.filterType
        );
        setUnselectedCheckboxes(updatedUnselectedCheckboxes);
      }
    };
  
    // Update the map filter based on checkbox selection
    useEffect(() => {
      if (
        currentLegend &&
        currentLegend.hasOwnProperty('tickable') &&
        currentLegend.tickable
      ) {
        // If there is more than one checkbox selected, create the filter expression for the layer.
        if (selectedCheckboxes.length > 0) {
            var layerFilter = ['all'];

            // Invert the selected filter if one of the selected options is OTHER
            if (selectedCheckboxes.some((checkbox) => checkbox.filter === "OTHER")) {
            unselectedCheckboxes.forEach((checkbox) => {
                layerFilter.push(['!', ['in', checkbox.filter, ['get', currentLegend.tickable]]]);
            });
            } 
            
            // If other is not selected, use the default filter expressions i.e. = for checked and != for not checked
            else {
            var ins = ['any'];
            var outs = ['all'];
    
            selectedCheckboxes.forEach((checkbox) => {
                ins.push([checkbox.filterType, checkbox.filter, ['get', currentLegend.tickable]]);
            });
    
            unselectedCheckboxes.forEach((checkbox) => {
                outs.push(['!', [checkbox.filterType, checkbox.filter, ['get', currentLegend.tickable]]]);
            });
    
            layerFilter.push(ins);
            layerFilter.push(outs);
            }
    
            // Set the filter expression for the layer
            map.setFilter(layerId, layerFilter);
        }

        // If there are no boxes checked, set the filter to false, which removes any features present.
        else if (
            selectedCheckboxes.length === 0
            ) {
                map.setFilter(layerId, false);
            }
        }
    }, [map, layerId, currentLegend, selectedCheckboxes, unselectedCheckboxes]);
  
    // Render loading if the legend is not ready, or has not been found
    if (!currentLegend) {
      return <div>Loading...</div>;
    }
  
    // Render the component
    return (
        <div className="legend-container">
            <StyleDropdown layerId={layerId} handleStyleChange={handleStyleChange} activeStyle={activeStyle} />
            <div className='legend' key={layerId + '_legend'}>
                {currentLegend.values.map((legendValue) => (
                <div className='legend-item-row' key={legendValue.name}>
                    <div className='legend-item-name'>{legendValue.name}</div>
                    {
                        legendValue.type === 'image' ? (
                            <img src={Images[legendValue.image]} alt="X" className="legend-item-key image"></img>
                        ) : (
                            <div
                            className={`legend-item-key ${legendValue.type}`}
                            style={{ backgroundColor: legendValue.colour }}
                            ></div>
                        )
                    }
                    {currentLegend.hasOwnProperty('tickable') && currentLegend.tickable && (
                    <div
                        key={legendValue.name + "Checkbox"}
                        className='legend-item-checkbox'
                    >
                        <input
                        type='checkbox'
                        checked={selectedCheckboxes.some(
                            (checkbox) =>
                            checkbox.filter === legendValue.filter &&
                            checkbox.filterType === legendValue.filterType
                        )}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleCheckboxChange(legendValue)}
                        />
                    </div>
                    )}
                </div>
                ))}
            </div>
            <OpacitySlider layerId={layerId} />
      </div>
    );
  };

/** 
* A component that renders the Style dropdown box, containing the available styles for the layer it is contained within. The data for the styles are provided by the data contained within the altStylesData JSON.
*/ 
const StyleDropdown = ({ layerId, handleStyleChange, activeStyle }) => {
    
    // Access the map context
    const map = useContext(MapContext);

    // Get the available alternate styles for that layer
    const layerStyles = alternateStylesJSON.find((style) => style.id === layerId) || false;

    // Function to handle when a new style is selected
    const changeStyle = (selectedStyle) => {
        if (layerStyles) {
            const style = layerStyles.styles.find((style) => style.id === selectedStyle) || false;
            if (style) {
                map.setPaintProperty(layerId, style.property, style.value)
                handleStyleChange(selectedStyle)
            }
        }
    }

    // Render the component
    return (
        <select
                value={activeStyle}
                className="style-selector"
                onChange={e => changeStyle(e.target.value)}
                onClick={e => e.stopPropagation()}
                disabled={layerStyles && !Array.isArray(layerStyles) ? '' : 'disabled'}
            >
                {layerStyles && !Array.isArray(layerStyles) ? (
                    layerStyles.styles.map((style) => (
                        <option 
                            key={`${layerId}|${style.id}_option`}
                            value={style.id}
                        >
                            {"Style: " + style.styleName}
                        </option>
                    ))
                ) : (
                    <option key={`${layerId}|default_option`}value='default'>No Styles Available</option>
                )}
            </select>
      );
}

/** 
* A component that renders Opacity Slider. It includes all code neccessary to create the slider itself, along with a lock button, which locks the slider if the layer already has its opacity set. (This lock can be toggled if the end-user needs to change the opacity)
*/ 
const OpacitySlider = ({ layerId }) => {

    // Set the state variables related to the current opacity, as well as the lock state of the slider.
    const [opacity, setOpacity] = useState(50)
    const [sliderLock, setSliderLock] = useState(false)

    // Access the map context
    const map = useContext(MapContext);

    // Set the initial condition of the slider, including whether or not the opacity slider begins locked.
    useEffect(() => {

        // Get the type of the current layer (i.e. fill/line/raster/point)
        const layerType = map.getLayer(layerId).type

        // Set the opacity for that given layer, using the proper paint property for its type
        const layerOpacity = map.getPaintProperty(layerId, layerType+"-opacity") || false

        // If the layer opacity is set by the style, then lock the slider, else default to unlocked
        if (layerOpacity && layerOpacity !== 1) {
            setSliderLock(true)
            if (!isNaN(layerOpacity)) {
                setOpacity(layerOpacity)
            }
        }
        else {
            setSliderLock(false)
            setOpacity(100)
        }

    }, [layerId, map])

    // Set functionality for when the opacity slider changes
    const handleOpacityChange = event => {

        // Get the layer type and set the opacity to that value/100 (as the opacity slider goes from 0-100, whereas the paint property is 0-1)
        const layerType = map.getLayer(layerId).type
        map.setPaintProperty(layerId, layerType+"-opacity", event.target.value/100)
        setOpacity(event.target.value)

    }

    // Function to handle when the lock button has been toggled
    const handleLockToggle = (e) => {
        e.stopPropagation()
        // Toggle whether or not the slider itself is disabled
        setSliderLock(!sliderLock)
    }
    return (
        <div className="slider-menu">
            <span>Opacity</span>
            <div className="slider-container">
                <BsEyeSlashFill />
                <input id={layerId+"_opacity_slider"} type="range" min="0" max="100" step="5" value={opacity} onClick={(e) => e.stopPropagation()} onChange={handleOpacityChange} disabled={sliderLock}></input>
                <BsEyeFill />
            </div>
            <button id={layerId+"opacity_lock"} onClick={handleLockToggle} className="slider-lock-button">
                {
                    sliderLock ? (
                        <BsFillLockFill />
                    ) : (
                        <BsFillUnlockFill />
                    )
                }
            </button>
        </div>
    )
}

/** 
* A component that renders Layer Ordering Menu. The menu is used to alter the draw order of each of the active layers on the map using a react-beautiful-dnd.
*/ 
const LayerOrderingMenu = ({ activeLayers }) => {

    // Set the state variables for the ordering of the layers within the drag and drop menu, along with the menu's open state, and whether or not the map has finished loading.
    const [orderedLayers, setOrderedLayers] = useState([])
    const [menuVisible, setMenuVisible] = useState(false)
    const [mapLoaded, setMapLoaded] = useState(false)

    // Grab the map context so we can interact with the map at this level
    const map = useContext(MapContext)

    // Set default state for the layer order menu
    useEffect(() => {

        // If map exists
        if (map) {

            // If the map's style is not completely loaded, then no layers appear, so set mapLoaded to true when the style has finished loading
            map.on('style.load', () => {
                setMapLoaded(true)
            })

            // Once the map's style is loaded
            if (mapLoaded) {

                // Get all map layers
                const mapLayers = map.getStyle().layers;

                // Filter out only those layers that are currently active in the layer menu.
                const filteredLayers = mapLayers
                    .filter(layer => activeLayers.includes(layer.id))

                    // Add the layer's id, and its friendly name to an object for use in creating the drag and drop portion of the layer ordering menu
                    .map(layer => (
                        {
                            id: layer.id, 
                            name: layerJSON.find(lyr => lyr.id === layer.id).name || "NoName"
                        }
                    ))

                // Reverse the ordering of the array, as by default as the Array's index increases, its draw order is higher, we want it the other way round so the top is the first index
                setOrderedLayers(filteredLayers.reverse())
            }
        }
    }, [map, mapLoaded, activeLayers])

    // Handle when any of the menu has been re-ordered
    const handleDragEnd = (result) => {
        // If the item has not moved, return nothing
        if (!result.destination) return;

        // Create a reordered Array, which takes the original ordering of the layers, and swaps where the layers are depending on what the result of the drag and drop is. Reversing the result to keep the top of map = lower index schema
        const reordered = Array.from(orderedLayers);
        const [reorderedLayer] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, reorderedLayer).reverse()

        // Set the ordered list of layers
        setOrderedLayers(reordered)

        // This does the work of doing the relative reordering. It takes the new top layer on the map, and puts the next layer in "reordered" beneath it, then repeating until it is the second last index (as at that point no further layers need moving)
        for (let orderIndex = 0; orderIndex < reordered.length - 1; orderIndex++) {
            // Optional logging if you want an output of what layers have been moved
            //console.log(`moving layer ${reordered[orderIndex + 1].id} beneath ${reordered[orderIndex].id}`)
            map.moveLayer(reordered[orderIndex + 1].id, reordered[orderIndex].id)
        }
    };

    // Function to handle opening the draw order menu
    const toggleMenu = () => {
        setMenuVisible(!menuVisible)
    }

    return (
        <motion.div
            initial={false}
            animate={menuVisible ? "open" : "closed"}
        >
            <motion.button 
                className="draw-order-button" 
                onClick={toggleMenu}
                whileTap={{scale: 0.8}}
                variants={{
                    open: {
                        marginBottom: "0px"
                    },
                    closed: {
                        marginBottom: "20px"
                    }
                }}
            >
                Change Layer Draw Order
            </motion.button>
                <motion.div 
                    className="draw-order-menu"
                    variants={{
                        open: {
                            display: "grid",
                            height: "100%",
                            maxHeight: "100%",
                            clipPath: "inset(0% 0% 0% 0% round 20px)",
                            marginBottom: "20px",
                            marginTop: "20px",
                            transition: {
                            duration: 0.4
                          }
                        },
                        closed: {
                            transitionEnd: {
                                display: "none", 
                            },
                            height: "0%",
                            maxHeight: "0px",
                            marginBottom: "0px",
                            marginTop: "0px",
                          clipPath: "inset(1% 100% 100% 100% round 20px)",
                          transition: {
                            duration: 0.4,
                            when: "afterChildren"
                          }
                        }
                      }}
                      style={{ pointerEvents: menuVisible ? "auto" : "none" }}
                >
                    <span>Top of Map</span>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="ROOT">
                                {(providedDroppable, snapshotDroppable) => (
                                    <div {...providedDroppable.droppableProps} ref={providedDroppable.innerRef} className="dnd-menu">
                                        {orderedLayers.map((layer, index) => (
                                            <Draggable draggableId={layer.id+'_dnd'} key={layer.id+ '_dnd'} index={index}>
                                                {(providedDraggable) => {
                                                    return (
                                                    <div className="dnd-layer-container" {...providedDraggable.dragHandleProps} {...providedDraggable.draggableProps} ref={providedDraggable.innerRef}>
                                                        <h3>{layer.name}</h3>
                                                    </div>
                                                    )
                                                }}
                                            </Draggable>
                                        ))}
                                        {providedDroppable.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    <span>Bottom of Map</span>
                </motion.div>
        </motion.div>
    );
}