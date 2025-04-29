import { IkaFakerOptions } from "./types";

function dob(el: any, faker: any): any {
    return faker.date.birthdate().toISOString().substring(0, 10)
}

const defaultForms = {
    "*": {
        "name": "faker.name.firstName",
        "firstName": "faker.name.firstName",
        "lastName": "faker.name.lastName",
        "First Name": "faker.name.firstName",
        "dob": dob,
        "birthday": dob,
        "dateOfBirth": dob,
    },
}

export default defaultForms;