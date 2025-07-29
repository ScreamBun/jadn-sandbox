import json
import logging
from jadnvalidation.data_validation.integer import Integer
from jadnvalidation.data_validation.string import String
from jadnvalidation.data_validation.binary import Binary
from jadnvalidation.data_validation.number import Number
from jadnvalidation.data_validation.boolean import Boolean
from pydantic import ValidationError

from flask import Blueprint, request, jsonify, current_app
from flask_restful import Api, Resource, reqparse
from webApp.utils import constants 
from webApp.validator.utils import getValidationErrorMsg, getValidationErrorPath

validatefield = Blueprint("validatefield", __name__)
api = Api(validatefield)

class ValidateField(Resource):
    """
    Endpoint for api/validate/field
    """

    def post(self):
        request_json = request.json
        value = request_json["value"]
        fieldType = request_json["type"]
        options = request_json['options']

        try:
            match fieldType:
                case "Integer":
                    validator = Integer(j_type=["Integer", "Integer", options, ""], data=int(value))
                    validator.validate()
                    return jsonify({"valid": True})
                case "String":
                    validator = String(j_type=["String", "String", options, ""], data=str(value))
                    validator.validate()
                    return jsonify({"valid": True})
                case "Binary":
                    validator = Binary(j_type=["Binary", "Binary", options, ""], data=value)
                    validator.validate()
                    return jsonify({"valid": True})
                case "Number":
                    validator = Number(j_type=["Number", "Number", options, ""], data=float(value))
                    validator.validate()
                    return jsonify({"valid": True})
                case "Boolean":
                    validator = Boolean(j_type=["Boolean", "Boolean", options, ""], data=value)
                    validator.validate()
                    return jsonify({"valid": True})
                case _:
                    return jsonify({"valid": False, "message": f"Unsupported field type: {fieldType}"})
        except ValidationError as e:
            error_msg = getValidationErrorMsg(e)
            error_path = getValidationErrorPath(e)
            return jsonify({"valid": False, "message": error_msg})
        except Exception as e:
            return jsonify({"valid": False, "message": str(e)})

resources = {
    ValidateField: {"urls": ("/", )}
}

def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        for url in opts["urls"]:
            full_url = url_prefix + url
            bp.add_resource(cls, full_url)