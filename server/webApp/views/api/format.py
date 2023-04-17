from enum import Enum
import json
import logging
import traceback

from flask import current_app, jsonify, request
from flask_restful import Resource, reqparse
from jadnschema.convert import dumps


logger = logging.getLogger(__name__)

parser = reqparse.RequestParser()
parser.add_argument("schema", type=dict)

class Format(Resource):
    """
    Endpoint for api/format
    """

    def post(self):
        #args = parser.parse_args()
        request_json = request.json

        try:
            output = dumps(request_json)

        except (TypeError, ValueError):
            tb = traceback.format_exc()
            raise Exception("Error: " + tb)
        
        return jsonify({
            "schema": output
        })
    

class FormatOptions(Resource):
    """
    Endpoint for api/format/options
    """

    def get(self):
        
        try:
            j = jsonify({
                "format_options": get_formats()
            }) 
        except:
            raise  traceback.print_exc()

        return j
         

# Register resources (APIs)
resources = {
    Format: {"urls": ("/", )},
    FormatOptions: {"urls": ("/options", )}
}

def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))         


class FormatType(Enum):
    JSON = 'JSON Formats'
    JADN = 'JADN Formats'

class FormatOption():  

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


def get_formats():

    # JSON Formats
    date_time = FormatOption("date-time", "Date Time", "RFC 3339 5.6", FormatType.JSON.value, "ex: 1970-01-01T01:01:01.01Z").__dict__
    date = FormatOption("date", "Date", "RFC 3339 5.6", FormatType.JSON.value, "ex: 1970-01-01").__dict__
    time = FormatOption("time", "Time", "RFC 3339 5.6", FormatType.JSON.value, "ex: 01:01:01.01Z").__dict__
    duration = FormatOption("duration", "Duration", "RFC 3339", FormatType.JSON.value, "").__dict__
    email = FormatOption("email", "Email", "RFC 5322 3.4.1", FormatType.JSON.value, "ex: user@foo.org").__dict__
    idn_email = FormatOption("idn-email", "IDN Email", "RFC 6531", FormatType.JSON.value, "").__dict__
    hostname = FormatOption("hostname", "Hostname", "RFC 1034 3.1", FormatType.JSON.value, "").__dict__
    idn_hostname = FormatOption("idn-hostname", "IDN hostname", "RFC 5890 2.3.2.3", FormatType.JSON.value, "").__dict__
    ipv4 = FormatOption("ipv4", "IPv4", "RFC 2673 3.2", FormatType.JSON.value, "").__dict__
    ipv6 = FormatOption("ipv6", "IPv6", "RFC 4291 2.2", FormatType.JSON.value, "").__dict__
    uri = FormatOption("uri", "URI", "RFC 3986", FormatType.JSON.value, "").__dict__
    uri_reference = FormatOption("uri-reference'", "URI Reference'", "RFC 5322", FormatType.JSON.value, "").__dict__
    uri_template = FormatOption("uri-template", "URI Template", "RFC 6570", FormatType.JSON.value, "").__dict__
    iri = FormatOption("iri", "IRI", "RFC 3987", FormatType.JSON.value, "").__dict__
    iri_reference = FormatOption("iri-reference", "IRI Reference", "RFC 3987", FormatType.JSON.value, "").__dict__
    json_pointer = FormatOption("json-pointer", "JSON Pointer", "RFC 6901 5", FormatType.JSON.value, "").__dict__
    relative_json_pointer = FormatOption("relative-json-pointer", "Relative JSON Pointer", "JSONP", FormatType.JSON.value, "").__dict__
    regex = FormatOption("regex", "Regex", "ECMA 262", FormatType.JSON.value, "").__dict__

    # JADN Formats
    eui = FormatOption("eui", "EUI", "IEEE Extended Unique Identifier (MAC Address), EUI-48 or EUI-64 specified in EUI", FormatType.JADN.value, "").__dict__
    ipv4_addr = FormatOption("ipv4-addr", "IPv4 Address", "IPv4 address as specified in RFC 791 3.1", FormatType.JADN.value, "").__dict__
    ipv6_addr = FormatOption("ipv6-addr", "IPv6 Address", "IPv4 address as specified in RFC 8200 3", FormatType.JADN.value, "").__dict__
    ipv4_net = FormatOption("ipv4-net", "IPv4 Network", "Binary IPv4 address and Integer prefix length as specified in RFC 4632 3.1", FormatType.JADN.value, "").__dict__
    ipv6_net = FormatOption("ipv6-net", "IPv6 Network", "Binary IPv6 address and Integer prefix length as specified in RFC 4291 2.3", FormatType.JADN.value, "").__dict__
    i8 = FormatOption("i8", "i8", "Signed 8 bit integer, value must be between -128 and 127", FormatType.JADN.value, "").__dict__
    i16 = FormatOption("i16", "i16", "Signed 16 bit integer, value must be between -32768 and 32767", FormatType.JADN.value, "").__dict__
    i32 = FormatOption("i32", "i32", "Signed 32 bit integer", FormatType.JADN.value, "").__dict__
    ud = FormatOption("u\\d+", "Unsigned Integer or Bit", "Unsigned integer or bit field of <n> bits, value must be between 0 and 2^<n> - 1", FormatType.JADN.value, "").__dict__

    list = []
    list.append(date_time)
    list.append(date)
    list.append(time)
    list.append(duration)
    list.append(email)
    list.append(idn_email)
    list.append(hostname)
    list.append(idn_hostname)
    list.append(ipv4)
    list.append(ipv6)
    list.append(uri)
    list.append(uri_reference)
    list.append(uri_template)
    list.append(iri)
    list.append(iri_reference)
    list.append(json_pointer)
    list.append(relative_json_pointer)
    list.append(regex)
    list.append(eui)
    list.append(ipv4_addr)
    list.append(ipv6_addr)
    list.append(ipv4_net)
    list.append(ipv6_net)
    list.append(i8)
    list.append(i16)
    list.append(i32)
    list.append(ud)

    return list                   