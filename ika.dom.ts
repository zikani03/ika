import Ika from './ika'
import { IkaFakerOptions } from './ika'

declare global {
    interface Window {
        ikaFakerOptions: IkaFakerOptions;
        faker: any
    }
}

document.addEventListener("DOMContentLoaded", function () {
    var ikaParentNode = document.getElementById("ika-apa");
    const ikaInstance = new Ika({});

    function __ikahandleSubmit(evt: Event) {
        var inputMapping = ikaInstance.generateMappingFromInputs();
        var rawText = ikaTxt.value ;
        if (rawText.length < 1) {
            for (var [nameOrTag, fakerSpecOrFn] of Object.entries(window.ikaFakerOptions)) {
                let el = document.getElementsByName(nameOrTag)[0];
                if (!el) {
                    console.error("failed to generate faker value - could not find element with name", nameOrTag)
                    return;
                }
                let value = fakerSpecOrFn;
                if (typeof(value) === 'function') {
                    el.setAttribute("value", value(el) || '');
                } else {
                    let withoutFaker = typeof(value) === 'string' ? value.replace("faker.", "") : '',
                        fakedValue = window.faker.helpers.fake(`{{${withoutFaker}}}`);
                    el.setAttribute("value", fakedValue);
                }
            }
            return false;
        }

        var parsed = ikaInstance.parseMapping(rawText, inputMapping);

        if (parsed == null) {
            return false;
        }
        for (var [el, value] of parsed) {
            var elType = el.getAttribute("type");
            if (elType == "radio" || elType == "checkbox") {
                if (value && (value == "0" || value.toLowerCase() == "n")) {
                    el.removeAttribute("checked");
                }
                if (value && (value == "1" || value.toLowerCase() == "y")) {
                    el.setAttribute("checked", "checked");
                }
            } else {
                if (value.startsWith("faker.")) {
                    let withoutFaker = value.replace("faker.", ""),
                        fakedValue = window.faker.helpers.fake(`{{${withoutFaker}}}`);
                    el.setAttribute("value", fakedValue);
                } else if (value) {
                    el.setAttribute("value", value);
                }
            }
        }

        return evt.preventDefault();
    }

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
            ikaParentNode.style.bottom = '0';
            ikaParentNode.style.right = '0';
        }

        window.addEventListener('resize', onResize)
    }

    if (ikaParentNode) {
        var wrap = document.createElement("div");
        wrap.setAttribute("id", "nndi--ika-control");

        var ikaTxt = document.createElement("textarea")
        ikaTxt.setAttribute("id", "nndi--ika-txt");
        ikaTxt.setAttribute("placeholder", "use tags here or leave empty for auto-fill")
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