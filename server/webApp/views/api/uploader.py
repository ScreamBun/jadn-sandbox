import json
import logging
import os

from io import BytesIO
import traceback
from flask import current_app, request
from flask_restful import Resource, reqparse
from werkzeug.utils import secure_filename

logger = logging.getLogger()

class DropFile(Resource):
    def post(self):
        filename = request.json['filename']
        file = request.json['filedata']
        location = request.json['loc']

        path = current_app.config.get("OPEN_C2_DATA")
        UPLOAD_FOLDER = os.path.join(path, location)

        #write file
        with open(os.path.join(UPLOAD_FOLDER, filename), "w") as fp:
            fp.write(file)
        
        #check file is in directory
        if os.path.isfile(os.path.join(UPLOAD_FOLDER, filename)):
            return 200
        return 404
        
resources = {
    DropFile: {"urls": ("/", )}
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
