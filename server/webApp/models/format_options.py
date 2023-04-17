from .format_option_model import FormatOption, FormatType


class FormatOptions(): 

    format_list = []

    # JSON Formats
    date_time = FormatOption("date-time", "Date Time", "RFC 3339 5.6", FormatType.JSON, "ex: 1970-01-01T01:01:01.01Z")
    date = FormatOption("date", "Date", "RFC 3339 5.6", FormatType.JSON, "ex: 1970-01-01")
    time = FormatOption("time", "Time", "RFC 3339 5.6", FormatType.JSON, "ex: 01:01:01.01Z")
    duration = FormatOption("duration", "Duration", "RFC 3339", FormatType.JSON, "")
    email = FormatOption("email", "Email", "RFC 5322 3.4.1", FormatType.JSON, "ex: user@foo.org")
    idn_email = FormatOption("idn-email", "IDN Email", "RFC 6531", FormatType.JSON, "")
    hostname = FormatOption("hostname", "Hostname", "RFC 1034 3.1", FormatType.JSON, "")
    idn_hostname = FormatOption("idn-hostname", "IDN hostname", "RFC 5890 2.3.2.3", FormatType.JSON, "")
    ipv4 = FormatOption("ipv4", "IPv4", "RFC 2673 3.2", FormatType.JSON, "")
    ipv6 = FormatOption("ipv6", "IPv6", "RFC 4291 2.2", FormatType.JSON, "")
    uri = FormatOption("uri", "URI", "RFC 3986", FormatType.JSON, "")
    uri_reference = FormatOption("uri-reference'", "URI Reference'", "RFC 5322", FormatType.JSON, "")
    uri_template = FormatOption("uri-template", "URI Template", "RFC 6570", FormatType.JSON, "")
    iri = FormatOption("iri", "IRI", "RFC 3987", FormatType.JSON, "")
    iri_reference = FormatOption("iri-reference", "IRI Reference", "RFC 3987", FormatType.JSON, "")
    json_pointer = FormatOption("json-pointer", "JSON Pointer", "RFC 6901 5", FormatType.JSON, "")
    relative_json_pointer = FormatOption("relative-json-pointer", "Relative JSON Pointer", "JSONP", FormatType.JSON, "")
    regex = FormatOption("regex", "Regex", "ECMA 262", FormatType.JSON, "")

    # JADN Formats
    eui = FormatOption("eui", "EUI", "IEEE Extended Unique Identifier (MAC Address), EUI-48 or EUI-64 specified in EUI", FormatType.JADN, "")
    ipv4_addr = FormatOption("ipv4-addr", "IPv4 Address", "IPv4 address as specified in RFC 791 3.1", FormatType.JADN, "")
    ipv6_addr = FormatOption("ipv6-addr", "IPv6 Address", "IPv4 address as specified in RFC 8200 3", FormatType.JADN, "")
    ipv4_net = FormatOption("ipv4-net", "IPv4 Network", "Binary IPv4 address and Integer prefix length as specified in RFC 4632 3.1", FormatType.JADN, "")
    ipv6_net = FormatOption("ipv6-net", "IPv6 Network", "Binary IPv6 address and Integer prefix length as specified in RFC 4291 2.3", FormatType.JADN, "")
    i8 = FormatOption("i8", "i8", "Signed 8 bit integer, value must be between -128 and 127", FormatType.JADN, "")
    i16 = FormatOption("i16", "i16", "Signed 16 bit integer, value must be between -32768 and 32767", FormatType.JADN, "")
    i32 = FormatOption("i32", "i32", "Signed 32 bit integer", FormatType.JADN, "")
    ud = FormatOption("u\\d+", "Unsigned Integer or Bit", "Unsigned integer or bit field of <n> bits, value must be between 0 and 2^<n> - 1", FormatType.JADN, "")             


    def __init__(self):
        self.format_list.append(self.date_time)
        self.format_list.append(self.date)
        self.format_list.append(self.time)
        self.format_list.append(self.duration)
        self.format_list.append(self.email)
        self.format_list.append(self.idn_email)
        self.format_list.append(self.hostname)
        self.format_list.append(self.idn_hostname)
        self.format_list.append(self.ipv4)
        self.format_list.append(self.ipv6)
        self.format_list.append(self.uri)
        self.format_list.append(self.uri_reference)
        self.format_list.append(self.uri_template)    
        self.format_list.append(self.iri)
        self.format_list.append(self.iri_reference)
        self.format_list.append(self.json_pointer)
        self.format_list.append(self.relative_json_pointer)
        self.format_list.append(self.regex)

        # JADN Formats
        self.format_list.append(self.eui)
        self.format_list.append(self.ipv4_addr)
        self.format_list.append(self.ipv6_addr)
        self.format_list.append(self.ipv4_net)
        self.format_list.append(self.ipv6_net)
        self.format_list.append(self.i8)
        self.format_list.append(self.i16)    
        self.format_list.append(self.i32)
        self.format_list.append(self.ud)
    
    def get_format_list(self):
        return self.format_list