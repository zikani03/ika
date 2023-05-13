/**
 * Ika provides functionality for mapping tags to Input Elements and parsing
 * tagged text input.
 * 
 * @author Zikani Nyirenda Mwase <zikani03@nndi.cloud>
 */

export type IkaFakerOptions = {
    [key: string]: String | ((x: any) => string)
};


export default class Ika {

    _config: any | null
    __tagRegexp: RegExp
    _inputTagMap: any

    constructor(config = {}) {
        this._config = Object.assign({}, config);
        this.__tagRegexp = /(\w+\b\:)/g;
        this._inputTagMap = new Map<any, any>()
    }

    /**
     * Generates mapping of tag to an input element.
     * 
     * @return WeakMap with mapping of tag to input element 
     */
    generateMappingFromInputs(): any {
        const inputList: any = document.getElementsByTagName("input");
        let tagName: string | null = null;

        for (var e of inputList) {
            let inputField: HTMLInputElement = e

            if (inputField.hasAttribute("data-ika")) {
                tagName = inputField.getAttribute("data-ika");
            } else {
                // TODO: for checkboxes, radios and select options use the value as the tagName if possible.
                tagName = inputField.getAttribute("name");
            }

            if (this._inputTagMap[tagName!]) {
                // already exists, skip it?
                continue;
            }
            this._inputTagMap[tagName!] = inputField
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
    parseMapping(textInput: string, mapping: Map<string, HTMLInputElement> | null = null) {
        if (textInput == null || textInput === '') {
            return null;
        }

        if (mapping == null) {
            // Use Cached input map if the mapping is not provided
            mapping = this._inputTagMap;
        }

        let output = new Map()

        const atoms = textInput.split(this.__tagRegexp);
        var currentTag: string | null = null;
        var lastElementWasTag = false;
        let el = null;

        for (var value of atoms) {
            if (this.__tagRegexp.test(value)) {
                currentTag = value.trim().replace(":", "");
                lastElementWasTag = true;
                continue;
            }
            el = mapping[currentTag!];
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
