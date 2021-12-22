export const IkaComponent = {
    name: 'ika-input',
    props: [ 'tags' ],
    emits: [ 'match' ],
    template: `
    <div id="ika-apa">
        <textarea v-model="ikaRawText" 
            class="nndi--ika-txt" 
            tabindex="1" 
            rows=1 
            cols=160 
            style="display: block"
            v-on:keypress="handleKeypress"></textarea>
        <button class="nndi--ika-btn" @click="populate">Populate (Ctrl + Enter)</button>
    </div>`,
    
    data() {
        return  {
            __tagRegexp: /(\w+\b\:)/g,
            ikaRawText: ''
        }
    },
    methods: {
        handleKeypress(event) {
            if (event.keyCode == 13 && event.ctrlKey) {
                this.writeTagsToMappedVueModel()
            }
            return event;
        },
        populate(event) {
            event.preventDefault();
            this.writeTagsToMappedVueModel()
            return false;
        },
        generateMappingFromAttributes() {
            const mapping = {}
            for (var el in this.$attrs) {
                if (el.startsWith("tag:")) {
                    mapping[el.replace("tag:", "")] = {
                        event: 'ika:' + el,
                        field: this.$attrs[el]
                    }
                }
            }

            return mapping
        },
        /**
         * Parses tagged text with the given input mapping
         * 
         * @param string textInput tagged text input
         * @param object mapping of tag to input element
         * @return object with mapping of input to value from the tagged text
         */
        writeTagsToMappedVueModel() {
            let textInput = this.ikaRawText, 
                mapping = this.generateMappingFromAttributes();
            
            if (textInput == null || textInput === '') {
                return null;
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
                if (! currentTag) {
                    continue
                }
                el = mapping[currentTag] || mapping[currentTag.toLowerCase()];
                
                if (lastElementWasTag && el) {
                    var formattedValue = value.trim()
                        .replace(/^\'/gm, "")
                        .replace(/\'$/gm, "")
                        .replace(/^\"/gm, "")
                        .replace(/\"$/gm, "")
                        .trim();

                    //this.$emit(el.event, el.field)
                    const eventName = "match";
                    //const eventName = 'update:' + el.field; 
                    
                    const eventData = {
                        tag: currentTag,
                        fieldName: el.field,
                        value: formattedValue.trim(),
                    }
                    this.$emit(eventName, eventData)

                    output.set(el, formattedValue.trim());
                    lastElementWasTag = false;
                }
            }

            if (output.size == 0) 
                return null;

            return output;
        }
    }
}

export default class IkaVuePlugin {
    install(app, options) {
        app.provide('ika', options)            
        app.component('ika-input', IkaComponent)
    }
}