import logging
import os

from flask import Blueprint, current_app, url_for, render_template, Response, send_file
from flask_restful import Api, Resource

logger = logging.getLogger()
load = Blueprint('load', __name__)
api = Api(load)


class LoadFile(Resource):
    """
    Endpoint for /[:content]
    """
    def get(self, filename):
        """
        check if the requested file exists, load and send to client if available
        :param content: path that was navigated to
        :return: file or 404
        """
        filePath = os.path.join(current_app.config.get("APP_DIR"), 'openc2_files', filename)

        if os.path.isfile(filePath):
            rtn = send_file(filePath)
        else:
            rtn = '', 404

        return rtn


# Register resources
api.add_resource(LoadFile, '/<path:filename>')
