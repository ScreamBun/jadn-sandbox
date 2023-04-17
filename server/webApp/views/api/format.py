import logging
import traceback

from flask import current_app, jsonify, request
from flask_restful import Resource, reqparse
from jadnschema.convert import dumps


logger = logging.getLogger(__name__)

parser = reqparse.RequestParser()
parser.add_argument("schema", type=dict)

class Format(Resource):
    """
    Endpoint for api/format
    """

    def post(self):
        #args = parser.parse_args()
        request_json = request.json

        try:
            output = dumps(request_json)

        except (TypeError, ValueError):
            tb = traceback.format_exc()
            raise Exception("Error: " + tb)
        
        return jsonify({
            "schema": output
        })
    

class FormatOptions(Resource):
    """
    Endpoint for api/format/options
    """

    def get(self):
        
        format_list = current_app.formatOptions.get_format_list()
        
        return jsonify({
            "format_options": format_list
        })    
         

# Register resources (APIs)
resources = {
    Format: {"urls": ("/", )},
    FormatOptions: {"urls": ("/options", )}
}

def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))              