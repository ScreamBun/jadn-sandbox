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

    def validateMessage(self, s, m):
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
        msgRecord = ""
        err = random.choice(self.invalidMsgs)

        for d in [d[0] for d in schema['types'] if d[1] == "Record"]:
            msgRecord = d
            print(msgRecord)
            match1 = True
            match2 = True

            try:
                print(tc.decode(d, message))

            except ValueError as e:
                err = e
                if str(e).startswith(d):
                    match1 = False
                    print("Umm...")
                # print(e)

            except TypeError as e:
                err = e
                if str(e).startswith(d):
                    match = False
                    print("Umm...")
                # print(e)

            if match1 and match2:
                break

        '''
        # Validate Message here??
        for type in schema['types']:
            if type[1] != "Record":
                continue
            
            msgKeys = list(message.keys())
            msgFormat = {}

            for k in type[len(type)-1]:
                req = True
                if len(k) >= 4:
                    if len(k[3]) >= 1:
                        req = False if k[3][0] == '?' else True

                msgFormat[k[1]] = (k[2], req)

            if self.checkKeys(type[len(type)-1], message):
                print("Valid Keys")

                return True, random.choice(self.validMsgs)
                     
            if len(msgKeys) < len(formatKeys):
                return False, random.choice(self.invalidMsgs)

            for k in msgKeys:
                if k not in formatKeys:
                    continue

            if msgKeys == [kf[0] for kf in msgFormat]:
                print(type[0])
                # print(msgFormat)

                return True, random.choice(self.validMsgs)
            '''
        return False, f"Looks Like {msgRecord} but has error:\n{err}"
