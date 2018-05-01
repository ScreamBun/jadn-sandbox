import json
import random

from webApp.libs.jadn.codec.codec import Codec
from webApp.libs.jadn.codec.jadn import jadn_loads


class Validator(object):
    """
    Validate messages against a given schema
    """
    def __init__(self):
        self.validMsgs = [
            'Success',
            'It\'s Gonna do the thing!!',
            'Whoot! It works'
        ]

        self.invalidMsgs = [
            'Fail',
            'It\'s Broken',
            'That\'s not right'
        ]

    def validateSchema(self, s, m=True):
        """
        Validate the given schema
        :param s: (JSON String) schema to validate against
        :param m: (bool) return success message or schema
        :return: (tuple) valid/invalid bool, message/schema
        """
        try:
            j = jadn_loads(s)
            return True, random.choice(self.validMsgs) if m else j

        except Exception as e:
            return False, "Schema Invalid - {}".format(e)

    def validateMessage(self, s, m, d):
        """
        Validate messages against the given schema
        :param s: (JSON String) schema to validate against
        :param m: (JSON String) message to validate against the schema
        :return: (tuple) valid/invalid bool, message
        """

        v, schema = self.validateSchema(s, False)
        if not v:
            return False, schema

        try:
            message = json.loads(m)
        except Exception as e:
            return False, "Message Invalid - {}".format(e)

        tc = Codec(schema, True, True)
        records = [t[0] for t in schema['types']]
        err = random.choice(self.invalidMsgs)

        if d in records:
            try:
                msg = tc.decode(d, message)
                return True, random.choice(self.validMsgs)

            except (ValueError, TypeError) as e:
                err = str(e)
                return False, err

        return False, err
