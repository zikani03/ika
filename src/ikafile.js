import {faker} from "https://cdn.skypack.dev/@faker-js/faker@v7.4.0?dts"
window.faker = faker

function randomDate(el) {
    return faker.date.birthdate().toISOString().substring(0, 10)
}
var ikaFakerOptions = {
    "firstName": "faker.name.firstName",
    "lastName": "faker.name.lastName",
    "dateOfBirth": randomDate,
}

let ikaPagesConfig = {
    "accountCreationForm": {
        "firstName": "faker.name.firstName",
        "lastName": "faker.name.lastName",
        "dateOfBirth": randomDate,
    },
    
    "updateAccountForm": {
        "firstName": "faker.name.firstName",
        "lastName": "faker.name.lastName",
        "dateOfBirth": randomDate,
    }
}

window.ikaFakerOptions = ikaPagesConfig;
import "https://labs.zikani.me/ika/ika.js"