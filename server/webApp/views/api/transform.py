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

    def get(self):
        return jsonify({
            "transformations": current_app.config.get("VALID_TRANSFORMATIONS")
        })

    def post(self):
        """
        take list of schemas, validate schemas, and transform schemas based on selected transformation type 
        :param schema_list: list of schema_data and schema_name 
        :param transformation_type: selected transformation type
        :return: list of transformed schemas with schema_name and schema_data (200),
          a transformed schema (200) 
          or list of invalid schemas (500)
        """
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
        else:
            transformed = request_json["transformation_type"]
            output = []
            if transformed == 'strip comments':
                for schema in request_json["schema_list"]:
                    schema_output = transform.strip_comments(schema['data'])
                    output.append({
                        'schema_name': schema['name'],
                        'schema': schema_output,
                        })
                return output
            
            # if transformed == "resolve references"
            #take all schemas
            #get schema with most namespaces ? 
            #iterate namespaces 
            #resolve definitions by finding schema matching the namespace
            #return one new schema

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
