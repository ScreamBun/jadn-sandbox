from ..models.format_option_model import FormatOptionModel, FormatType


class FormatOptionLogic:

    regex_email_rfc_5322 = "([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|\[[\t -Z^-~]*])"
    regex_uri_rfc_3986 = "(https?:\/\/(www\.)?)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)"
    regex_hostname = "(?!-)[A-Z0-9-]{1,63}(?<!-)$"

    # JSON Formats
    date_time = FormatOptionModel("date-time", "Date Time", "RFC 3339 5.6", FormatType.JSON.value, "ex: 1970-01-01T01:01:01.01Z").__dict__
    date = FormatOptionModel("date", "Date", "RFC 3339 5.6", FormatType.JSON.value, "ex: 1970-01-01").__dict__
    time = FormatOptionModel("time", "Time", "RFC 3339 5.6", FormatType.JSON.value, "ex: 01:01:01.01Z").__dict__
    duration = FormatOptionModel("duration", "Duration", "RFC 3339", FormatType.JSON.value).__dict__
    email = FormatOptionModel("email", "Email", "RFC 5322 3.4.1", FormatType.JSON.value, "ex: user@foo.org", regex_email_rfc_5322).__dict__
    idn_email = FormatOptionModel("idn-email", "IDN Email", "RFC 6531", FormatType.JSON.value, "").__dict__
    hostname = FormatOptionModel("hostname", "Hostname", "RFC 1034 3.1", FormatType.JSON.value, "", regex_hostname).__dict__
    idn_hostname = FormatOptionModel("idn-hostname", "IDN hostname", "RFC 5890 2.3.2.3", FormatType.JSON.value, "").__dict__
    ipv4 = FormatOptionModel("ipv4", "IPv4", "RFC 2673 3.2", FormatType.JSON.value, "").__dict__
    ipv6 = FormatOptionModel("ipv6", "IPv6", "RFC 4291 2.2", FormatType.JSON.value, "").__dict__
    uri = FormatOptionModel("uri", "URI", "RFC 3986", FormatType.JSON.value, "", regex_uri_rfc_3986).__dict__
    uri_reference = FormatOptionModel("uri-reference'", "URI Reference'", "RFC 5322", FormatType.JSON.value, "").__dict__
    uri_template = FormatOptionModel("uri-template", "URI Template", "RFC 6570", FormatType.JSON.value, "").__dict__
    iri = FormatOptionModel("iri", "IRI", "RFC 3987", FormatType.JSON.value, "").__dict__
    iri_reference = FormatOptionModel("iri-reference", "IRI Reference", "RFC 3987", FormatType.JSON.value, "").__dict__
    json_pointer = FormatOptionModel("json-pointer", "JSON Pointer", "RFC 6901 5", FormatType.JSON.value, "").__dict__
    relative_json_pointer = FormatOptionModel("relative-json-pointer", "Relative JSON Pointer", "JSONP", FormatType.JSON.value, "").__dict__
    regex = FormatOptionModel("regex", "Regex", "ECMA 262", FormatType.JSON.value, "").__dict__

    # JADN Formats
    eui = FormatOptionModel("eui", "EUI", "IEEE Extended Unique Identifier (MAC Address), EUI-48 or EUI-64 specified in EUI", FormatType.JADN.value, "").__dict__
    ipv4_addr = FormatOptionModel("ipv4-addr", "IPv4 Address", "IPv4 address as specified in RFC 791 3.1", FormatType.JADN.value, "").__dict__
    ipv6_addr = FormatOptionModel("ipv6-addr", "IPv6 Address", "IPv4 address as specified in RFC 8200 3", FormatType.JADN.value, "").__dict__
    ipv4_net = FormatOptionModel("ipv4-net", "IPv4 Network", "Binary IPv4 address and Integer prefix length as specified in RFC 4632 3.1", FormatType.JADN.value, "").__dict__
    ipv6_net = FormatOptionModel("ipv6-net", "IPv6 Network", "Binary IPv6 address and Integer prefix length as specified in RFC 4291 2.3", FormatType.JADN.value, "").__dict__
    i8 = FormatOptionModel("i8", "i8", "Signed 8 bit integer, value must be between -128 and 127", FormatType.JADN.value, "").__dict__
    i16 = FormatOptionModel("i16", "i16", "Signed 16 bit integer, value must be between -32768 and 32767", FormatType.JADN.value, "").__dict__
    i32 = FormatOptionModel("i32", "i32", "Signed 32 bit integer", FormatType.JADN.value, "").__dict__
    ud = FormatOptionModel("u\\d+", "Unsigned Integer or Bit", "Unsigned integer or bit field of <n> bits, value must be between 0 and 2^<n> - 1", FormatType.JADN.value, "").__dict__


    def get_formats(self):
        formats = []
        formats.append(self.date_time)
        formats.append(self.date)
        formats.append(self.time)
        formats.append(self.duration)
        formats.append(self.email)
        formats.append(self.idn_email)
        formats.append(self.hostname)
        formats.append(self.idn_hostname)
        formats.append(self.ipv4)
        formats.append(self.ipv6)
        formats.append(self.uri)
        formats.append(self.uri_reference)
        formats.append(self.uri_template)
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

        return formats  