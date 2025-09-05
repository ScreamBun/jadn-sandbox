import json
import cbor2
import jadn 
import xml.etree.ElementTree as ET

from typing import Tuple, Union

from jadnschema.jadn import loads
from jadnvalidation import DataValidation
from jadnvalidation.data_validation.schemas.jadn_meta_schema import j_meta_schema, j_meta_roots

from webApp.validator.utils import BaseEnum
from webApp.utils.utils import get_value_errors
from webApp.utils import constants

class SerialFormats(BaseEnum):
    CBOR = 'cbor'
    JSON = 'json'
    XML = 'xml'    

class Validator:
    
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
        

    # TODO: Change from validateMessage to validateData
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
        
        # Validate the schema first
        try :
            j_validation = DataValidation(j_meta_schema, j_meta_roots, schema)
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
        
        # Validate the data against the user's schema
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
            j_validation = DataValidation(j_meta_schema, j_meta_roots, jadn_src)
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
        
