import json
import random

from webApp.jadn.codec.codec import Codec
from webApp.jadn.codec.jadn import jadn_loads


class Validator(object):
    """
    Validate messages against a given schema
    """
    def __init__(self):
        self.validMsgs = [
            'Success',
            'It\'s Gonna do the thing!!'
        ]

        self.invalidMsgs = [
            'Fail',
            'It\'s Broken'
        ]

        pass

    def validateMessage(self, s, m, d):
        """
        Validate messages against the given schema
        :param s: (JSON String) schema to validate against
        :param m: (JSON String) message to validate against the schema
        :return: (tuple) valid/invalid bool, message
        """

        try:
            schema = jadn_loads(s)
        except Exception as e:
            return False, f"Schema Invalid - {e}"

        try:
            message = json.loads(m)
        except Exception as e:
            return False, f"Message Invalid - {e}"

        tc = Codec(schema, True, True)
        err = ""
        records = [t[0] for t in schema['types'] if t[1] == "Record"]
        err = random.choice(self.invalidMsgs)

        if d in records:
            print("Valid Record Type")

            try:
                msg = tc.decode(d, message)
                return True, random.choice(self.validMsgs)

            except (ValueError, TypeError) as e:
                err = str(e)

            return False, err

        return False, random.choice(self.invalidMsgs)
