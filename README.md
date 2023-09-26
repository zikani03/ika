ika
===

<p align="center">
    <img src="logo.png" alt="ika draft logo">
</p>

`ika` is a small JavaScript library that makes filling forms faster for development and can turns regular users into power users. 

It allows you to auto-generate random data via faker-js for filling out your forms (convenient during testing). It also supports tagging fields on a form with a shorthand that enables users to fill multiple form fields on the page using shorthands all at once.


## DEMO

![demo](./demo.gif)

## USAGE

In order to use ika, you need to add the `ika.min.css` and `ika.min.js` files to your page. You can get them from the `build` directory or use the one hosted on my domain.

```html
<link rel="stylesheet" href="https://labs.zikani.me/ika/ika.min.css">
<script src="https://labs.zikani.me/ika/ika.js"></script>
```

### Auto-filling forms using faker-js integration

`ika` has support for [Faker.js](https://fakerjs.dev/) to generate values for Form inputs to help you save time filling in forms, especially useful when testing your applications. 

Let's assume you have the following two forms in your project (even if they were on different pages/views)

```html
<div class="forms">
    <form name="firstForm">
        <input type="text" name="firstName" id="firstName" />
        <input type="text" name="lastName" id="lastName" />
        <input type="text" name="dateOfBirth" id="dateOfBirth" />
    </form>

    <form name="secondForm">
        <input type="text" name="firstName" id="second_firstName" />
        <input type="text" name="lastName" id="second_lastName" />
    </form>
</div>
```

You can add ika script as shown below. When you load ika in this way, an ika input popup is injected after the page loads.  
Once ika loads, you can click "Fill" button (without typing any input in the textarea) which will then use either the value generated by Faker.js or your custom random data function as defined in your ika form config.

```html
    <link rel="stylesheet" href="https://labs.zikani.me/ika/ika.min.css">
    <script type="module">
        import {faker} from "https://cdn.skypack.dev/@faker-js/faker@v7.4.0?dts"
        window.faker = faker
        
        window.ikaConfig = {
            faker: faker,
            floatingButton: true,
            forms: {
                "*": {
                    "firstName": "faker.name.firstName",
                    "lastName": "faker.name.lastName",
                },
                "form[name=firstForm]": {
                    "firstName": "faker.name.firstName",
                    "lastName": "faker.name.lastName",
                    "dateOfBirth": function(el) {
                        return faker.date.birthdate().toISOString().substring(0, 10)
                    }
                },
                "form[name=secondForm]": {
                    "firstName": () => "Static FirstName",
                    "lastName": () => "Static LastName",
                }
            }
        }

        import "/ika.js"
    </script>
```


### Tagged Inputs   

By default ika uses the `name`s of the fields to identify the form inputs, but for best flexibility (and integration with frameworks) you can tag your input fields with `data-ika` attributes to identify fields that you want to be able to interact with through ika.

For example:

```html
<input type="text" name="firstName" data-ika="firstName" />

<input type="text" name="lastName" data-ika="ln" />

<input type="text" name="dateOfBirth" data-ika="dateOfBirth" />

<label for="Java">
    <input type="checkbox" name="languages[]" value="java" data-ika="java"> Java
</label>
```

### Showing the ika-input at a specific position

By default, if your document doesn't have a DOM element with ID of `ika-apa`, it will create it and append it to the document which will appear on the screen as a popup. You can control where the input appears by adding an element with `ika-apa` ID in your document. Once ika loads, it will look for that element and place the input component there.

## Styling

You can modify the styling of the element to fit your application's/form's aesthetics.
In order to do so. you mostly need to modify the following elements with CSS:

```css

/* The wrapper element that contains the text area and the button */
#nndi--ika-control {}

/* The element for the button */
#nndi--ika-btn {}

/* The element for the "text area" */
#nndi--ika-txt {}
```

## LICENSE

MIT 

See [LICENSE](./LICENSE)

---

Copyright (c) Zikani Nyirenda Mwase