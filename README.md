ika
===

`ika` is a small JavaScript library that makes filling forms faster and turns
regular users into power users!

It works by tagging fields on a form with a shorthand and enabling users to 
input the form fields via the shorthands in from field.

## USAGE

In order to use `ika` you currently need to do two things.

1. Add an element named `<div id="ika-apa"></div>` which will be replaced by the script
2. Tag your input fields with `data-ika` attributes.

For example:

```html
<input type="text" name="firstName" data-ika="fname" />
```

3. Add the `ika.js` and `ika.dom.js` scripts to your page (in that order)

---

Copyright (c) NNDI