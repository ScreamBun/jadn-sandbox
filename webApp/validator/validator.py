import json
import random

from oc2 import OpenC2MessageFormats
from oc2.codec import Codec, jadn_loads
from oc2.message import OpenC2Message
from oc2.utils import Utils


class Validator(object):
    """
    Validate messages against a given schema
    """
    def __init__(self):
        self.validMsgs = [
            'Success',
            'Whoot! It works'
        ]

        self.invalidMsgs = [
            'Fail',
            'That\'s not right'
        ]

    def validateSchema(self, schema, sm=True):
        """
        Validate the given schema
        :param schema: (JSON String) schema to validate against
        :param sm: (bool) return success message or schema
        :return: (tuple) valid/invalid bool, message/schema
        """
        try:
            j = jadn_loads(schema)
            return True, random.choice(self.validMsgs) if sm else j

        except Exception as e:
            return False, "Schema Invalid - {}".format(e)

    def validateMessage(self, schema, msg, fmt, decode):
        """
        Validate messages against the given schema
        :param schema: (str) schema to validate against
        :param msg: (str) message to validate against the schema
        :param fmt: (str) format of the message to decode
        :param decode: (str) format to decode the message as
        :return: (tuple) valid/invalid bool, message
        """
        v, s = self.validateSchema(schema, False)
        err = random.choice(self.invalidMsgs)

        if not v:
            return False, s, '', msg

        if fmt in OpenC2MessageFormats.values():
            try:
                message = OpenC2Message(msg, fmt)
            except Exception as e:
                message = ''
                return False, "Message Invalid - {}".format(e), '', msg
        else:
            return False, err, '', msg
        try:
            tc = Codec(s, True, True)
        except (AssertionError, ):
            return False, 'Schema Invalid - The schema failed to load', '', msg

        records = [t[0] for t in s['types']]
        err = random.choice(self.invalidMsgs)

        if decode in records:
            try:
                msg = tc.decode(decode, message.json_dump())

                msgOrig = message.original_dump()
                msgOrig = json.dumps(msgOrig) if type(msgOrig) is dict else msgOrig

                return True, random.choice(self.validMsgs), json.dumps(message.json_dump()), msgOrig

            except (ValueError, TypeError) as e:
                err = str(e)
                return False, err, json.dumps(message.json_dump()), message.original_dump()
        else:
            return False, 'Decode Invalid - The decode message type was not found in the schema', '', msg
