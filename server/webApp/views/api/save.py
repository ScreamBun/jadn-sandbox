import logging

from flask import request
from flask_restful import Resource

from webApp.utils import utils

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

        upload_folder = utils.get_upload_loc(location)
        if upload_folder == False:
             return 'Unable to find folder location', 500
        
        # Check if dir exists, if not try to make it
        create_dir_if_missing = True
        utils.does_dir_exist(upload_folder, create_dir_if_missing)

        # Check if file already exists
        if utils.is_file_in_dir(upload_folder, filename) and not overwrite:
            return 'File name already exists', 409
        else:
            # write file
            is_saved = utils.write_file(upload_folder, filename, file_data)
        
        if not is_saved:
            return 'Failed to save file', 500
        
        return 'File saved successfully', 200
    

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

        upload_folder = utils.get_upload_loc(location)
        if upload_folder == False:
             return 'Unable to find folder location', 500

        # Check if dir exists, if not try to make it
        create_dir_if_missing = True
        utils.does_dir_exist(upload_folder, create_dir_if_missing)

        # Is one file or multiple
        if isinstance(filename, str):
             
            # Remove file
            is_removed = utils.remove_file(upload_folder, filename)
            if is_removed:
                return 'File removed successfully', 200
            else:
                return 'Failed to remove file', 500
                
        elif isinstance(filename, list | dict):

            # Remove files
            failed_files = utils.remove_files(upload_folder, filename)

            if failed_files:
                return 'Failed to remove files: {failed_files}', 500
            else:
                return 'File(s) removed successfully', 200

        
resources = {
    SaveFile: {"urls": ("/", )},
    DeleteFile: {"urls": ("/delete", )}
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
