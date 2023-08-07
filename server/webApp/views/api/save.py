import json
import logging
import os

from flask import current_app, request
from flask_restful import Resource

logger = logging.getLogger()

class SaveFile(Resource):
    """
        add file to prepopulated list of schemas or messages
        data/openc2_files/custom directory
        :param filename: name of the file 
        :param filedata: file contents to write to file
        :param loc: location to save file - schemas or messages folder
        :return: 200 or 500
        """
    def post(self):
        filename = request.json['filename']
        file_data = request.json['filedata']
        location = request.json['loc']
        overwrite = request.json['overwrite']
        if not file_data:
            return 'No data to write to file', 500

        if location == 'schemas':
            UPLOAD_FOLDER = current_app.config.get("OPEN_C2_SCHEMA_CUSTOM_DATA")
        elif location == 'messages':
            UPLOAD_FOLDER = current_app.config.get("OPEN_C2_MESSAGE_CUSTOM_DATA")
        else:
             return 'Unable to find save location', 500

        #check if file exists
        if os.path.isfile(os.path.join(UPLOAD_FOLDER, filename)) and not overwrite:
                     return 'File name already exists', 409
        else:
        #write file
            json_object = json.dumps(file_data, indent=4)
            fp = os.path.join(UPLOAD_FOLDER, filename)
            with open(fp, "w") as outfile:
                outfile.write(json_object)
        
        #check file is in directory
        if os.path.isfile(os.path.join(UPLOAD_FOLDER, filename)):
            return 'File saved successfully', 200
        return 'Failed to save file', 500
    

class DeleteFile(Resource):
    """
        remove file from prepopulated list of schemas or messages
        data/openc2_files/custom directory
        :param filename: name of the file 
        :param loc: type of file - schemas or messages folder
        :return: 200 or 500
        """
    def post(self):
        filename = request.json['filename']
        location = request.json['loc']

        path = current_app.config.get("OPEN_C2_DATA")
        UPLOAD_FOLDER = os.path.join(path, 'custom', location)

        #check file is in directory
        if isinstance(filename, str):
             if os.path.isfile(os.path.join(UPLOAD_FOLDER, filename)):
                os.remove(os.path.join(UPLOAD_FOLDER, filename))
                if not os.path.isfile(os.path.join(UPLOAD_FOLDER, filename)):
                    return 'File removed successfully', 200
                else:
                    return 'Failed to remove file', 500
        else:
            failed_files = []
            for file in filename:
                if os.path.isfile(os.path.join(UPLOAD_FOLDER, file)):
                    os.remove(os.path.join(UPLOAD_FOLDER, file))
                if os.path.isfile(os.path.join(UPLOAD_FOLDER, file)):
                    failed_files.append(file)

            if failed_files:
                    return 'Failed to remove files: {failed_files}', 500
            else:
                return 'File(s) removed successfully', 200
            
        
        return 'File does not exist', 404
        
resources = {
    SaveFile: {"urls": ("/", )},
    DeleteFile: {"urls": ("/delete", )}
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
