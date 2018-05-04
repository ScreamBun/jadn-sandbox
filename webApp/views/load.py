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
            with open(filePath, 'r') as f:
                return {
                    'file': filename,
                    'type': filetype,
                    'data': ''.join(["\\x{}".format(c.encode('hex')) if ord(c) > 128 else c for c in ''.join(f.readlines())])
                }, 200

        return '', 404


# Register resources
api.add_resource(LoadFile, '/<string:filetype>/<path:filename>')
