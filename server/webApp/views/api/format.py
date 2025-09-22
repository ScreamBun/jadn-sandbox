from json import dumps
import logging
import traceback

from flask import current_app, jsonify, request
from flask_restful import Resource, reqparse

logger = logging.getLogger(__name__)

parser = reqparse.RequestParser()
parser.add_argument("schema", type=dict)

class Format(Resource):
    """
    Endpoint for api/format
    """

    def post(self):
        request_json = request.json

        try:
            output = dumps(request_json)

        except (TypeError, ValueError) as err:
            tb = traceback.format_exc()
            print(tb)
            return tb, 500
        
        return jsonify({
            "schema": output
        })
    

class FormatOptions(Resource):
    """
    Endpoint for api/format/options
    """    
    def get(self, type):

        #get_formats of given format type from parameters
        if type is not None and type != "null" and type != "":
            format_options = current_app.formatOptionLogic.get_formats_by_type(type)
        else: 
            format_options = current_app.formatOptionLogic.get_formats_by_type()

        try:
            j = jsonify({
                "format_options": format_options
            }) 
        except:
            raise traceback.print_exc()

        return j
         

# Register resources (APIs)
resources = {
    Format: {"urls": ("/", )},
    FormatOptions: {"urls": ("/options/<string:type>", )}
}

def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))         
                 