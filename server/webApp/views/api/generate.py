import logging

from io import BytesIO
import traceback
import jadn
from flask import current_app, jsonify, Response, request
from flask_restful import Resource, reqparse
from jadnschema import check
from jadnschema.generate.make_examples import make_ex

logger = logging.getLogger(__name__)

class Generate(Resource):
    """
    Endpoint for api/generate
    """

    def post(self):
        # schema is already validated, call make_examples                    
        request_json = request.json
        
        try:
            schema_checked = check(request_json)  # type: ignore
            generated = make_ex(schema_checked)

        except:
            return 'Failed to generate examples', 500

        #return list of generated examples
        return generated, 200



# Register resources
resources = {
    Generate: {"urls": ("/", )},
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
