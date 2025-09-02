//For Binary, String, Array, ArrayOf, Map, MapOf, and Record types: if maxv is not present or is zero, it defaults to
export const $MAX_BINARY = 255;     //Maximum number of octets
export const $MAX_STRING = 255;     //Maximum number of characters
export const $MAX_ELEMENTS = 100;   //Maximum number of items/properties for Map, MapOf, Record, Array, ArrayOf,
export const $SYS = '$' // String{1..1} optional      // System character for TypeName
export const $TYPENAME = '^[A-Z][-$A-Za-z0-9]{0,63}$' // String{1..127} optional    // TypeName regex
export const $FIELDNAME = '^[a-z][_A-Za-z0-9]{0,63}$' // String{1..127} optional    // FieldName regex
export const $NSID = '^[A-Za-z][A-Za-z0-9]{0,7}$' // String{1..127} optional    // Namespace Identifier regex 
//For Binary, String, Array, ArrayOf, Map, MapOf, and Record types: if minv is not present, it defaults to zero.
export const $MINV = 0;

/* Unimplemented defaults:
if minc is not present, it defaults to 1.
if maxc is not present, it defaults to the greater of 1 or minc.
if maxc is 0, it defaults to the MaxElements
if maxc is less than minc, the field definition MUST be considered invalid. 
*/

//The default value of TypeOptions, Fields, and FieldOptions is the empty Array. 
//The default value of TypeDescription and FieldDescription is the empty String. 
//When serializing, default values MAY be included or omitted in the serialized document. 
//When deserializing, default values MUST be available from the API instance if not present in the document.

// Timezone Array for date-time TZ selector
export const timeZones = [
    "", "-12:00", "-11:00", "-10:00", "-09:30", "-09:00", "-08:00", "-07:00", "-06:00", "-05:00", "-04:00", "-03:30", "-03:00", "-02:00", "-01:00", "+00:00",
    "+01:00", "+02:00", "+03:00", "+03:30", "+04:00", "+04:30", "+05:00", "+05:30", "+05:45", "+06:00", "+06:30", "+07:00", "+08:00", "+08:45", "+09:00",
    "+09:30", "+10:00", "+10:30", "+11:00", "+12:00", "+12:45", "+13:00", "+14:00"
];

// Example data for data generator
import RandExp from "randexp";
export const defaultValues = (option: string, minLength: number = 0, minVal: number = 1, children: any = []) => {
    const strValue = minLength > 0 ? 'a'.repeat(minLength) : "abcdefg";
    const binValue = minLength > 0 ? '\x65'.repeat(minLength) : "\x65\x66\x67";
    const pattern = option && option.startsWith('%') ? option.slice(1) : undefined;


    const choice = pattern ? "String" : option; // make sure sending right val to optDict

    const optDict =  { // dont forget choice and enum
        // Formats (take precedence)
        // STRING FORMATS
        "/language": "en-US",
        "/QName": "www.example.com:Homepage",
        "/normalizedString": "letter",
        "/name": "_name",
        "/date": "2023-01-01",
        "/date-time": "2023-01-01T00:00+03:00",
        "/time": "12:00:00",
        "/token": "Milwaukee",
        "/relative-json-pointer": "0/foo",
        "/json-pointer": "/foo",
        "/iri-reference": "file://localhost/absolute/path/to/file",
        "/iri": "https://www.website.com",
        "/uri-template": "https://www.example.com/api/v1/items/{/item_id}",
        "/uri-reference": "http://www.example.com/questions/3456/my-document",
        "/uri": "http://www.example.com/questions/3456/my-document",
        "/anyURI": "http://www.test.com",
        "/ipv6": "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        "/ipv4": "127.0.0.1",
        "/idn-hostname": "xn--bcher-kva.example.com",
        "/hostname": "example.com",
        "/idn-email": "test@test.life",
        "/email": "jarvis@stark.com",
        "/regex": "A(BB){1,4}",
        "/NOTATION": "http://www.test.com",
        // INTEGER FORMATS
        "/duration": 1,
        "/i8": 127,
        "/i16": 32767,
        "/i32": 2147483647,
        "/i64": 92233720368547758,
        "/u8": 127,
        "/u16": 32767,
        "/u32": 4294967294,
        "/u64": 18446744073709551615,
        "/gYear": 1999,
        "/gYearMonth": "-1000-05",
        "/gMonthDay": "--04-12Z",
        "/yearMonthDuration": "P17M",
        "/dayTimeDuration": "PT30M",
        // dateTime
        // date
        // time
        "/nonNegativeInteger": 0,
        "/positiveInteger": 1,
        "/nonPositiveInteger": 0,
        "/negativeInteger": -1,
        // NUMBER FORMATS
        "/f16": 65535,
        "/f32": 3.402823466e+38,
        "/f64": 1.7976931348623157e+308,
        // BINARY FORMATS
        "/eui": "00:00:5e:00:53:01",
        "/ipv4-addr": "127.0.0.1",
        "/ipv6-addr": "2001:db8:3333:4444:5555:6666:1.2.3.4",
        "/b": "ABCD",
        "/x": "acbd",
        "/X": "ABCD",
        // Core Types
        "String": pattern !== undefined ? new RandExp(pattern).gen() : strValue,
        "Integer": parseInt(minVal.toString()),
        "Number": parseFloat(minVal.toString()),
        "Binary": binValue,
        "Boolean": true,
        "Enumerated": children.length > 0 ? children[0] : undefined,
        "Choice": children.length > 0 ? children[0][1] : undefined,
    };

    return (optDict as any)[choice] !== undefined ? (optDict as any)[choice] : undefined;
}