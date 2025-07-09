import json
from ..models.format_option_model import FormatOptionModel, FormatType


class FormatOptionLogic:

    regex_email_rfc_5322 = "([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|\[[\t -Z^-~]*])"
    regex_uri_rfc_3986 = "(https?:\/\/(www\.)?)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)"
    regex_hostname = "(?!-)[A-Z0-9-]{1,63}(?<!-)$"

    # JSON Formats
    date_time = FormatOptionModel("date-time", "Date Time", "RFC 3339 5.6", FormatType.STRING.value, "ex: 1970-01-01T01:01:01.01Z").__dict__
    date = FormatOptionModel("date", "Date", "RFC 3339 5.6", FormatType.STRING.value, "ex: 1970-01-01").__dict__
    time = FormatOptionModel("time", "Time", "RFC 3339 5.6", FormatType.STRING.value, "ex: 01:01:01.01Z").__dict__
    duration = FormatOptionModel("duration", "Duration", "RFC 3339", FormatType.INTEGER.value).__dict__
    email = FormatOptionModel("email", "Email", "RFC 5322 3.4.1", FormatType.STRING.value, "ex: user@foo.org", regex_email_rfc_5322).__dict__
    idn_email = FormatOptionModel("idn-email", "IDN Email", "RFC 6531", FormatType.STRING.value, "").__dict__
    hostname = FormatOptionModel("hostname", "Hostname", "RFC 1034 3.1", FormatType.STRING.value, "", regex_hostname).__dict__
    idn_hostname = FormatOptionModel("idn-hostname", "IDN hostname", "RFC 5890 2.3.2.3", FormatType.STRING.value, "").__dict__
    ipv4 = FormatOptionModel("ipv4", "IPv4", "RFC 2673 3.2", FormatType.STRING.value, "").__dict__
    ipv6 = FormatOptionModel("ipv6", "IPv6", "RFC 4291 2.2", FormatType.STRING.value, "").__dict__
    uri = FormatOptionModel("uri", "URI", "RFC 3986", FormatType.STRING.value, "", regex_uri_rfc_3986).__dict__
    uri_reference = FormatOptionModel("uri-reference", "URI Reference", "RFC 5322", FormatType.STRING.value, "").__dict__
    uri_template = FormatOptionModel("uri-template", "URI Template", "RFC 6570", FormatType.STRING.value, "").__dict__
    # uuid = FormatOptionModel("uuid", "UUID", "RFC 4122", FormatType.BINARY.value, "").__dict__
    iri = FormatOptionModel("iri", "IRI", "RFC 3987", FormatType.STRING.value, "").__dict__
    iri_reference = FormatOptionModel("iri-reference", "IRI Reference", "RFC 3987", FormatType.STRING.value, "").__dict__
    json_pointer = FormatOptionModel("json-pointer", "JSON Pointer", "RFC 6901 5", FormatType.STRING.value, "").__dict__
    relative_json_pointer = FormatOptionModel("relative-json-pointer", "Relative JSON Pointer", "JSONP", FormatType.STRING.value, "").__dict__
    regex = FormatOptionModel("regex", "Regex", "ECMA 262", FormatType.STRING.value, "").__dict__
    normalizedString = FormatOptionModel("normalizedString", "Normalized String", "", FormatType.STRING.value, "").__dict__
    token = FormatOptionModel("token", "Token", "", FormatType.STRING.value, "").__dict__
    language = FormatOptionModel("language", "Language", "", FormatType.STRING.value, "").__dict__
    name = FormatOptionModel("name", "Name", "RFC 3066", FormatType.STRING.value, "").__dict__
    anyURI = FormatOptionModel("anyUri", "Any URI", "", FormatType.STRING.value, "").__dict__
    qName = FormatOptionModel("qName", "QName", "", FormatType.STRING.value, "").__dict__
    notation = FormatOptionModel("notation", "Notation", "", FormatType.STRING.value, "").__dict__

    # JADN Formats
    eui = FormatOptionModel("eui", "EUI", "IEEE Extended Unique Identifier (MAC Address), EUI-48 or EUI-64 specified in EUI", FormatType.BINARY.value, "").__dict__
    ipv4_addr = FormatOptionModel("ipv4-addr", "IPv4 Address", "IPv4 address as specified in RFC 791 3.1", FormatType.BINARY.value, "").__dict__
    ipv6_addr = FormatOptionModel("ipv6-addr", "IPv6 Address", "IPv4 address as specified in RFC 8200 3", FormatType.BINARY.value, "").__dict__
    ipv4_net = FormatOptionModel("ipv4-net", "IPv4 Network", "Binary IPv4 address and Integer prefix length as specified in RFC 4632 3.1", FormatType.ARRAY.value, "").__dict__
    ipv6_net = FormatOptionModel("ipv6-net", "IPv6 Network", "Binary IPv6 address and Integer prefix length as specified in RFC 4291 2.3", FormatType.ARRAY.value, "").__dict__
    i8 = FormatOptionModel("i8", "i8", "Signed 8 bit integer, value must be between -128 and 127", FormatType.INTEGER.value, "").__dict__
    i16 = FormatOptionModel("i16", "i16", "Signed 16 bit integer, value must be between -32768 and 32767", FormatType.INTEGER.value, "").__dict__
    i32 = FormatOptionModel("i32", "i32", "Signed 32 bit integer", FormatType.INTEGER.value, "").__dict__
    ud = FormatOptionModel("u\\d+", "Unsigned Integer or Bit", "Unsigned integer or bit field of <n> bits, value must be between 0 and 2^<n> - 1", FormatType.INTEGER.value, "").__dict__

    f16 = FormatOptionModel("f16", "float16", "Serialize as IEEE 754 Half-Precision Float (#7.25)", FormatType.NUMBER.value, "").__dict__
    f32 = FormatOptionModel("f32", "float32", "Serialize as IEEE 754 Single-Precision Float (#7.26)", FormatType.NUMBER.value, "").__dict__
    f64 = FormatOptionModel("f64", "float64", "Serialize as IEEE 754 Single-Precision Float (#7.27)", FormatType.NUMBER.value, "").__dict__
    
    hex_binary = FormatOptionModel("x", "hexBinary", "Hex - base16 - lowercase out, case-folding in", FormatType.BINARY.value, "").__dict__
    hex_binary_upper_only = FormatOptionModel("X", "hexBinaryUpperOnly", "Hex - RFC 4648 Section 8 - uppercase only", FormatType.BINARY.value, "").__dict__
    base_64_binary = FormatOptionModel("b", "base64Binary", "Base64url - RFC 4648 Section 5 (default text representation of Binary type)", FormatType.BINARY.value, "").__dict__

    date_time_int = FormatOptionModel("date-time", "Date Time", "POSIX time: the number of seconds since the Epoch", FormatType.INTEGER.value, "ex: 835810335").__dict__
    time_int = FormatOptionModel("time", "Time", "POSIX Time", FormatType.INTEGER.value, "ex: 835810335").__dict__
    date_int = FormatOptionModel("date", "Date", "POSIX Time", FormatType.INTEGER.value, "ex: 835810335").__dict__
    gyear_month = FormatOptionModel("gYearMonth", "gYearMonth", "RFC 3339", FormatType.INTEGER.value, "ex: 197001").__dict__
    gyear = FormatOptionModel("gYear", "gYear", "RFC 3339", FormatType.INTEGER.value, "ex: 1970").__dict__
    gmonth_day = FormatOptionModel("gMonthDay", "gMonthDay", "RFC 3339", FormatType.INTEGER.value, "ex: 0101").__dict__
    day_time_duration = FormatOptionModel("dayTimeDuration", "Day Time Duration", "", FormatType.INTEGER.value, "").__dict__
    year_month_duration = FormatOptionModel("yearMonthDuration", "Year Month Duration", "", FormatType.INTEGER.value, "").__dict__

    def get_formats(self):

        formats = []

        formats.append(self.date_time)
        formats.append(self.date)
        formats.append(self.time)
        formats.append(self.duration)
        formats.append(self.day_time_duration)
        formats.append(self.year_month_duration)
        formats.append(self.email)
        formats.append(self.idn_email)
        formats.append(self.hostname)
        formats.append(self.idn_hostname)
        formats.append(self.ipv4)
        formats.append(self.ipv6)
        formats.append(self.uri)
        formats.append(self.uri_reference)
        formats.append(self.uri_template)
        # formats.append(self.uuid)
        formats.append(self.iri)
        formats.append(self.iri_reference)
        formats.append(self.json_pointer)
        formats.append(self.relative_json_pointer)
        formats.append(self.regex)
        formats.append(self.eui)
        formats.append(self.ipv4_addr)
        formats.append(self.ipv6_addr)
        formats.append(self.ipv4_net)
        formats.append(self.ipv6_net)
        formats.append(self.i8)
        formats.append(self.i16)
        formats.append(self.i32)
        formats.append(self.ud)
        formats.append(self.f16)
        formats.append(self.f32)
        formats.append(self.f64)
        formats.append(self.hex_binary)
        formats.append(self.hex_binary_upper_only)
        formats.append(self.base_64_binary)
        formats.append(self.date_time_int)
        formats.append(self.time_int)
        formats.append(self.date_int)
        formats.append(self.gyear_month)
        formats.append(self.gyear)
        formats.append(self.gmonth_day)
        formats.append(self.normalizedString)
        formats.append(self.token)
        formats.append(self.language)
        formats.append(self.name)
        formats.append(self.anyURI)
        formats.append(self.qName)
        formats.append(self.notation)

        return formats  
    
    def get_formats_by_type(self, type: str):

        formats = self.get_formats()
        formats_returned = []

        if type != 'undefined':
            for format in formats:
                if format['type'].lower() == type.lower():
                    formats_returned.append(format)
        else:
            formats_returned = formats

        return formats_returned      