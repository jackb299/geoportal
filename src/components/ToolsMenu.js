import { useState, useContext } from "react";
import { MapContext } from "./Map";
import { motion } from "framer-motion"
import Tippy from "@tippyjs/react";
import { TfiClose } from "react-icons/tfi";
import { BsTools, BsTagFill, BsQuestionCircle } from "react-icons/bs";

/** 
* A component that renders the Tools menu, which contains other useful tools for interacting with Geomatics' data or changing the global map style
*/  
export const ToolsButton = () => {

    // Create state variables to keep track of if the menu is open
    const [isOpen, setIsOpen] = useState(false);

    // Function to handle the tools button opening the menu
    const handleToolsButtonClick = (e) => {
        e.stopPropagation()
        setIsOpen(!isOpen)
    };

    // Render the component
    return (
        <motion.div
                initial={false}
                animate={isOpen ? "open" : "closed"}
        >
            <div>
                <motion.button 
                    id='toolsButton' 
                    className='menu-button' 
                    onClick={handleToolsButtonClick}
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
                        <BsTools className="icon" size={20} />
                    </motion.div>
                </motion.button>
            </div>

            <motion.div 
                id="toolsContainer" 
                className="menu-container"
                variants={{
                    open: {
                      clipPath: "inset(0% 0% 0% 0% round 10px)",
                      transition: {
                        duration: 0.4,

                      }
                    },
                    closed: {
                      clipPath: "inset(99% 99% 1% 1% round 10px)",
                      transition: {
                        duration: 0.4
                      }
                    }
                  }}
                  style={{ pointerEvents: isOpen ? "auto" : "none" }}
            >
                <div className="tools-header">Tools and Reports</div>
                <ToggleBackgroundLabels />
            </motion.div>
        </motion.div>
    )
}

const ToggleBackgroundLabels = () => {

    // Create the state variable that handles the current state of whether the background labels are on/off
    const [labelsOn, setLabelsOn] = useState(true)

    // Pull down the global map context so edits can be made to the map's style
    const map = useContext(MapContext)

    // Perform the toggle labels function
    const toggleOsLabels = (e) => {
        e.stopPropagation();

        // Get all layers in map
        const mapLayers = map.getStyle().layers;

        // Map all the layer ids to an array
        const layerIds = mapLayers.map((layer) => {
            return layer.id
        });

        // Filter the the array down to only those layer ids that contain "OS/Names/"
        const osLabelLayers = layerIds.filter(id => id.includes("OS/Names/"));

        // If the Background Map has OS Labels
        if (osLabelLayers.length > 0) {

            // If labels are already on
            if (labelsOn) {
                for (var onLabelLayers of osLabelLayers) {
                    // Change the visibility of the labels to none
                    map.setLayoutProperty(onLabelLayers, 'visibility', 'none')
                }
            }
            // Else change the layer's visibility to visible, restoring the labels
            else {
                for (var offLabelLayers of osLabelLayers) {
                    map.setLayoutProperty(offLabelLayers, 'visibility', 'visible')
                }
            }
        }

        setLabelsOn(!labelsOn)
    }

    return (
        <motion.button 
            className="tool-button"
            onClick={toggleOsLabels}
            whileTap={{scale: 0.9}}
        >
            <BsTagFill size={20}/>
            Toggle Background Map Labels
            <Tippy
                content={
                    <>
                        <span>Help:</span>
                        <br/>
                        <br/>
                        <span>Use this button if you want to remove the Labels present on the OS Background Map, as sometimes they do clutter the map space.</span>
                    </>
                }
                placement="right"
                theme="toolhelp"
                animation="scale"
            >
                <div>
                    <BsQuestionCircle size={15} className="tool-help"></BsQuestionCircle>
                </div>
            </Tippy>
        </motion.button>
    )
}