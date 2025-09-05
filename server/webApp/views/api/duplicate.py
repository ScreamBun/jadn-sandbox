from enum import Enum
import json
import logging
import traceback

from flask import Blueprint, current_app, jsonify, request, render_template
from flask_restful import Resource, reqparse
from jadnschema.jadn import dumps
from pydantic import ValidationError

from webApp.validator.utils import getValidationErrorMsg, getValidationErrorPath

logger = logging.getLogger(__name__)

parser = reqparse.RequestParser()
parser.add_argument("schema", type=dict)

class ForDuplicate(Resource):
    """
    Endpoint for api/duplicate
    """

    def post(self):
        # Accepts and returns props/data for duplication
        request_json = request.json
        props = request_json.get('props', {})
        # Optionally validate/transform props here
        # For now, just echo back the props
        return jsonify({
            "props": props
        })
         
# Register resources (APIs)
resources = {
    ForDuplicate: {"urls": ("/", )},
}

def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))         
                 