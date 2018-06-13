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


# Register resources
api.add_resource(LoadFile, '/<string:filetype>/<path:filename>')
