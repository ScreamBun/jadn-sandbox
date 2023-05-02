from enum import Enum
import json


class FormatType(Enum):
    BINARY = 'Binary'
    INTEGER = 'Integer'
    NUMBER = 'Number'
    ARRAY = 'Array'
    STRING = 'String'


class FormatOptionModel():  

    def __init__(self, name, ui_name, spec, type, note="", rule=""):
        self.name = name
        self.ui_name = ui_name
        self.spec = spec
        self.type = type
        self.note = note
        self.rule = rule


    def __iter__(self):
        yield from {
            "name": self.name,
            "ui_name": self.ui_name,
            "spec": self.spec,
            "type": self.type,
            "note": self.note,
            "rule": self.rule
        }.items()

    def __str__(self):
        return json.dumps(dict(self), ensure_ascii=False)

    def __repr__(self):
        return self.__str__()   
    