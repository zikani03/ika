/**
 * Ika provides functionality for mapping tags to Input Elements and parsing
 * tagged text input.
 * 
 * @author Zikani Nyirenda Mwase <zikani03@nndi.cloud>
 */ class $3b1669ba769817af$export$2e2bcd8739ae039 {
    constructor(config = {}){
        this._config = Object.assign({}, config);
        this.__tagRegexp = /(\w+\b\:)/g;
        this._inputTagMap = new Map();
    }
    /**
     * Generates mapping of tag to an input element.
     * 
     * @return WeakMap with mapping of tag to input element 
     */ generateMappingFromInputs() {
        const inputList = document.getElementsByTagName("input");
        let tagName = null;
        for (var e of inputList){
            let inputField = e;
            if (inputField.hasAttribute("data-ika")) tagName = inputField.getAttribute("data-ika");
            else // TODO: for checkboxes, radios and select options use the value as the tagName if possible.
            tagName = inputField.getAttribute("name");
            if (this._inputTagMap[tagName]) continue;
            this._inputTagMap[tagName] = inputField;
        }
        return this._inputTagMap;
    }
    /**
     * Parses tagged text with the given input mapping
     * 
     * @param string textInput tagged text input
     * @param object mapping of tag to input element
     * @return object with mapping of input to value from the tagged text
     */ parseMapping(textInput, mapping = null) {
        if (textInput == null || textInput === "") return null;
        if (mapping == null) // Use Cached input map if the mapping is not provided
        mapping = this._inputTagMap;
        let output = new Map();
        const atoms = textInput.split(this.__tagRegexp);
        var currentTag = null;
        var lastElementWasTag = false;
        let el = null;
        for (var value of atoms){
            if (this.__tagRegexp.test(value)) {
                currentTag = value.trim().replace(":", "");
                lastElementWasTag = true;
                continue;
            }
            el = mapping[currentTag];
            if (lastElementWasTag && el) {
                var formattedValue = value.trim().replace(/^\'/gm, "").replace(/\'$/gm, "").replace(/^\"/gm, "").replace(/\"$/gm, "").trim();
                output.set(el, formattedValue.trim());
                lastElementWasTag = false;
            }
        }
        if (output.size == 0) return null;
        return output;
    }
}


// window.ikaFakerOptions = window.ikaFakerOptions || {};
document.addEventListener("DOMContentLoaded", function() {
    var ikaParentNode = document.getElementById("ika-apa");
    const ikaInstance = new (0, $3b1669ba769817af$export$2e2bcd8739ae039)({});
    function __ikahandleSubmit(evt) {
        var inputMapping = ikaInstance.generateMappingFromInputs();
        var rawText = ikaTxt.innerText;
        if (rawText.length < 1) {
            for (var [nameOrTag, fakerSpecOrFn] of Object.entries(window.ikaFakerOptions)){
                let el = document.getElementsByName(nameOrTag)[0];
                if (!el) {
                    console.error("failed to generate faker value - could not find element with name", nameOrTag);
                    return;
                }
                let value = fakerSpecOrFn;
                let withoutFaker = typeof value === "string" ? value.replace("faker.", "") : value(el), fakedValue = window.faker.helpers.fake(`{{${withoutFaker}}}`); //TODO: how to tell typescript it's a global thang
                el.setAttribute("value", fakedValue);
            }
            return false;
        }
        var parsed = ikaInstance.parseMapping(rawText, inputMapping);
        if (parsed == null) return false;
        for (var [el, value] of parsed){
            var elType = el.getAttribute("type");
            if (elType == "radio" || elType == "checkbox") {
                if (value && (value == "0" || value.toLowerCase() == "n")) el.removeAttribute("checked");
                if (value && (value == "1" || value.toLowerCase() == "y")) el.setAttribute("checked", "checked");
            } else {
                if (value.startsWith("faker.")) {
                    let withoutFaker = value.replace("faker.", ""), fakedValue = window.faker.helpers.fake(`{{${withoutFaker}}}`); //TODO: how to tell typescript it's a global thang
                    el.setAttribute("value", fakedValue);
                } else if (value) el.setAttribute("value", value);
            }
        }
        return evt.preventDefault();
    }
    // If the ika input is not defined, then add it to the document
    if (!ikaParentNode) {
        ikaParentNode = document.createElement("div");
        ikaParentNode.setAttribute("id", "ika-apa");
        ikaParentNode.setAttribute("data-generated", "true");
        // TODO: make it a floating element at the bottom of the page
        document.getElementsByTagName("body")[0].appendChild(ikaParentNode);
    }
    if (ikaParentNode) {
        var wrap = document.createElement("div");
        wrap.setAttribute("id", "nndi--ika-control");
        var ikaTxt = document.createElement("div");
        ikaTxt.setAttribute("id", "nndi--ika-txt");
        ikaTxt.setAttribute("contenteditable", "true");
        ikaTxt.setAttribute("tabindex", "1");
        var ikaBtn = document.createElement("button");
        ikaBtn.setAttribute("id", "nndi--ika-btn");
        ikaBtn.innerHTML = "Populate (Ctrl + Enter)";
        var poweredBy = document.createElement("small");
        poweredBy.setAttribute("id", "nndi--ika-powered");
        poweredBy.innerHTML = 'Powered by <a href="https://github.com/zikani03/ika">ika</a>';
        ikaBtn.addEventListener("click", __ikahandleSubmit);
        ikaTxt.addEventListener("keypress", (event)=>{
            if (event.keyCode == 13 && event.ctrlKey) __ikahandleSubmit(event);
        });
        wrap.appendChild(ikaTxt);
        wrap.appendChild(ikaBtn);
        wrap.appendChild(poweredBy);
        ikaParentNode.appendChild(wrap);
    }
});


//# sourceMappingURL=ika.js.map
