
/**
 * DOM manipulation for the ika library
 * @author Zikani Nyirenda Mwase <zikani@nndi-tech.com>
 */

document.addEventListener("DOMContentLoaded", function() {
    var ikaParentNode = document.getElementById("ika-apa");
    const ikaInstance = new Ika({});

    function __ikahandleSubmit(evt: Event) {
        var inputMapping = ikaInstance.generateMappingFromInputs();
        var rawText = ikaTxt.innerText;
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
                el.setAttribute("value", value);
            }
        }

        return evt.preventDefault();
    }


    if (ikaParentNode) {
        var wrap = document.createElement("div");
        wrap.setAttribute("id", "nndi--ika-control");

        var ikaTxt = document.createElement("div")
        ikaTxt.setAttribute("id", "nndi--ika-txt");
        ikaTxt.setAttribute("contenteditable", "true");
        ikaTxt.setAttribute("tabindex", "1");
        
        var ikaBtn = document.createElement("button")
        ikaBtn.setAttribute("id", "nndi--ika-btn");
        ikaBtn.innerHTML = "Populate (Ctrl + Enter)";
        
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
        // console.error("ika: Failed to find div#ika-apa");
    }
});