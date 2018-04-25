import json
import random


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

    def validateMessage(self, s, m):
        """
        Validate messages against the given schema
        :param s: (JSON String) schema to validate against
        :param m: (JSON String) message to validate against the schema
        :return: (tuple) valid/invalid bool, message
        """
        v = False
        schema = None
        message = None

        try:
            schema = json.loads(s)
        except Exception as e:
            print(e)
            return False, "Schema Invalid"

        try:
            message = json.loads(m)
        except Exception as e:
            print(e)
            return False, "Message Invalid"

        # Validate Message here??
        for type in schema['types']:
            # print(type)
            psudoTypeKeys = [k[1] for k in type[len(type)-1]]
            msgKeys = list(message.keys())

            print(psudoTypeKeys)
            print(msgKeys)

            if psudoTypeKeys == msgKeys:
                print(type[0])

        return v, random.choice(self.validMsgs) if v else random.choice(self.invalidMsgs)
