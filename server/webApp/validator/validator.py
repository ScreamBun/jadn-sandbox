import json
import random
import re

from typing import Tuple, Union
from jadnschema import jadn
from jadnschema.schema import Schema
# from jadnschema.convert.message import Message, MessageFormats


class Validator:
    """
    Validate messages against a given schema
    """
    validMsgs = [
        "Success",
        "Whoot! It works"
    ]
    invalidMsgs = [
        "Fail",
        "That\'s not right"
    ]

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
        except Exception as e:
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
        #
        # if not v:
        #     return False, s, "", msg
        #
        # if fmt in MessageFormats.values():
        #     try:
        #         message = Message(msg, fmt)
        #     except Exception as e:
        #         return False, f"Message Invalid - {e}", "", msg
        # else:
        #     return False, random.choice(self.invalidMsgs), "", msg
        #
        # if isinstance(s, str):
        #     return False, "Schema Invalid - The schema failed to load", "", msg
        #
        # records = list(s.types.keys())
        #
        # if decode in records:
        #     val = s.validate_as(decode, message.dict())
        #     if len(val) == 0:
        #         msgOrig = message.dumps(fmt)
        #         msgOrig = json.dumps(msgOrig) if type(msgOrig) is dict else msgOrig
        #         return True, random.choice(self.validMsgs), json.dumps(message.dict()), msgOrig
        #
        #     else:
        #         err = str(val[0])
        #         if re.match(r".*?is not <.*?>$", err):
        #             err = f"{re.sub(r':.*?$', '', err)} is improperly formatted"
        #         return False, err, json.dumps(message.dict()), message.dumps(fmt)
        # else:
        #     return False, "Decode Invalid - The decode message type was not found in the schema", "", msg
