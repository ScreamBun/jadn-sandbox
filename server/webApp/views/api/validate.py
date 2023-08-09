import ast
import json
import logging
import traceback

import jadn

from flask import Blueprint, current_app, jsonify, redirect
from flask_restful import Api, Resource, reqparse

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

        try:
            schema = json.dumps(ast.literal_eval(args["schema"]))
            jadn.check(ast.literal_eval(args["schema"])) 
        except Exception as ex:
            print(traceback.print_exc())
            print(f"Error: {ex}")
            err_msg = str(ex)

        if err_msg:
            response_data = { "valid_bool": False, "valid_msg": err_msg }
        else:
            val = current_app.validator.validateSchema(schema)
            response_data = { "valid_bool": val[0], "valid_msg": val[1] }

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
