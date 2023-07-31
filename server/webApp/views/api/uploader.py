import logging
import os

from flask import current_app, request
from flask_restful import Resource

logger = logging.getLogger()

class DropFile(Resource):
    """
        add file to prepopulated list of schemas or messages
        :param filename: name of the file 
        :param filedata: file contents to write to file
        :param loc: location to save file - schemas or messages folder
        :return: 200 or 500
        """
    def post(self):
        filename = request.json['filename']
        file = request.json['filedata']
        location = request.json['loc']
        #overwrite = request.json['overwrite']
        if not file:
            return 'No data to write to file', 500

        path = current_app.config.get("OPEN_C2_DATA")
        UPLOAD_FOLDER = os.path.join(path, location)

        #check if file exists
        # if os.path.isfile(os.path.join(UPLOAD_FOLDER, filename)) and not overwrite:
        #             return 500, 'File name already exists'
        # else:
        #write file
        with open(os.path.join(UPLOAD_FOLDER, filename), "w") as fp:
            fp.write(file)
        
        #check file is in directory
        if os.path.isfile(os.path.join(UPLOAD_FOLDER, filename)):
            return 'File saved successfully', 200
        return 'Failed to save file', 500
        
resources = {
    DropFile: {"urls": ("/", )}
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
