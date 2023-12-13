import json
import logging
import traceback

import jadn
from jadnschema.convert.schema.writers.json_schema.schema_validator import validate_schema, validate_schema_jadn_syntax

from flask import Blueprint, current_app, jsonify, redirect, request
from flask_restful import Api, Resource, reqparse

from webApp.utils.constants import JADN, JSON

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

    def post(self):
        args = parser.parse_args()
        request_json = request.json 
        schema = request_json["schema"]
        fmt = args["message-format"] or "json"

        try:
            schema = json.dumps(schema)
        except (TypeError, ValueError) as ex:
            print(traceback.print_exc())
            print(f"JSON Error: {ex}")
            err_msg = f"Invalid JSON : {str(ex)}"
            return jsonify({ "valid_bool": False, "valid_msg": err_msg })
        
        
        val, valMsg, msgJson, msgOrig = current_app.validator.validateMessage(schema, args["message"], fmt, args["message-decode"])

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
        schema_fmt_test = request_json["schema"]
        schema_fmt = request_json["schema_format"]
        syntax = request_json["syntax_check"]

        try: 
            schema = json.dumps(schema_fmt_test)
        except Exception as ex:
            print(f"JSON Error: {ex}")
            err_msg = f"Invalid JSON : {str(ex)}"
            return jsonify({ "valid_bool": False, "valid_syntax": False, "valid_msg": err_msg })
        
        try: 
            validate_schema(schema_fmt_test)
        except Exception as ex:
            print(f"JSON Schema Error: {ex}")
            err_msg = f"Invalid JSON Schema : {str(ex)}"
            return jsonify({ "valid_bool": False, "valid_syntax": False, "valid_msg": err_msg })


        if schema_fmt == JADN:
            try: 
                validate_schema_jadn_syntax(schema_fmt_test)
            except Exception as ex:
                print(f"JADN Error: {ex}")
                err_msg = f"Invalid JADN Syntax : {str(ex)}"
                return jsonify({ "valid_bool": False, "valid_syntax": False, "valid_msg": err_msg })
            
            try: 
                current_app.validator.validateSchema(schema) #TODO: verify pydantic validation
            except Exception as ex:
                print(f"JADN Error : {ex}")
                err_msg = f"Invalid JADN : {str(ex)}"
                return jsonify({ "valid_bool": False, "valid_syntax": True, "valid_msg": err_msg })

            try: 
                jadn.check(schema_fmt_test) # uses jsonschema to check jadn - jadn_v1.0_schema.json
            except Exception as ex:
                print(f"JADN Schema Error : {ex}")
                err_msg = f"Invalid JADN Schema: {str(ex)}"
                return jsonify({ "valid_bool": False, "valid_syntax": True, "valid_msg": err_msg })


        return jsonify( { "valid_bool": True, "valid_syntax": True, "valid_msg": "Schema is valid" })


# Register resources
resources = {
    Validate: {"urls": ("/", )},
    ValidateSchema: {"urls": ("/schema", )}
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
