import logging

from flask import current_app
from flask_restful import Resource, reqparse
from jadnschema import Schema

logger = logging.getLogger()

parser = reqparse.RequestParser()
parser.add_argument("schema", type=dict)


class ProfileTests(Resource):
    """
    Endpoint for /[:content]
    """
    def get(self, profile: str = None):
        p = profile.lower() if profile else None
        return current_app.validator.getProfileTests(p), 200

    def post(self, profile: str = None):
        args = parser.parse_args()
        schema = Schema.parse_obj(args["schema"])
        return current_app.validator.validateSchemaProfile(schema, profile), 200


# Register resources
resources = {
    ProfileTests: {"urls": ("/", "/<string:profile>", ), "defaults": {'username': None}}
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
