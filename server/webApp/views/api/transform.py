import logging

from io import BytesIO
import traceback
import jadn
from flask import current_app, jsonify, Response, request
from flask_restful import Resource, reqparse
from jadnschema import transform


logger = logging.getLogger(__name__)

class Transform(Resource):
    """
    Endpoint for api/transform
    """

    def post(self):
        request_json = request.json

        # validate all schemas
        invalid_schema_list = []
        for schema in request_json["schema_list"]:
             is_valid, msg = current_app.validator.validateSchema(schema['data'], False)
             if not is_valid:
                 invalid_schema_list.append({'name': schema['name'], 'err': msg})
        
        # if not valid, return invalid schema list 
        if len(invalid_schema_list) != 0:
            return invalid_schema_list, 500
             
        # else load all schemas
        #resolve + transform
        else:
            transformed = request_json["transformation_type"]
            output = []
            if transformed == 'Strip comments':
                for schema in request_json["schema_list"]:
                    schema_output = transform.strip_comments(schema['data'])
                    output.append({
                        'schema_name': schema['name'],
                        'schema': schema_output,
                        })
                return output

            #return transformed schema
            return transformed, 200
            
    

# Register resources
resources = {
    Transform: {"urls": ("/", )},
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
