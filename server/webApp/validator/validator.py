import json
import cbor2
import jadn 
import xml.etree.ElementTree as ET

from flask import current_app
from typing import Tuple, Union

from jadnschema.jadn import loads
from jadnschema.schema import Schema
from jadnschema.convert.message import SerialFormats
from jadnschema.convert.schema.writers.json_schema.schema_validator import validate_schema_jadn_syntax

from jadnvalidation import DataValidation

from webApp.utils.utils import get_value_errors
from webApp.utils import constants


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

    def validateSchema(self, schema: Union[bytes, dict, str], sm: bool = True) -> Tuple[bool, Union[str, Schema]]:
        """
        Validate the given schema
        :param schema: (JSON String) schema to validate against
        :param sm: (bool) return success message or schema
        :return: (tuple) valid/invalid bool, message/schema
        """
        try:
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
        v, s = self.validateSchema(schema, False)
        if not v:
            return False, s, "", data

        if isinstance(s, str):
            return False, "Schema Invalid - The schema failed to load", "", data

        if data_format not in SerialFormats:
            return False, "Serialization Format not found", "", data
        
        # TODO: Validation logic should be moved to jadnvalidation \ data validaiton
        serial = SerialFormats(data_format)
        match serial:
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

        try: 
            validate_schema_jadn_syntax(jadn_src) 
        except Exception as ex:
            print(f"Syntax Error: {str(ex)}")
            return False, f"Schema Error - {ex}"  
        
        valid_bool, err = current_app.validator.validateSchema(jadn_src) 
        if not valid_bool:
            print(f"JADN Error: {str(err)} ")
            return False, f"JADN Error - {err}" 

        try: 
            jadn.check(jadn_src) # uses jsonschema to check jadn - jadn_v1.0_schema.json
        except Exception as ex:
            print(f"JADN Error : {ex}")
            return False, f"JADN Error - {ex}"   
        
        return True, ""
    
    def validate_jidl(self, jidl_src: str) -> Tuple[bool, str]:
        
        try:
            # jidl_doc = jidl_dumps(jidl_src)
            jadn_doc = jadn.convert.jidl_loads(jidl_src)
        except Exception as e:  # pylint: disable=broad-except
            return False, f"JIDL Invalid - {e}"   
        
        return True, jadn_doc 
        
