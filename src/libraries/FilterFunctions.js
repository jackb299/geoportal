import layerJSON from '../data/layerData.json'
import filterJSON from '../data/filterData.json'

export function filterBuilder(field, operator, values) {
    /** 
    * A function to generate maplibre expressions to filter layers with using a given field, operator and entered values.
    * @param {string} field - The name of the field that the filter is acting upon.
    * @param {string} operator - The operator the filter is using (Valid operators include: "==", "<", ">", "between", "in").
    * @param {string} values - The raw input from the user input box.
    */

    // Convert the user input to either a number or a string and evaluate the filter depending on the operator
    if (operator === '==') {
        if (isNaN(Number(values))) {
            return ["==", ['get', field], values]
        } else {
            return ["==", ["to-number",["get", field]], Number(values)]
        }
    } else if (operator === 'in') {
        return ["in", field].concat(values.split(','))
    } else if (operator === '>') {
        return [">", ["to-number",["get", field]], Number(values)]
    } else if (operator === '<') {
        return ["<", ["to-number",["get", field]], Number(values)]
    } else if (operator === 'between') {
        return [
            "all", 
            [">", ["to-number",["get", field]], Number(values.split(',')[0])],
            ["<", ["to-number",["get", field]], Number(values.split(',')[1])]
        ]
    }
}

export function availableOperators(fieldInfo) {
    /** 
    * A function to generate HTML options for the operator dropdown. The options generated are based on whether or not the field is string based or number based.
    * @param {Object} fieldInfo - An object containing the necessary filter information for a given field.
    */

    // If the type of the field is a number, only provide the equals, less/greater than, and between operators.
    if (fieldInfo.type === "number") {
        return (
            <>
                <option
                    id="==Operator"
                    value="=="
                >
                    "Equal To"
                </option>
                <option
                    id="<Operator"
                    value="<"
                >
                    "Less Than"
                </option>
                <option
                    id=">Operator"
                    value=">"
                >
                    "Greater Than"
                </option>
                <option
                    id=">>Operator"
                    value="between"
                >
                    "Between"
                </option>
            </>
        )
    }

    // If the field type is text based, then only provide the equals and in operators as options
    else if (fieldInfo.type === "text") {
        return (
            <>
                <option
                    id="==Operator"
                    value="=="
                >
                    "Equal To"
                </option>
                <option
                    id="InOperator"
                    value="in"
                >
                    "In"
                </option>
            </>
        )

    }
}

export function operatorHelp(operator) {
    /** 
    * A function to provide help text HTML for a chosen operator.
    * @param {string} operator - The chosen operator that you want to retrieve help text for.
    */

    if (operator === '==') {
        return (
            <>
                <span>"Equal To"</span>
                <br/>
                <span>This operator compares the single user input to the value of the field selected, then only matches where the input exactly equals the vaule of the field.<br/><br/>E.g. SE-SEGH will only return the polygon of SE-SEGH</span>
            </>
        )
    }
    else if (operator === "in") {
        return (
            <>
                <span>"In"</span>
                <br/>
                <br/>
                <span>This operator compares the multiple user inputs (separated by commas) to the value of the field selected, then matches where any of the inputs exactly equal the vaule of the field.<br/><br/>E.g. SE-BUCKNG,SE-BUCKNG-02 will return both of the polygons for SE-BUCKNG and SE-BUCKNG-02</span>
            </>
        )
    }
    else if (operator === ">") {
        return (
            <>
                <span>"Greater Than"</span>
                <br/>
                <span>This operator compares the single user input to the value of the field selected, then only matches where the input is greater than the vaule of the field.<br/><br/>E.g. 400 will only return features where the value is greater than 400</span>
            </>
        )
    }
    else if (operator === "<") {
        return (
            <>
                <span>"Less Than"</span>
                <br/>
                <span>This operator compares the single user input to the value of the field selected, then only matches where the input is less than the vaule of the field.<br/><br/>E.g. 400 will only return features where the value is less than 400</span>
            </>
        )
    }
    else if (operator === "between") {
        return (
            <>
                <span>"Between"</span>
                <br/>
                <span>This operator compares the two user inputs (seperated by commas) to the value of the field selected, then only matches where the first input is greater than the vaule of the field and the second input is less than the value of the field<br/><br/>E.g. 100, 400 will only return features where the value is between 100 and 400</span>
            </>
        )
    } else {
        return (
            <span>An operator is a simple way of summarising a comparison. In this context, these operators are used to compare your input against the values of features (polygons/points).<br/><br/>An example would be 'Equal To' which compares your input to the features, and is only true when they match completely</span>
        )
    }
}

