import os

from flask import current_app, Flask, render_template, request, send_file

from werkzeug.routing import BaseConverter

from .validator import Validator


class RegexConverter(BaseConverter):
    def __init__(self, url_map, *items):
        super(RegexConverter, self).__init__(url_map)
        self.regex = items[0]


# Initialize the app
app = Flask(__name__, static_url_path='/static')
app.config.from_object('webApp.config.DevConfig')

app.url_map.converters['regex'] = RegexConverter
app.url_map.strict_slashes = False

print('Starting OpenC2 Flask Server')

app.validator = Validator()


@app.route('/', methods=['GET'])
@app.route('/<path:path>', methods=['GET'])
def index(path='/'):
    return render_template('index.html')


@app.route("/css/<path:filename>")
@app.route("/js/<path:filename>")
@app.route("/img/<path:filename>")
@app.route("/load/<path:filename>")
def static_files(filename):  # self, filetype, filename):
    """
    check if the requested file exists, load and send to client if available
    :param content: path that was navigated to
    :return: file or 404
    """
    url_parts = request.url.replace(request.url_root, '').split('/')
    filetype = url_parts[0]

    if url_parts[0] in ['css', 'js', 'img']:
        filePath = os.path.join(current_app.config.get("TEMPLATE_FOLDER"), filetype, filename)
        return send_file(filePath)

    else:
        filePath = os.path.join(current_app.config.get("OPEN_C2_DATA"), filetype, filename)

        if os.path.isfile(filePath):
            with open(filePath, 'rb') as f:
                fileStr = ''

                for c in f.read():
                    asciiNum = c if type(c) is int else ord(c)
                    asciiChr = c if type(c) is str else chr(c)
                    if asciiNum > 128:
                        fileStr += "\\x{:02X}".format(asciiNum)
                    else:
                        fileStr += asciiChr

            return {
                'file': filename,
                'type': filetype,
                'data': fileStr
            }, 200

    return '', 404


from .views import *
register_all(app)