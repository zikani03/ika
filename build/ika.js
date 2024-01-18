

/**
 * Ika provides functionality for mapping tags to Input Elements and parsing
 * tagged text input.
 * 
 * @author Zikani Nyirenda Mwase <zikani03@nndi.cloud>
 */ class $cadeddde0cde79c4$export$2e2bcd8739ae039 {
    constructor(config = {}){
        this._config = Object.assign({}, config);
        this.__tagRegexp = /(\w+\b\:)/g;
        this._inputTagMap = new Map();
    }
    /**
     * Generates mapping of tag to an input element.
     * 
     * @return WeakMap with mapping of tag to input element 
     */ generateMappings(formEl) {
        this.generateMappingFromInputs(formEl);
        this.generateMappingFromSelects(formEl);
        return this._inputTagMap;
    }
    /**
     * Generates mapping of tag to an input element.
     * 
     * @return WeakMap with mapping of tag to input element 
     */ generateMappingFromInputs(formEl) {
        const inputList = formEl.getElementsByTagName("input");
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
     * Generates mapping of tag to an input element.
     * 
     * @return WeakMap with mapping of tag to input element 
     */ generateMappingFromSelects(formEl) {
        const selectsList = formEl.getElementsByTagName("select");
        let tagName = null;
        for (var e of selectsList){
            let selectControl = e;
            if (selectControl.hasAttribute("data-ika")) tagName = selectControl.getAttribute("data-ika");
            else tagName = selectControl.getAttribute("name");
            if (this._inputTagMap[tagName]) continue;
            this._inputTagMap[tagName] = selectControl;
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


document.addEventListener("DOMContentLoaded", function() {
    // Add ika-disable to disable the input from being added to the page
    if (document.getElementsByClassName("ika-disable").length > 0) return;
    const ikaInstance = new (0, $cadeddde0cde79c4$export$2e2bcd8739ae039)({});
    function __ikaSetInputValue(el, fakerSpecOrFn, fakerObj) {
        let value = fakerSpecOrFn;
        var elType = el.getAttribute("type");
        if (elType == "radio" || elType == "checkbox") {
            if (value && (value == "0" || value.toLowerCase() == "n")) el.removeAttribute("checked");
            if (value && (value == "1" || value.toLowerCase() == "y")) el.setAttribute("checked", "checked");
        }
        if (typeof value === "function") el.setAttribute("value", value(el) || "");
        else {
            if (value.startsWith("faker.")) {
                let withoutFaker = typeof value === "string" ? value.replace("faker.", "") : "", fakedValue = fakerObj.helpers.fake(`{{${withoutFaker}}}`);
                el.setAttribute("value", fakedValue);
            } else if (value) el.setAttribute("value", value);
        }
        // Set the selected element of a <select> element 
        // based on either the <option value> or the option's inner text
        if (el.nodeName === "SELECT" && el.type === "select-one") {
            for(var i = 0; i < el.options.length; i++)if (el.options[i].value == value || el.options[i].innerText.toLowerCase().replace("s", "") === value.toLowerCase().replace("s", "")) {
                el.selectedIndex = i;
                break;
            }
        }
    }
    function setDataOnInputsOnTarget(event, targetElement, taggedInputText, fakerObj) {
        var inputMapping = ikaInstance.generateMappings(targetElement);
        var parsed = ikaInstance.parseMapping(taggedInputText, inputMapping);
        if (parsed == null) return false;
        for (var [el, value] of parsed)__ikaSetInputValue(el, value, fakerObj);
        return event.preventDefault();
    }
    function __ikahandleSubmit(evt) {
        const configuredFaker = window.ikaConfig.faker;
        var rawText = ikaTxt.value;
        if (!window.ikaConfig) {
            console.error("ika.js: cannot process event when ikaConfig is not defined");
            return false;
        }
        if (!window.ikaConfig.forms) {
            console.error("ika.js: cannot process event when no form is defined in window.ikaConfig['forms']");
            return false;
        }
        const catchAllFormExists = window.ikaConfig.forms["*"] || false, catchAllFormDef = catchAllFormExists ? Object.assign({}, window.ikaConfig.forms["*"]) : {};
        if (!catchAllFormExists) console.log("ika.js: catch-all form * not defined, we recommend defining a catch all form");
        // Go through the document checking if the current page/document has one of the forms
        // defined in ikaConfig.forms - we have to consider that we may have multiple forms too
        let formsOnPage = {};
        for (var [formName, ikaFormOptions] of Object.entries(window.ikaConfig.forms)){
            if (formName === "*") continue;
            let el = document.querySelector(formName);
            if (el) formsOnPage[formName] = el;
        }
        let noConfiguredFormsFoundOnPage = Object.entries(formsOnPage).length < 1;
        if (noConfiguredFormsFoundOnPage) {
            if (catchAllFormExists) // Run the catch-all form logic
            for (var [nameOrTag, fakerSpecOrFn] of Object.entries(catchAllFormDef)){
                let el = document.querySelector(`[name=${nameOrTag}]`);
                if (!el) {
                    console.error("ika.js: failed to generate faker value - could not find element with name", nameOrTag);
                    return;
                }
                __ikaSetInputValue(el, fakerSpecOrFn, configuredFaker);
            }
            else {
                console.error("ika.js: Cannot run ika when no forms on page and catch-all form '*' is not defined");
                return false;
            }
        }
        const ikaInputTextAreaIsEmpty = rawText.length < 1;
        // When the input is empty, we use values from the faker library directly if 
        // they are defined in teh configuration
        if (ikaInputTextAreaIsEmpty) {
            for (var [formName, formEl] of Object.entries(formsOnPage)){
                console.debug("ika.js: processing ika for ", formName);
                // TODO: add elements from the catch-all form to the form here
                for (var [nameOrTag, fakerSpecOrFn] of Object.entries(window.ikaConfig.forms[formName])){
                    let el = formEl.querySelector(`[name=${nameOrTag}]`);
                    if (!el) {
                        console.error("ika.js: failed to generate faker value - could not find element with name", nameOrTag);
                        continue;
                    }
                    __ikaSetInputValue(el, fakerSpecOrFn, configuredFaker);
                }
            }
            return false;
        }
        // By default the document element is our default target
        let ikaTargetElement = document;
        return setDataOnInputsOnTarget(evt, ikaTargetElement, rawText, configuredFaker);
    }
    var ikaParentNode = document.getElementById("ika-apa");
    // If the ika input is not defined, then add it to the document
    if (!ikaParentNode) {
        ikaParentNode = document.createElement("div");
        ikaParentNode.setAttribute("id", "ika-apa");
        ikaParentNode.setAttribute("data-generated", "true");
        ikaParentNode.style.position = "absolute";
        ikaParentNode.style.bottom = "0";
        ikaParentNode.style.right = "0";
        document.getElementsByTagName("body")[0].appendChild(ikaParentNode);
        function onResize(event) {
            if (ikaParentNode) {
                ikaParentNode.style.bottom = "0px";
                ikaParentNode.style.right = "0px";
            }
        }
        window.addEventListener("resize", onResize);
    }
    if (ikaParentNode) {
        var wrap = document.createElement("div");
        wrap.setAttribute("id", "nndi--ika-control");
        var ikaTxt = document.createElement("textarea");
        ikaTxt.setAttribute("id", "nndi--ika-txt");
        ikaTxt.setAttribute("placeholder", "use tags here or leave empty for auto-fill");
        ikaTxt.setAttribute("contenteditable", "true");
        ikaTxt.setAttribute("tabindex", "1");
        var ikaBtn = document.createElement("button");
        ikaBtn.setAttribute("id", "nndi--ika-btn");
        // ikaBtn.innerHTML = "🪄 Populate (Ctrl + Enter)";
        ikaBtn.innerHTML = "\uD83E\uDE84 Fill (Ctrl + Enter)";
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
    } else console.error("ika: failed to find or create node to mount ika onto. Typically expects a div#ika-apa");
});


//# sourceMappingURL=ika.js.map
