import logging
from flask import Blueprint, jsonify, request
from flask_restful import Resource, reqparse

logger = logging.getLogger(__name__)

parser = reqparse.RequestParser()
parser.add_argument("schema", type=dict)

class ForDuplicate(Resource):
    """
    Endpoint for api/duplicate
    """

    def post(self):
        request_json = request.json
        props = request_json.get('props', {})
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
                 