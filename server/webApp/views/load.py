import json
import logging
import os

from flask import Blueprint, current_app, send_file
from flask_restful import Api, Resource

logger = logging.getLogger()
load = Blueprint('load', __name__)
api = Api(load)


class LoadFile(Resource):
    """
    Endpoint for /[:content]
    """
    def get(self, filetype, filename):
        """
        check if the requested file exists, load and send to client if available
        :param content: path that was navigated to
        :return: file or 404
        """
        filePath = os.path.join(current_app.config.get("OPEN_C2_DATA"), filetype, filename)

        if os.path.isfile(filePath):
            name, ext = os.path.splitext(filename)
            with open(filePath, 'rb') as f:
                filedata = ''

                if ext in ['.jadn', '.json']:
                    filedata = json.load(f)
                else:
                    for c in f.read():
                        asciiNum = c if type(c) is int else ord(c)
                        asciiChr = c if type(c) is str else chr(c)
                        filedata += asciiChr if asciiNum <= 128 else "\\x{:02X}".format(asciiNum)

            return {
                'file': filename,
                'type': filetype,
                'data': filedata
            }, 200

        return '', 404


# Register resources
api.add_resource(LoadFile, '/<string:filetype>/<path:filename>')
