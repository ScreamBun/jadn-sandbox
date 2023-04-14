class FormatOption():

    def __init__(self, name, ui_name, spec, note):
        name = name
        ui_name = ui_name
        spec = spec
        note = note

def get_format_options():
    format_list = []

    format_list.append(FormatOption("date-time", "Date Time", "RFC3339", "ex: 1970-01-01T01:01:01.01Z"))
    format_list.append(FormatOption("date", "Date", "RFC3339", "ex: 1970-01-01"))
    format_list.append(FormatOption("time", "Time", "RFC3339", "ex: 01:01:01.01Z"))
    format_list.append(FormatOption("duration", "Duration", "RFC3339", "ex: 01:01:01.01Z"))
    format_list.append(FormatOption("email", "Email", "RFC 5322", "ex: user@foo.org"))

    return format_list