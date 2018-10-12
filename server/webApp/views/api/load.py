import json
import logging
import os

from flask import current_app, send_file
from flask_restful import Resource

logger = logging.getLogger()


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
            name, ext = os.path.splitext(filename)
            with open(filePath, 'rb') as f:
                filedata = ''

                if ext in ['.jadn', '.json']:
                    filedata = json.load(f)
                else:
                    for c in f.read():
                        asciiNum = c if type(c) is int else ord(c)
                        asciiChr = c if type(c) is str else chr(c)
                        filedata += asciiChr if asciiNum <= 128 else "\\x{:02X}".format(asciiNum)

            return {
                'file': filename,
                'type': filetype,
                'data': filedata
            }, 200

        return '', 404


# Register resources
resources = {
    LoadFile: {'urls': ('/<string:filetype>/<path:filename>', )}
}


def add_resources(bp, url_prefix=''):
    for cls, opts in resources.items():
        args = ['{}{}'.format(url_prefix, url) for url in opts['urls']] + opts.get('args', [])
        bp.add_resource(cls, *args, **opts.get('kwargs', {}))
