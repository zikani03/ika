
/**
 * Ika provides functionality for mapping tags to Input Elements and parsing
 * tagged text input.
 * 
 * @author Zikani Nyirenda Mwase <zikani@nndi-tech.com>
 */
class Ika {
    constructor(config = {}) {
        this._config = Object.assign({}, config);
        this.__tagRegexp = /(\w+\b\:)/g;
        this._inputTagMap = {};
    }

    /**
     * Generates mapping of tag to an input element.
     * 
     * @return WeakMap with mapping of tag to input element 
     */
    generateMappingFromInputs() {
        const inputList = document.getElementsByTagName("input");
        let tagName = null;

        for (var inputField of inputList) {
            if (inputField.hasAttribute("data-ika")) {
                tagName = inputField.getAttribute("data-ika");
                 if (this._inputTagMap[tagName]) {
                     // already exists, skip it?
                     continue;
                 }
                 this._inputTagMap[tagName] = inputField;
            }
        }

        return this._inputTagMap;
    }
    
    /**
     * Parses tagged text with the given input mapping
     * 
     * @param string textInput tagged text input
     * @param object mapping of tag to input element
     * @return object with mapping of input to value from the tagged text
     */
    parseMapping(textInput, mapping = null) {
        if (textInput == null || textInput === '') {
            return null;
        }
        
        if (mapping == null) {
            // Use Cached input map if the mapping is not provided
            mapping = this._inputTagMap;
        }

        let output = new Map()

        const atoms = textInput.split(this.__tagRegexp);
        var currentTag = null;
        var lastElementWasTag = false;
        let el = null;

        for (var value of atoms) {
            if (this.__tagRegexp.test(value)) {
                currentTag = value.trim().replace(":", "");
                lastElementWasTag = true;
                continue;
            }
            el = mapping[currentTag];
            if (lastElementWasTag && el) {
                var formattedValue = value.trim()
                    .replace(/^\'/gm, "")
                    .replace(/\'$/gm, "")
                    .replace(/^\"/gm, "")
                    .replace(/\"$/gm, "")
                    .trim();
                output.set(el, formattedValue.trim());
                lastElementWasTag = false;
            }
        }

        if (output.size == 0) 
            return null;

        return output;
    }
}

if (!window) {
    module.exports = Ika;
}