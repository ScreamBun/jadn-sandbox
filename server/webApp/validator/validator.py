import json
import cbor2
import jadn 
import xml.etree.ElementTree as ET
import regex

from typing import Tuple, Union

from jadnvalidation import DataValidation
from jadnvalidation.data_validation.schemas.jadn_meta_schema import j_meta_schema_updated, j_meta_roots
from jsonschema import Draft7Validator, ValidationError, FormatChecker

from webApp.utils.utils import BaseEnum, get_value_errors
from webApp.utils import constants

class SerialFormats(BaseEnum):
    CBOR = 'cbor'
    JSON = 'json'
    XML = 'xml'
    COMPACT = 'compact'
    CONCISE = 'concise'

class Validator:
    
    def __init__(self):
        """Initialize the validator with custom format checker for Unicode regex patterns."""
        self._custom_format_checker = self._create_custom_format_checker()
    
    def _regex_format_checker(self, instance):
        """
        Custom format checker for regex patterns that supports Unicode property classes.
        Uses the 'regex' module instead of the standard 're' module.
        """
        if not isinstance(instance, str):
            return True
        try:
            regex.compile(instance)
            return True
        except regex.error:
            return False
    
    def _create_custom_format_checker(self):
        """Create a custom format checker instance with Unicode regex support."""
        format_checker = FormatChecker()
        format_checker.checks('regex')(self._regex_format_checker)
        return format_checker
    
    def validateJsonSchema(self, schema: Union[dict, str]) -> Tuple[bool, Union[str, dict]]:
        """
        Validate the given JSON Schema
        :param schema: (JSON String) schema to validate against
        :return: (tuple) valid/invalid bool, schema
        """
        try:
            if isinstance(schema, dict):
                schema = json.dumps(schema)
                            
            schema_dict = json.loads(schema)
            
            # Use a validator instance with custom format checker instead of check_schema class method
            # This allows us to handle Unicode regex patterns properly
            validator = Draft7Validator(Draft7Validator.META_SCHEMA, format_checker=self._custom_format_checker)
            
            # Validate the schema structure using our custom validator
            list(validator.iter_errors(schema_dict))  # This will raise ValidationError if invalid
            
            return True, schema_dict
        except ValidationError as e:
            return False, f"Your JSON schema is invalid: {e.message}"
        except Exception as e:
            return False, f"An unexpected error occurred during json schema validation: {e}"
    
    def validateSchema(self, schema: Union[dict, str], sm: bool = True) -> Tuple[bool, Union[str, any]]:
        """
        Validate the given JADN Schema
        :param schema: (JADN String) schema to validate against
        :param sm: (bool) return bool or schema
        :return: (tuple) valid/invalid bool, schema
        """
        try:
            if isinstance(schema, str):
                schema = json.loads(schema)
                
            j_validation = DataValidation(j_meta_schema_updated, j_meta_roots, schema)
            j_validation.validate()
            
            return True, "Schema is Valid" if sm else schema
        except Exception as e:
            return False, f"Schema Invalid - {e}"

    def validateData(self, schema: Union[bytes, dict, str], data: Union[str, bytes, dict], data_format: str, root: str) -> Tuple:
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

        if data_format == None or data_format == "":
            return False, "Serialization Format selection required", "", data
        
        data_format = data_format.lower()
        
        if data_format not in SerialFormats:
            return False, "Serialization Format not found", "", data
        
        # Validate the schema first
        try :
            j_validation = DataValidation(j_meta_schema_updated, j_meta_roots, schema)
            j_validation.validate()
        except Exception as e:
            errorMsgs = []
            errorMsgs = get_value_errors(e)
            return False, errorMsgs, "", schema
        
        serial = SerialFormats(data_format)
        match serial.value:
            case (constants.JSON | constants.COMPACT_CONSTANT | constants.CONCISE_CONSTANT):
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
            j_validation = DataValidation(j_meta_schema_updated, j_meta_roots, jadn_src)
            j_validation.validate()
            return True, ""
        except Exception as e:
            return False, f"Schema Error - {e}"
    
    def validate_jidl(self, jidl_src: str) -> Tuple[bool, str]:
        try:
            jadn_doc = jadn.convert.jidl_loads(jidl_src)
        except Exception as e:  # pylint: disable=broad-except
            return False, f"JIDL Invalid - {e}"   
        
        return True, jadn_doc 
        
