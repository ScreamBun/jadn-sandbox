import logging
import os
import re

from flask import current_app, jsonify, render_template, Response
from flask_restful import Resource

logger = logging.getLogger(__name__)


class Create(Resource):
    """
    Endpoint for /create
    """
    def get(self):
        """
        Load Create Page
        """
        schemas = re.compile("\.(" + "|".join(current_app.config.get("VALID_SCHEMAS")) + ")$")

        opts = {
            "schemas": [s for s in os.listdir(os.path.join(current_app.config.get("OPEN_C2_DATA"), "schemas")) if schemas.search(s)],
            # "conversions": current_app.config.get("VALID_SCHEMA_CONV")
        }

        return jsonify(opts)


# Register resources
resources = {
    Create: {"urls": ("/", )}
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = ["{}{}".format(url_prefix, url) for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
