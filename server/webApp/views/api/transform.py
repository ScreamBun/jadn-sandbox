import logging

import os
import traceback
from flask import current_app, jsonify, request
from flask_restful import Resource
from jadnschema import transform
from jadnschema.jadn import dumps


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
        :param base_schema: selected base file for resolving imports
        :return: list of transformed schemas with schema_name and schema_data (200),
          a transformed schema + schema_name (200) 
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
                #CONSIDERATION: ALLOW STRIP COMMENTS EVEN IF INVALID JADN?
                for schema in request_json["schema_list"]:
                    schema_output = dumps(transform.strip_comments(schema['data']))
                    schema_name, ext = os.path.splitext(schema['name'])
                    output.append({
                        'schema_name': schema_name,
                        'schema': schema_output,
                        })
                return output
            
            elif transformed == "resolve references":
                # get base schema
                schema_base = ''
                schema_list = []
                for schema in request_json["schema_list"]:
                    schema_list.append(schema['data'])
                    if schema['name'] == request_json["schema_base"]:
                        schema_base = schema['data']

                if not schema_base:
                    return 'Base Schema not found', 404
                
                if not schema_list:
                    return "No Schema files provided", 404

                try:
                    output = transform.resolve_references.resolve(request_json["schema_base"], schema_base, schema_list)
                except Exception as err:            
                    tb = traceback.format_exc()
                    print(tb)
                    return str(err), 500

            #return transformed schema
                return output, 200
            
            return 'Invalid Transformation', 500
            
    

# Register resources
resources = {
    Transform: {"urls": ("/", )},
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
