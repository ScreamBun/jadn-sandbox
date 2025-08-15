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

export const timeZones = [
    "", "-12:00", "-11:00", "-10:00", "-09:30", "-09:00", "-08:00", "-07:00", "-06:00", "-05:00", "-04:00", "-03:30", "-03:00", "-02:00", "-01:00", "+00:00",
    "+01:00", "+02:00", "+03:00", "+03:30", "+04:00", "+04:30", "+05:00", "+05:30", "+05:45", "+06:00", "+06:30", "+07:00", "+08:00", "+08:45", "+09:00",
    "+09:30", "+10:00", "+10:30", "+11:00", "+12:00", "+12:45", "+13:00", "+14:00"
];