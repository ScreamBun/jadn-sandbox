from enum import Enum


class FormatType(Enum):
    JSON = 'JSON Formats'
    JADN = 'JADN Formats'

class FormatOption():  

    name = ""
    ui_name = ""
    spec = ""
    type = FormatType.JSON
    note = ""
    rule = ""

    def __init__(self, name, ui_name, spec, type, note):
        self.name = name
        self.ui_name = ui_name
        self.spec = spec
        self.type = type
        self.note = note

    def get_format_options(self):

        # JSON Formats
        date_time = self.FormatOption("date-time", "Date Time", "RFC 3339 5.6", FormatType.JSON, "ex: 1970-01-01T01:01:01.01Z")
        date = self.FormatOption("date", "Date", "RFC 3339 5.6", FormatType.JSON, "ex: 1970-01-01")
        time = self.FormatOption("time", "Time", "RFC 3339 5.6", FormatType.JSON, "ex: 01:01:01.01Z")
        duration = self.FormatOption("duration", "Duration", "RFC 3339", FormatType.JSON, "")
        email = self.FormatOption("email", "Email", "RFC 5322 3.4.1", FormatType.JSON, "ex: user@foo.org")
        idn_email = self.FormatOption("idn-email", "IDN Email", "RFC 6531", FormatType.JSON, "")
        hostname = self.FormatOption("hostname", "Hostname", "RFC 1034 3.1", FormatType.JSON, "")
        idn_hostname = self.FormatOption("idn-hostname", "IDN hostname", "RFC 5890 2.3.2.3", FormatType.JSON, "")
        ipv4 = self.FormatOption("ipv4", "IPv4", "RFC 2673 3.2", FormatType.JSON, "")
        ipv6 = self.FormatOption("ipv6", "IPv6", "RFC 4291 2.2", FormatType.JSON, "")
        uri = self.FormatOption("uri", "URI", "RFC 3986", FormatType.JSON, "")
        uri_reference = self.FormatOption("uri-reference'", "URI Reference'", "RFC 5322", FormatType.JSON, "")
        uri_template = self.FormatOption("uri-template", "URI Template", "RFC 6570", FormatType.JSON, "")
        iri = self.FormatOption("iri", "IRI", "RFC 3987", FormatType.JSON, "")
        iri_reference = self.FormatOption("iri-reference", "IRI Reference", "RFC 3987", FormatType.JSON, "")
        json_pointer = self.FormatOption("json-pointer", "JSON Pointer", "RFC 6901 5", FormatType.JSON, "")
        relative_json_pointer = self.FormatOption("relative-json-pointer", "Relative JSON Pointer", "JSONP", FormatType.JSON, "")
        regex = self.FormatOption("regex", "Regex", "ECMA 262", FormatType.JSON, "")

        # JADN Formats
        eui = self.FormatOption("eui", "EUI", "IEEE Extended Unique Identifier (MAC Address), EUI-48 or EUI-64 specified in EUI", FormatType.JADN, "")
        ipv4_addr = self.FormatOption("ipv4-addr", "IPv4 Address", "IPv4 address as specified in RFC 791 3.1", FormatType.JADN, "")
        ipv6_addr = self.FormatOption("ipv6-addr", "IPv6 Address", "IPv4 address as specified in RFC 8200 3", FormatType.JADN, "")
        ipv4_net = self.FormatOption("ipv4-net", "IPv4 Network", "Binary IPv4 address and Integer prefix length as specified in RFC 4632 3.1", FormatType.JADN, "")
        ipv6_net = self.FormatOption("ipv6-net", "IPv6 Network", "Binary IPv6 address and Integer prefix length as specified in RFC 4291 2.3", FormatType.JADN, "")
        i8 = self.FormatOption("i8", "i8", "Signed 8 bit integer, value must be between -128 and 127", FormatType.JADN, "")
        i16 = self.FormatOption("i16", "i16", "Signed 16 bit integer, value must be between -32768 and 32767", FormatType.JADN, "")
        i32 = self.FormatOption("i32", "i32", "Signed 32 bit integer", FormatType.JADN, "")
        ud = self.FormatOption("u\\d+", "Unsigned Integer or Bit", "Unsigned integer or bit field of <n> bits, value must be between 0 and 2^<n> - 1", FormatType.JADN, "")                 


        format_list = []

        # JSON Formats
        format_list.append(date_time)
        format_list.append(date)
        format_list.append(time)
        format_list.append(duration)
        format_list.append(email)
        format_list.append(idn_email)
        format_list.append(hostname)
        format_list.append(idn_hostname)
        format_list.append(ipv4)
        format_list.append(ipv6)
        format_list.append(uri)
        format_list.append(uri_reference)
        format_list.append(uri_template)    
        format_list.append(iri)
        format_list.append(iri_reference)
        format_list.append(json_pointer)
        format_list.append(relative_json_pointer)
        format_list.append(regex)

        # JADN Formats
        format_list.append(eui)
        format_list.append(ipv4_addr)
        format_list.append(ipv6_addr)
        format_list.append(ipv4_net)
        format_list.append(ipv6_net)
        format_list.append(i8)
        format_list.append(i16)    
        format_list.append(i32)
        format_list.append(ud)

        return format_list