export function checkInput(inputValue, selectedOperator, selectedLayer, filterHistory) {
    /** 
    * A function to check the validity of the user input filter box. This is to prevent invalid filters being added to the map's style.
    * @param {string} inputValue - The raw input from the input box.
    * @param {string} selectedOperator - The currently selected operator contained within the operator select box.
    * @param {string} selectedLayer - The currently selected layer contained within the layer select box.
    * @param {Array} filterHistory - The Array that keeps track of the filter history of the map, used in this function to check whether a layer has already been filtered.
    */

    // Check if there is no text contained within the box
    if (inputValue === false || inputValue === '') {
        return "No Input Value, please enter a valid value"
    }

    // Check if the layer has already been filtered
    else if (filterHistory && filterHistory.some(entry => entry.layers.includes(selectedLayer))) {
        return "Currently selected layer already has an active filter associated with it. Please remove the active filter associated with this layer."
    }

    // Check if the input is valid for the operators
    else {
        if (['>','<','between'].includes(selectedOperator)) {
            if (selectedOperator === 'between') {
                if (!inputValue.includes(',')) {
                    return "Input does not contain two values seperated by a comma (,)."
                }
                else if (inputValue.includes(' ')) {
                    return "Input value contains a space, please remove any spaces between values or commas."
                }
                else if (inputValue.split(',').length !== 2) {
                    return "Two numbers not included in input, please try again with two numbers seperated by a comma."
                }
                else if (isNaN(inputValue.split(',')[0]) || isNaN(inputValue.split(',')[1]) || inputValue.split(',')[1] === '') {
                    return "One of the values included either side of the comma in the input is not a number or is empty, please check."
                } else {
                    return "Valid"
                }
            }
            else if (['>','<'].includes(selectedOperator)) {
                if (isNaN(inputValue)) {
                    return "The value entered is not a valid number, check for spaces or letters"
                } else {
                    return "Valid"
                }
            }
        }
        else if (selectedOperator === 'in') {
            if (inputValue.split(',').length !== 2) {
                return "Input does not contain at least two values seperated by a comma (,)."
            } 
            else if (inputValue.includes(', ') | inputValue.includes(', ')) {
                return "Input value contains a space by the commas, please remove any trailing or leading spaces such as: (' ,' or ', ')."
            } 
            else {
                return "Valid"
            }
        }
        else if (selectedOperator === '==') {
            if (inputValue === '') {
                return "No Input Value, please enter a valid value"
            }
            else {
                return "Valid"
            }
        }
    }
}

export function layerHelp(selectedLayer) {
    /** 
    * A function to provide help text HTML for a given layer.
    * @param {string} selectedLayer - The chosen layer that you want to retrieve help text for.
    */

    // Get the layer description from the JSON
    const layerInfo = layerJSON.find((layer) => layer.id === selectedLayer) || false;
    if (layerInfo) {
        return (
            <>
                <span>{layerInfo.name}</span>
                <br/>
                <br/>
                <span>{layerInfo.description}</span>
            </>

        )
    }
    else {
        // When no layer is selected provide help text describing the concept of a layer
        return (
            <span>A layer is a map element, selected from the right hand menu, and contains either polygons/lines/points.<br/><br/>An example of this would be the Current Communities layer, which is a polygon layer.</span>
        )
    }
}

export function fieldHelp(selectedField, selectedLayer) {
    /** 
    * A function to provide help text HTML for a chosen field.
    * @param {string} selectedField - The field that you want to retrieve help text for.
    * @param {string} selectedLayer - The layer that contains the field that you want to retrieve help text for.
    */

    // Find the specific help text for the selected field
    const layerFields = filterJSON.find((layer) => layer.id === selectedLayer) || false;
    const fieldInfo = (layerFields ? layerFields.options.find((field) => field.field === selectedField) : false);
    if (fieldInfo) {
        return (
            <>
                <span>{fieldInfo.name}</span>
                <br/>
                <br/>
                <span>{fieldInfo.help}</span>
            </>
        )
    }
    else {
        // If no field is selected provide help text related to the generic concept of what a field is
        return (
            <span>A field is a property of a layer that contains information for each polygon/point. Think of it like a column in an excel spreadsheet.<br/><br/>An example of this would be the "Name" field, which simply is the name of each of the polygons/points.</span>
        )
    }
}