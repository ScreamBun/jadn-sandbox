import json
import logging
import os

from flask import current_app
from flask_restful import Resource

from webApp.utils import utils

logger = logging.getLogger()


class LoadFile(Resource):
    """
    Endpoint for /[:content]
    """
    def get(self, filetype, filename):
        """
        check if the requested file exists, load and send to client if available
        :param filetype: path that was navigated to
        :param filename: name of the file to attempt to load
        :return: file or 404
        """

        if "custom/" in filename:
          filename = filename.split('/')[-1]
          custom = True
        else: 
           custom = False 

        if custom == False and filetype == 'schemas':
            path = os.path.join(current_app.config.get("OPEN_C2_SCHEMA_DATA"))
        elif custom == False and filetype == 'messages':
            path = os.path.join(current_app.config.get("OPEN_C2_MESSAGE_DATA"))
        elif custom == True and filetype == 'schemas':
            path = os.path.join(current_app.config.get("OPEN_C2_SCHEMA_CUSTOM_DATA"))
        elif custom == True and filetype == 'messages':
            path = os.path.join(current_app.config.get("OPEN_C2_MESSAGE_CUSTOM_DATA"))
        else:
             return 'Unable to find save location', 500            

        file_found_info = utils.find_file_by_name(filename, path)

        if file_found_info is None:
            return "File not found", 404
        
        fp = file_found_info['path'] 
        print(f'Load: {fp}', flush=True)

        _, ext = os.path.splitext(filename)


        if ext in [".jadn", ".json"]:
            with open(fp, 'r') as f:
                file_data = f.read()

        else:
            with open(fp, 'rb') as f:
                file_data = ""
                for c in f.read():
                    asciiNum = c if isinstance(c, int) else ord(c)
                    asciiChr = c if isinstance(c, str) else chr(c)
                    file_data += asciiChr if asciiNum <= 128 else f"\\x{asciiNum:02X}"

        return {
            "name": filename,
            "type": filetype,
            "data": file_data
        }, 200

# Register resources
resources = {
    LoadFile: {"urls": ("/<string:filetype>/<path:filename>", )}
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
