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

class ForGlobalSchema(Resource):
    """
    Endpoint for api/globalschema
    """

    def post(self):
        try:
            request_json = request.json
            props = request_json.get('props', {})
            return jsonify({
                "props": props
            })
        except Exception as ex:
            logger.exception("GlobalSchema processing failed")
            # Return an error object to match *_FAILURE shape expectations
            return jsonify({"error": "Failed to process global schema"}), 500

# Register resources (APIs)
resources = {
    ForGlobalSchema: {"urls": ("/", )},
}

def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))         
                 