import json
import cbor2
import jadn 
import xml.etree.ElementTree as ET

from typing import Tuple, Union

from jadnschema.jadn import loads
from jadnvalidation import DataValidation

from server.webApp.validator.utils import BaseEnum
from webApp.utils.utils import get_value_errors
from webApp.utils import constants

class SerialFormats(BaseEnum):
    CBOR = 'cbor'
    JSON = 'json'
    XML = 'xml'    

class Validator:
    """
    Validate messages against a given schema
    """
    validMsgs = [
        "Valid",
        "Validation passed",
        "Validation success"
    ]
    invalidMsgs = [
        "Invalid",
        "Validation failed",
        "Validation error"
    ]
    
    # TODO: Move to jadnvalidation at the default schema for validations
    j_meta_schema = {
        "meta": {
        "title": "JADN Metaschema",
        "package": "http://oasis-open.org/openc2/jadn/v2.0/schema",
        "description": "Syntax of a JSON Abstract Data Notation (JADN) package.",
        "license": "CC-BY-4.0",
        "roots": ["Schema"],
            "config": {
                "$FieldName": "^[$A-Za-z][_A-Za-z0-9]{0,63}$"
            }
        },

        "types": [
        ["Schema", "Record", [], "Definition of a JADN package", [
            [1, "meta", "Metadata", ["[0"], "Information about this package"],
            [2, "types", "Type", ["[1", "]-1"], "Types defined in this package"]
        ]],

        ["Metadata", "Map", [], "Information about this package", [
            [1, "package", "Namespace", [], "Unique name/version of this package"],
            [2, "version", "String", ["{1", "[0"], "Incrementing version within package"],
            [3, "title", "String", ["{1", "[0"], "Title"],
            [4, "description", "String", ["{1", "[0"], "Description"],
            [5, "comment", "String", ["{1", "[0"], "Comment"],
            [6, "copyright", "String", ["{1", "[0"], "Copyright notice"],
            [7, "license", "String", ["{1", "[0"], "SPDX licenseId of this package"],
            [8, "namespaces", "PrefixNS", ["[0", "]-1"], "Referenced packages"],
            [9, "roots", "TypeName", ["[0", "]-1"], "Roots of the type tree(s) in this package"],
            [10, "config", "Config", ["[0"], "Configuration variables"],
            [11, "jadn_version", "Namespace", ["[0"], "JADN Metaschema package"]
        ]],

        ["PrefixNs", "Array", [], "Prefix corresponding to a namespace IRI", [
            [1, "prefix", "NSID", [], "Namespace prefix string"],
            [2, "namespace", "Namespace", [], "Namespace IRI"]
        ]],

        ["Config", "Map", ["{1"], "Config vars override JADN defaults", [
            [1, "$MaxBinary", "Integer", ["y1", "[0"], "Package max octets, default = 255"],
            [2, "$MaxString", "Integer", ["y1", "[0"], "Package max characters, default = 255"],
            [3, "$MaxElements", "Integer", ["y1", "[0"], "Package max items/properties, default = 255"],
            [4, "$Sys", "String", ["{1", "}1", "[0"], "System character for TypeName, default = '.'"],
            [5, "$TypeName", "String", ["/regex", "[0"], "Default = ^[A-Z][-.A-Za-z0-9]{0,63}$"],
            [6, "$FieldName", "String", ["/regex", "[0"], "Default = ^[a-z][_A-Za-z0-9]{0,63}$"],
            [7, "$NSID", "String", ["/regex", "[0"], "Default = ^([A-Za-z][A-Za-z0-9]{0,7})?$"]
        ]],

        ["Namespace", "String", ["/uri"], "Unique name of a package"],

        ["NSID", "String", ["%^([A-Za-z][A-Za-z0-9]{0,7})?$"], "Namespace prefix matching $NSID"],

        ["TypeName", "String", ["%^[A-Z][-.A-Za-z0-9]{0,63}$"], "Name of a logical type"],

        ["FieldName", "String", ["%^[a-z][_A-Za-z0-9]{0,63}$"], "Name of a field in a structured type"],

        ["TypeRef", "String", [], "Reference to a type, matching ($NSID ':')? $TypeName"],

        ["Type", "Array", [], "", [
            [1, "type_name", "TypeName", [], ""],
            [2, "core_type", "Enumerated", ["#JADN-Type"], ""],
            [3, "type_options", "Options", ["[0"], ""],
            [4, "type_description", "Description", ["[0"], ""],
            [5, "fields", "JADN-Type", ["[0", "&2"], ""]
        ]],

        ["JADN-Type", "Choice", [], "", [
            [1, "Binary", "Empty", [], ""],
            [2, "Boolean", "Empty", [], ""],
            [3, "Integer", "Empty", [], ""],
            [4, "Number", "Empty", [], ""],
            [5, "String", "Empty", [], ""],
            [6, "Enumerated", "Items", [], ""],
            [7, "Choice", "Fields", [], ""],
            [8, "Array", "Fields", [], ""],
            [9, "ArrayOf", "Empty", [], ""],
            [10, "Map", "Fields", [], ""],
            [11, "MapOf", "Empty", [], ""],
            [12, "Record", "Fields", [], ""]
        ]],

        ["Empty", "Array", ["}0"], "", []],

        ["Items", "ArrayOf", ["*Item"], ""],

        ["Fields", "ArrayOf", ["*Field"], ""],

        ["Item", "Array", [], "", [
            [1, "item_id", "FieldID", [], ""],
            [2, "item_value", "String", [], ""],
            [3, "item_description", "Description", ["[0"], ""]
        ]],

        ["Field", "Array", [], "", [
            [1, "field_id", "FieldID", [], ""],
            [2, "field_name", "FieldName", [], ""],
            [3, "field_type", "TypeRef", [], ""],
            [4, "field_options", "Options", ["[0"], ""],
            [5, "field_description", "Description", ["[0"], ""]
        ]],

        ["FieldID", "Integer", ["y0"], ""],

        ["Options", "ArrayOf", ["*Option"], ""],

        ["Option", "String", ["{1"], ""],

        ["Description", "String", [], ""]
        ]
    }  

    def validateSchema(self, schema: Union[bytes, dict, str], sm: bool = True) -> Tuple[bool, Union[str, any]]:
        """
        Validate the given schema
        :param schema: (JSON String) schema to validate against
        :param sm: (bool) return success message or schema
        :return: (tuple) valid/invalid bool, message/schema
        """
        # try :
        #     j_validation = DataValidation(self.j_meta_schema, "Schema", schema)
        #     j_validation.validate()
        #     return True, "Validation passed", "", schema
        # except Exception as e:
        #     errorMsgs = []
        #     errorMsgs = get_value_errors(e)
        #     return False, errorMsgs, "", schema
        try:
            # TODO: Look into this, see if we can replace it with jadnvalidation
            j = loads(schema)
            return True, "Schema is Valid" if sm else j
        except Exception as e:
            return False, f"Schema Invalid - {e}"        
        

    def validateMessage(self, schema: Union[bytes, dict, str], data: Union[str, bytes, dict], data_format: str, root: str) -> Tuple:
        """
        Validate messages against the given schema
        :param schema: schema to validate against
        :param msg: message to validate against the schema
        :param fmt: format of the message to decode
        :param decode: format to decode the message as
        :return: valid/invalid bool, message
        """

        if isinstance(schema, str):
            return False, "Schema Invalid - The schema failed to load", "", data

        if data_format not in SerialFormats:
            return False, "Serialization Format not found", "", data
        
        try :
            j_validation = DataValidation(self.j_meta_schema, "Schema", schema, SerialFormats.JSON.value)
            j_validation.validate()
        except Exception as e:
            errorMsgs = []
            errorMsgs = get_value_errors(e)
            return False, errorMsgs, "", schema
        
        serial = SerialFormats(data_format)
        match serial.value:
            case constants.JSON:
                try:
                    data = json.loads(data)
                except Exception as e: 
                    err_msg = e
                    return False, f"Invalid JSON Data: {err_msg}", "", data     

            case constants.XML:
                try:
                    ET.fromstring(data)       
                except Exception as e: 
                    err_msg = e
                    return False, f"Invalid XML Data: {err_msg}", "", data

            case constants.CBOR:
                try:
                    # TODO: Add logic to support hex or base64 encoded CBOR
                    # TODO: Move logic to jadn cbor
                    cbor_data = bytes.fromhex(data)
                    data = cbor2.loads(cbor_data)
                except Exception as e:
                    return False, f"Invalid Data: {e}", "", data
            
            case _:
                return False, "Unknown format selected", "", data
        
        try :
            j_validation = DataValidation(schema, root, data, data_format)
            j_validation.validate()
            return True, "Validation passed", json.dumps(data), data
        except Exception as e:
            errorMsgs = []
            errorMsgs = get_value_errors(e)
            return False, errorMsgs, "", data


    def validate_jadn(self, jadn_src: dict) -> Tuple[bool, str]:
        try :
            j_validation = DataValidation(self.j_meta_schema, "Schema", jadn_src, SerialFormats.JSON.value)
            j_validation.validate()
            return True, ""
        except Exception as e:
            return False, f"Schema Error - {e}"
    
    def validate_jidl(self, jidl_src: str) -> Tuple[bool, str]:
        
        try:
            # jidl_doc = jidl_dumps(jidl_src)
            jadn_doc = jadn.convert.jidl_loads(jidl_src)
        except Exception as e:  # pylint: disable=broad-except
            return False, f"JIDL Invalid - {e}"   
        
        return True, jadn_doc 
        
