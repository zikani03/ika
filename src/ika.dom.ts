import './types'
import Ika from './ika'

document.addEventListener("DOMContentLoaded", function () {
    // Add ika-disable to disable the input from being added to the page
    if (document.getElementsByClassName('ika-disable').length > 0) {
        return;
    }
    const ikaInstance = new Ika({});

    function __ikaSetInputValue(el, fakerSpecOrFn, fakerObj) {
        let value = fakerSpecOrFn;
        var elType = el.getAttribute("type");
        if (elType == "radio" || elType == "checkbox") {
            if (value && (value == "0" || value.toLowerCase() == "n")) {
                el.removeAttribute("checked");
            }
            if (value && (value == "1" || value.toLowerCase() == "y")) {
                el.setAttribute("checked", "checked");
            }
        }

        if (typeof (value) === 'function') {
            el.setAttribute("value", value(el) || '');
        } else {
            if (value.startsWith("faker.")) {
                let withoutFaker = typeof (value) === 'string' ? value.replace("faker.", "") : '',
                    fakedValue = fakerObj.helpers.fake(`{{${withoutFaker}}}`);
                el.setAttribute("value", fakedValue);
            } else if (value) {
                el.setAttribute("value", value);
            }
        }

        // Set the selected element of a <select> element 
        // based on either the <option value> or the option's inner text
        if (el.nodeName === "SELECT" && el.type === "select-one") {
            let selectedIndex = -1;
            for (var i = 0; i < el.options.length; i++) {
                if (el.options[i].value == value || el.options[i].innerText.toLowerCase().replace('\s', '') === value.toLowerCase().replace('\s', '')) {
                    el.selectedIndex = i;
                    selectedIndex = i;
                    break;
                }
            }

            if (selectedIndex === -1) {
                try {
                    let parsedIndex = parseInt(value.trim(), 10) 
                    el.selectedIndex = parsedIndex - 1
                } catch(e) {
                    // swallow the error, since this was a fallback anyways
                    console.error(`could not set selected value for input ${el.name}, failed to parse ${value} as option value or text or actual index`)
                }
            }
        }
    }

    function setDataOnInputsOnTarget(event: Event, targetElement: HTMLFormElement | Document, taggedInputText: string, fakerObj: any) {
        var inputMapping = ikaInstance.generateMappings(targetElement);
        var parsed = ikaInstance.parseMapping(taggedInputText, inputMapping);

        if (parsed == null) {
            return false;
        }
        for (var [el, value] of parsed) {
            __ikaSetInputValue(el, value, fakerObj);
        }

        return event.preventDefault();
    }

    function __ikahandleSubmit(evt: Event) {
        const configuredFaker = window.ikaConfig.faker;
        var rawText = ikaTxt.value;
        if (!window.ikaConfig) {
            console.error("ika.js: cannot process event when ikaConfig is not defined")
            return false;
        }

        if (!window.ikaConfig.forms) {
            console.error("ika.js: cannot process event when no form is defined in window.ikaConfig['forms']")
            return false;
        }

        const catchAllFormExists: boolean = window.ikaConfig.forms['*'] || false,
            catchAllFormDef = catchAllFormExists ? Object.assign({}, window.ikaConfig.forms['*']) : {};

        if (!catchAllFormExists) {
            console.log('ika.js: catch-all form * not defined, we recommend defining a catch all form')
        }

        // Go through the document checking if the current page/document has one of the forms
        // defined in ikaConfig.forms - we have to consider that we may have multiple forms too
        let formsOnPage: { [key: string]: HTMLFormElement | Document } = {}
        for (var [formName, ikaFormOptions] of Object.entries(window.ikaConfig.forms)) {
            if (formName === '*') {
                // skip the catch all first - only run it when no pages are defined on the page
                continue;
            }
            let el = document.querySelector(formName) as HTMLFormElement | null;
            if (el) {
                formsOnPage[formName] = el
            }
        }

        let noConfiguredFormsFoundOnPage = Object.entries(formsOnPage).length < 1;

        if (noConfiguredFormsFoundOnPage) {
            if (catchAllFormExists) {
                // Run the catch-all form logic
                for (var [nameOrTag, fakerSpecOrFn] of Object.entries(catchAllFormDef)) {
                    let el = document.querySelector(`[name=${nameOrTag}]`);
                    if (!el) {
                        console.error("ika.js: failed to generate faker value - could not find element with name", nameOrTag)
                        return;
                    }
                    __ikaSetInputValue(el, fakerSpecOrFn, configuredFaker);
                }
            } else {
                console.error("ika.js: Cannot run ika when no forms on page and catch-all form '*' is not defined")
                return false;
            }
        }

        const ikaInputTextAreaIsEmpty = rawText.length < 1;
        // When the input is empty, we use values from the faker library directly if 
        // they are defined in teh configuration
        if (ikaInputTextAreaIsEmpty) {
            for (var [formName, formEl] of Object.entries(formsOnPage)) {
                console.debug('ika.js: processing ika for ', formName)
                // TODO: add elements from the catch-all form to the form here
                for (var [nameOrTag, fakerSpecOrFn] of Object.entries(window.ikaConfig.forms[formName])) {
                    let el = formEl.querySelector(`[name=${nameOrTag}]`);
                    if (!el) {
                        console.error("ika.js: failed to generate faker value - could not find element with name", nameOrTag)
                        continue;
                    }
                    __ikaSetInputValue(el, fakerSpecOrFn, configuredFaker);
                }
            }
            return false;
        }

        // By default the document element is our default target
        let ikaTargetElement: HTMLElement | Document = document;

        return setDataOnInputsOnTarget(evt, ikaTargetElement, rawText, configuredFaker);
    }

    var ikaParentNode: HTMLElement | null = document.getElementById("ika-apa");
    // If the ika input is not defined, then add it to the document
    if (!ikaParentNode) {
        ikaParentNode = document.createElement('div');
        ikaParentNode.setAttribute('id', 'ika-apa');
        ikaParentNode.setAttribute('data-generated', 'true');
        ikaParentNode.style.position = 'absolute';
        ikaParentNode.style.bottom = '0';
        ikaParentNode.style.right = '0';

        document.getElementsByTagName('body')[0].appendChild(ikaParentNode)

        function onResize(event) {
            if (ikaParentNode) {
                ikaParentNode.style.bottom = '0px';
                ikaParentNode.style.right = '0px';
            }
        }

        window.addEventListener('resize', onResize)
    }

    function generatePlaceholderForForms(): string {
        const placeholder: Set<string> = new Set();
        
        for (var [formName, _] of Object.entries(window.ikaConfig.forms)) {
            if (formName === '*') {
                // skip the catch all first - only run it when no pages are defined on the page
                continue;
            }
            let el = document.querySelector(formName) as HTMLFormElement | null;
            if (el) {
                console.log(el)
                var inputMapping = ikaInstance.generateMappings(el);
                for (let [tagName, _] of Object.entries(inputMapping)) {
                    placeholder.add(`${tagName}:`)
                }
            }
        }
        
        let tags: string[] = []
        placeholder.forEach((e) => tags.push(e))
        return tags.join('\t')
    }

    if (ikaParentNode) {
        var wrap = document.createElement("div");
        wrap.setAttribute("id", "nndi--ika-control");

        const placeholder = "Use tags here or leave empty for auto-fill. The following tags are available;\n" + generatePlaceholderForForms();
        var ikaTxt = document.createElement("textarea");
        ikaTxt.setAttribute("id", "nndi--ika-txt");
        ikaTxt.setAttribute("placeholder", placeholder)
        ikaTxt.setAttribute("title", placeholder)
        ikaTxt.setAttribute("contenteditable", "true");
        ikaTxt.setAttribute("tabindex", "1");

        var ikaBtn = document.createElement("button")
        ikaBtn.setAttribute("id", "nndi--ika-btn");
        // ikaBtn.innerHTML = "🪄 Populate (Ctrl + Enter)";
        ikaBtn.innerHTML = "🪄 Fill (Ctrl + Enter)";

        var poweredBy = document.createElement("small");
        poweredBy.setAttribute("id", "nndi--ika-powered");
        poweredBy.innerHTML = 'Powered by <a href="https://github.com/zikani03/ika">ika</a>';

        ikaBtn.addEventListener("click", __ikahandleSubmit);

        ikaTxt.addEventListener("keypress", (event: KeyboardEvent) => {
            if (event.keyCode == 13 && event.ctrlKey) {
                __ikahandleSubmit(event);
            }
        });

        wrap.appendChild(ikaTxt);
        wrap.appendChild(ikaBtn);
        wrap.appendChild(poweredBy);

        ikaParentNode.appendChild(wrap);
    } else {
        console.error("ika: failed to find or create node to mount ika onto. Typically expects a div#ika-apa");
    }
});