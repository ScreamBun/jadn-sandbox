import json
import random
import re

from io import StringIO
from typing import Tuple, Union
from jadnschema import jadn
from jadnschema.schema import Schema
from jadnschema.convert.message import Message, SerialFormats
from unittest import TextTestRunner
from .profiles import get_profile_suite, load_test_suite, tests_in_suite, TestResults


class Validator:
    """
    Validate messages against a given schema
    """
    validMsgs = [
        "Success",
        "Validation passed"
    ]
    invalidMsgs = [
        "Fail",
        "Validation failed"
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
            return True, random.choice(self.validMsgs) if sm else j
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

        if fmt in SerialFormats:
            serial = SerialFormats(fmt)
            try:
                message = Message.oc2_loads(msg, serial)
            except Exception as e:  # pylint: disable=broad-except
                # TODO: pick better exception
                return False, f"Message Invalid - {e}", "", msg
        else:
            return False, random.choice(self.invalidMsgs), "", msg

        if isinstance(s, str):
            return False, "Schema Invalid - The schema failed to load", "", msg

        records = list(s.types.keys())
        if decode in records:
            try:
                val = s.validate_as(decode, message.oc2_message())
                msgOrig = message.dumps(fmt)
                msgOrig = json.dumps(msgOrig) if type(msgOrig) is dict else msgOrig
                return True, random.choice(self.validMsgs), json.dumps(message.dict()), msgOrig

            except Exception as err:  # pylint: disable=broad-except
                # TODO: pick better exception
                err = str(val[0])
                if re.match(r".*?is not <.*?>$", err):
                    err = f"{re.sub(r':.*?$', '', err)} is improperly formatted"
                return False, err, json.dumps(message.oc2_body), message.serialize()
        else:
            return False, "Decode Invalid - The decode message type was not found in the schema", "", msg

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
