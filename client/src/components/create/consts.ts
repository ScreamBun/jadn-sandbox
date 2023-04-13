//For Binary, String, Array, ArrayOf, Map, MapOf, and Record types: if maxv is not present or is zero, it defaults to
export const $MAX_BINARY = 255;     //Maximum number of octets
export const $MAX_STRING = 255;     //Maximum number of characters
export const $MAX_ELEMENTS = 100;   //Maximum number of items/properties for Map, MapOf, Record, Array, ArrayOf,

//For Binary, String, Array, ArrayOf, Map, MapOf, and Record types: if minv is not present, it defaults to zero.
export const $MINV = 0;

/* Unimplemented defaults:
if minc is not present, it defaults to 1.
if maxc is not present, it defaults to the greater of 1 or minc.
if maxc is 0, it defaults to the MaxElements
if maxc is less than minc, the field definition MUST be considered invalid. 

   4 $Sys         String{1..1} optional      // System character for TypeName
   5 $TypeName    String{1..127} optional    // TypeName regex
   6 $FieldName   String{1..127} optional    // FieldName regex
   7 $NSID        String{1..127} optional    // Namespace Identifier regex 
   
    NSID = String{pattern="$NSID"}               // Default = ^[A-Za-z][A-Za-z0-9]{0,7}$
    TypeName = String{pattern="$TypeName"}       // Default = ^[A-Z][-$A-Za-z0-9]{0,63}$
    FieldName = String{pattern="$FieldName"}     // Default = ^[a-z][_A-Za-z0-9]{0,63}$
*/

//The default value of TypeOptions, Fields, and FieldOptions is the empty Array. 
//The default value of TypeDescription and FieldDescription is the empty String. 
//When serializing, default values MAY be included or omitted in the serialized document. 
//When deserializing, default values MUST be available from the API instance if not present in the document.

export const $FIELDS_IDX = 5;

//MUST NOT create FieldNames containing the JSON Pointer field separator "/",