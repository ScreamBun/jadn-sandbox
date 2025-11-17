import json
import logging

from flask import Blueprint, current_app, jsonify, redirect, request
from flask_restful import Api, Resource, reqparse

from webApp.utils import constants

logger = logging.getLogger()
validate = Blueprint("validate", __name__)
api = Api(validate)

parser = reqparse.RequestParser()
parser.add_argument("schema", type=str)
parser.add_argument("message", type=str)
parser.add_argument("message-format", type=str)
parser.add_argument("message-decode", type=str)


class Validate(Resource):
    """
    Endpoint for api/validate
    """

    # TODO: Update remaining "message" to "data" and "message-format" to "data-format", ui will need to be updated as well
    def post(self):
        args = parser.parse_args()
        request_json = request.json 
        schema = request_json["schema"]
        fmt = args["message-format"] or "json"

        if(isinstance(schema, str)):
            try: 
                schema = json.loads(schema)
            except Exception as ex:
                print(f"JSON Error: {ex}")
                return jsonify({ "valid_bool": False, "valid_syntax": False, "valid_msg": f"{str(ex)}" })
        
        
        valMsg = []
        val, valMsg, msgJson, msgOrig = current_app.validator.validateData(schema, args["message"], fmt, args["message-decode"])

        page_data = {
            # "schema": args["schema"],
            "message_original": msgOrig,
            "message_json": msgJson,
            "message_format": args["message-format"],
            "message_type": args["message-decode"],
            "valid_bool": val,
            "valid_msg": valMsg
        }

        return jsonify(page_data)


class ValidateSchema(Resource):
    """
    Endpoint for api/validate/schema
    """
    def get(self):
        return redirect("/")

    def post(self):
        args = parser.parse_args()        
        request_json = request.json 
        schema = request_json["schema"]
        schema_fmt = request_json["schema_format"]
        
        if schema_fmt == None:
            return jsonify({ "valid_bool": False, "valid_syntax": False, "valid_msg": "Schema Format selection required" })

        if schema_fmt == constants.JSON or schema_fmt == constants.JADN:
            if(isinstance(schema, str)):
                try: 
                    schema = json.loads(schema)
                except Exception as ex:
                    print(f"JSON Error: {ex}")
                    return jsonify({ "valid_bool": False, "valid_syntax": False, "valid_msg": f"{str(ex)}" })
            
            if schema_fmt == constants.JSON:
                try:
                    # Use Python's built-in JSON validation
                    json.dumps(schema)  # Will raise TypeError if not serializable
                except Exception as ex:
                    print(f"JSON Validation Error: {str(ex)}")
                    return jsonify({ "valid_bool": False, "valid_syntax": False, "valid_msg": f"{str(ex)}" })

            if schema_fmt == constants.JADN:
                valid_bool, err = current_app.validator.validate_jadn(schema)
                if not valid_bool:
                    print(f"JADN Error: {str(err)} ")
                    return jsonify({ "valid_bool": False, "valid_syntax": False, "valid_msg": f"{str(err)}"})
                
        if schema_fmt == constants.JIDL:
            valid_bool, rsp = current_app.validator.validate_jidl(schema)
            if not valid_bool:
                print(f"JIDL Error: {str(rsp)} ")
                return jsonify({ "valid_bool": False, "valid_syntax": True, "valid_msg": f"{str(rsp)}"})

        return jsonify( { "valid_bool": True, "valid_syntax": True, "valid_msg": "Passed validation" })


# Register resources
resources = {
    Validate: {"urls": ("/", )},
    ValidateSchema: {"urls": ("/schema", )}
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
