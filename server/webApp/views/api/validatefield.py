from jadnvalidation.data_validation.integer import Integer
from jadnvalidation.data_validation.string import String
from jadnvalidation.data_validation.binary import Binary
from jadnvalidation.data_validation.number import Number
from jadnvalidation.data_validation.boolean import Boolean
from jadnvalidation.data_validation.enumerated import Enumerated
from jadnvalidation.data_validation.array import Array
from jadnvalidation.data_validation.array_of import ArrayOf
from jadnvalidation.data_validation.map import Map
from jadnvalidation.data_validation.map_of import MapOf
from jadnvalidation.data_validation.choice import Choice
from jadnvalidation.data_validation.record import Record
from pydantic import ValidationError

from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource

from webApp.utils import utils

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
                case "Enumerated":
                    validator = Enumerated(j_type=["Enumerated", "Enumerated", options, ""], data=value)
                    validator.validate()
                    return jsonify({"valid": True})
                case "Array":
                    validator = Array(j_type=["Array", "Array", options, ""], data=value)
                    validator.validate()
                    return jsonify({"valid": True})
                case "ArrayOf":
                    validator = ArrayOf(j_type=["ArrayOf", "ArrayOf", options, ""], data=value)
                    validator.validate()
                    return jsonify({"valid": True})
                case "Map":
                    validator = Map(j_type=["Map", "Map", options, ""], data=value)
                    validator.validate()
                    return jsonify({"valid": True})
                case "MapOf":
                    validator = MapOf(j_type=["MapOf", "MapOf", options, ""], data=value)
                    validator.validate()
                    return jsonify({"valid": True})
                case "Choice":
                    validator = Choice(j_type=["Choice", "Choice", options, ""], data=value)
                    validator.validate()
                    return jsonify({"valid": True})
                case "Record":
                    validator = Record(j_type=["Record", "Record", options, ""], data=value)
                    validator.validate()
                    return jsonify({"valid": True})
                case _:
                    return jsonify({"valid": False, "message": f"Unsupported field type: {fieldType}"})
        except ValidationError as e:
            error_msg = utils.getValidationErrorMsg(e)
            error_path = utils.getValidationErrorPath(e)
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