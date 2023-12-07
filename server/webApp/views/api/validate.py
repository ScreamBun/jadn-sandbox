import ast
import json
import logging
import traceback

import jadn
from jadnschema.convert.schema.writers.json_schema.schema_validator import validate_schema

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
        fmt = args["message-format"] or "json"
        try:
            schema = json.dumps(ast.literal_eval(args["schema"]))
        except (TypeError, ValueError):
            schema = args["schema"]

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

        response_data = {}
        err_msg = ""
        
        request_json = request.json 
        schema_fmt_test = request_json["schema"]
        schema_fmt = request_json["schema_format"]

        try:
            schema = json.dumps(ast.literal_eval(args["schema"]))
         
            validate_schema(schema_fmt_test) #validate json
            if schema_fmt == JADN:
                jadn.check(ast.literal_eval(args["schema"])) 
                current_app.validator.validateSchema(schema)
            
            response_data = { "valid_bool": True, "valid_msg": "Schema is valid" }
                
        except Exception as ex:
            print(traceback.print_exc())
            print(f"Error: {ex}")
            err_msg = f"Invalid Schema : {str(ex)}"
            response_data = { "valid_bool": False, "valid_msg": err_msg }

        return jsonify(response_data)


# Register resources
resources = {
    Validate: {"urls": ("/", )},
    ValidateSchema: {"urls": ("/schema", )}
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
