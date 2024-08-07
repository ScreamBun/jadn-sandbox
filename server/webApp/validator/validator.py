import json
import random
import traceback
import cbor_json
import binascii

from io import StringIO
from typing import Tuple, Union
from jadnschema import jadn
from jadnschema.schema import Schema
from jadnschema.convert.message import Message, SerialFormats, decode_msg
from unittest import TextTestRunner
from pydantic import ValidationError

from webApp.utils import constants
from webApp.validator.utils import getValidationErrorMsg, getValidationErrorPath
from .profiles import get_profile_suite, load_test_suite, tests_in_suite, TestResults


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
    # Schema Test suites
    _unittest_suite = load_test_suite()
    _loaded_tests = tests_in_suite(_unittest_suite)

    def validateSchema(self, schema: Union[bytes, dict, str], sm: bool = True) -> Tuple[bool, Union[str, Schema]]:
        """
        Validate the given schema
        :param schema: (JSON String) schema to validate against
        :param sm: (bool) return success message or schema
        :return: (tuple) valid/invalid bool, message/schema
        """
        try:
            j = jadn.loads(schema)
            return True, "Schema is Valid" if sm else j
        except Exception as e:  # pylint: disable=broad-except
            # TODO: pick better exception
            return False, f"Schema Invalid - {e}"

    def validateMessage(self, schema: Union[bytes, dict, str], msg: Union[str, bytes, dict], fmt: str, decode: str) -> Tuple:
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
            return False, s, "", msg

        if isinstance(s, str):
            return False, "Schema Invalid - The schema failed to load", "", msg

        if fmt not in SerialFormats:
            return False, "Serialization Format not found", "", msg
        
        
        serial = SerialFormats(fmt)
        match serial:
            case constants.JSON:
                try:
                    data_serialized = Message.oc2_loads(msg, serial)
                except Exception as e: 
                    err_msg = e
                    return False, f"Invalid Data: {err_msg}", "", msg     

            case constants.XML:
                try:
                    data_serialized = decode_msg(msg, serial, root=decode)
                except Exception as e: 
                    err_msg = e
                    return False, f"Invalid Data: {err_msg}", "", msg

            case constants.CBOR:
                try:
                    msg_hex_string = msg
                    msg_binary_string = binascii.unhexlify(msg_hex_string)
                    msg_native_json = cbor_json.native_from_cbor(msg_binary_string)

                    serial = SerialFormats('json')
                    data_serialized = Message.oc2_loads(msg_native_json, serial)
                except Exception as e:
                    return False, f"Invalid Data: {e}", "", msg
            
            case _:
                return False, "Unknown format selected", "", msg       
            
            
        records = list(s.types.keys())
        if decode in records:

            try:
                if fmt == constants.XML:
                    s.validate_as(decode, data_serialized)
                else:
                    s.validate_as(decode, data_serialized.content)
                    
                return True, random.choice(self.validMsgs), json.dumps(msg), msg

            except Exception as err: 
                errorMsgs=[]
                if isinstance(err, ValidationError):
                    for error in err.errors():
                        err_msg = getValidationErrorMsg(error)
                        err_path = getValidationErrorPath(error)

                        path = [i for i in err_path.split('/') if i != '__root__'] 
                        new_path = '/'.join(path)
                        
                        if err_path:
                            errorMsgs.append(err_msg + " at " +  new_path)
                        else:
                            errorMsgs.append(err_msg)
                    return False, errorMsgs, "", msg
                elif isinstance(err, AttributeError):
                    for error in err.args:
                        errorMsgs.append(error)
                    return False, errorMsgs, "", msg
                else:
                    return False, err, "", msg

        else:
            return False, "Invalid Export: The decode message type was not found in the schema", "", msg

    # Profile test validation
    def getProfileTests(self, profile: str = None) -> dict:
        profile_tests = self._loaded_tests
        if profile:
            for unit, info in self._loaded_tests.items():
                if profile in info["profiles"]:
                    return {unit: info}
            return {}
        return profile_tests

    def validateSchemaProfile(self, schema: Union[bytes, dict, str, Schema], profile: str = "language") -> dict:
        schema_obj: Schema = None
        if isinstance(schema, Schema):
            schema_obj = schema
        elif isinstance(schema, dict):
            schema_obj = Schema.parse_obj(schema)
        elif isinstance(schema, (bytes, str)):
            schema_obj = Schema.parse_raw(schema)

        if test_suite := get_profile_suite(self._unittest_suite, profile, schema=schema_obj):
            test_log = StringIO()
            results = TextTestRunner(
                stream=test_log,
                failfast=False,
                resultclass=TestResults
            ).run(test_suite)
            return results.getReport(verbose=True)
        return {}
    
    def validate_jidl(self, jidl_src: str) -> Tuple[bool, str]:
        
        try:
            jidl_doc = jadn.convert.jidl_dumps(jidl_src)
        except Exception as e:  # pylint: disable=broad-except
            # TODO: pick better exception
            return False, f"JIDL Invalid - {e}"   
                          
        # except (ValueError) as err:
        #     tb = traceback.format_exc()
        #     # TODO: Attempt to get error message
        #     return_val = tb
        
        return True, "" 
        
