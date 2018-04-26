import json
import logging
import os

from flask import Blueprint, current_app, send_file
from flask_restful import Api, Resource

from ..models import *

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
        filePath = os.path.join(current_app.config.get("APP_DIR"), 'openc2_files', filetype, filename)

        if filetype in db_tables:
            rslt = db_tables[filetype].query.filter(db_tables[filetype].name == filename).first()
            if rslt is not None:
                try:
                    data = json.loads(rslt.data)
                except json.decoder.JSONDecodeError as e:
                    print(e)
                    data = rslt.data

                return data, 200

        elif os.path.isfile(filePath):
            return send_file(filePath)

        return '', 404


# Register resources
api.add_resource(LoadFile, '/<string:filetype>/<path:filename>')
