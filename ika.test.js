var Ika = require('./ika');
var parser = new Ika({})

function mapAsObject(map) {
    var obj= {};
    map.forEach((value, key) => obj[key] = value);
    return obj;
}

var shortMapping = {
    f: "firstName",
    l: "lastName",
    d: "dateOfBirth",
    e: "eyeColor"
};

var longMapping = {
    firstName: "firstName",
    lastName: "lastName",
    dateOfBirth: "dateOfBirth",
    eyeColor: "eyeColor"
};

const testCases = [
    {
        input: "f:John l:Banda d:1990-02-03 e:brown",
        expected: {
            "firstName": "John", 
            "lastName": "Banda",
            "dateOfBirth": "1990-02-03",
            "eyeColor": "brown"
        }
    },
    {
        input: "f: John l: Banda Banda d: 1990-02-03 e: brown",
        expected: {
            "firstName": "John", 
            "lastName": "Banda Banda",
            "dateOfBirth": "1990-02-03",
            "eyeColor": "brown"
        }
    },
    {
        input: "f:\"John\" l:\"Banda\" d:\"1990-02-03\" e:\"brown\"",
        expected: {
            "firstName": "John", 
            "lastName": "Banda",
            "dateOfBirth": "1990-02-03",
            "eyeColor": "brown"
        }
    },
    {
        input: "f:John,l:Banda,d:1990-02-03,e:brown",
        expected: {
            "firstName": "John", 
            "lastName": "Banda",
            "dateOfBirth": "1990-02-03",
            "eyeColor": "brown"
        }
    },
    {
        input: "f:'John' l:'Banda' d:'1990-02-03' e:'brown'",
        expected: {
            "firstName": "John", 
            "lastName": "Banda",
            "dateOfBirth": "1990-02-03",
            "eyeColor": "brown"
        }
    }
];

var fullMappingTestCases = [
    {
        input: "firstName:'Long John' lastName:'Banda' dateOfBirth:'1970-02-03' eyeColor:'brown'",
        expected: {
            "firstName": "Long John", 
            "lastName": "Banda",
            "dateOfBirth": "1970-02-03",
            "eyeColor": "brown"
        }
    }
];

// Start tests

test('test basic mapping', () => {
    var result = parser.parseMapping(
        "f:John l:'Banda' d:'1990-02-03' e:'brown'", 
        {
            "f": "firstName",
            "l": "lastName",
            "d": "dateOfBirth",
            "e": "eyeColor"
        });

    expect(result).toBeInstanceOf(Map);


    expect(mapAsObject(result)).toEqual({
        "firstName": "John", 
        "lastName": "Banda",
        "dateOfBirth": "1990-02-03",
        "eyeColor": "brown"
    });
});

describe('invalid input tests', () => {
    var invalidInputs = [
        {
            input: "",
            expected: null
        },
        {
            input: "t:",
            expected: null
        },
        {
            input: "t:t:",
            expected: null
        },
        {
            input: "t: t:",
            expected: null
        },
    ];

    for (var testCase of invalidInputs) {
        test(testCase.input, () => {
            var result = parser.parseMapping(testCase.input, shortMapping);
            expect(result).toBeNull();
        });
    }
});

describe('short mapping tests', () => {
    for (var testCase of testCases) {
        test(testCase.input, () => {
            var result = parser.parseMapping(testCase.input, shortMapping);
            expect(result).toBeInstanceOf(Map);
            expect(mapAsObject(result)).toEqual(testCase.expected);
        });
    }
})

describe('longer form mapping tests', () => {
    for (var testCase of fullMappingTestCases) {
        test(testCase.input, () => {
            var result = parser.parseMapping(testCase.input, longMapping);
            expect(result).toBeInstanceOf(Map);
            expect(mapAsObject(result)).toEqual(testCase.expected);
        });
    }
});