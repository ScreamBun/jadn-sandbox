import json
import logging
import os

from flask import current_app
from flask_restful import Resource

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
        filePath = os.path.join(current_app.config.get("OPEN_C2_DATA"), filetype, filename)
        print(f'Load: {filePath}', flush=True)

        if os.path.isfile(filePath):
            _, ext = os.path.splitext(filename)
            with open(filePath, "rb") as f:
                filedata = ""

                if ext in [".jadn", ".json"]:
                    filedata = json.load(f)
                else:
                    for c in f.read():
                        asciiNum = c if isinstance(c, int) else ord(c)
                        asciiChr = c if isinstance(c, str) else chr(c)
                        filedata += asciiChr if asciiNum <= 128 else f"\\x{asciiNum:02X}"

            return {
                "name": filename,
                "type": filetype,
                "data": filedata
            }, 200

        return "", 404


# Register resources
resources = {
    LoadFile: {"urls": ("/<string:filetype>/<path:filename>", )}
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
