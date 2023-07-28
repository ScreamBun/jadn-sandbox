import logging
import os
import re

from flask import Blueprint, current_app, jsonify
from flask_restful import Api, Resource

from .convert import add_resources as add_convert
from .load import add_resources as add_load
from .validate import add_resources as add_validate
from .format import add_resources as add_format
from .transform import add_resources as add_transform
from .uploader import add_resources as add_upload

log = logging.getLogger()
api = Blueprint("api", __name__)
api_root = Api(api)


class API(Resource):
    """
    Endpoint for /api
    """

    def get(self):

        schemas = re.compile(r"\.(" + "|".join(current_app.config.get("VALID_SCHEMAS")) + ")$")
        messages = re.compile(fr"\.({'|'.join(current_app.config.get('VALID_MESSAGES'))})$")
        message_files = {}
        version_info = current_app.config.get("VERSION_INFO")

        for msg in os.listdir(os.path.join(current_app.config.get("OPEN_C2_DATA"), "messages")):
            if messages.search(msg) and not msg.startswith("_"):
                message_files[msg] = current_app.config.get("DEFAULT_MESSAGE_TYPES").get(msg, "")

        rsp = dict(
            title="JADN Sandbox",
            message="MESSAGE",
            schemas=[s for s in os.listdir(os.path.join(current_app.config.get("OPEN_C2_DATA"), "schemas")) if schemas.search(s)],
            messages=message_files,
            version_info=version_info
        )
        return jsonify(rsp)


# Register resources
api_root.add_resource(API, "/")
add_convert(api_root, url_prefix="/convert")
add_load(api_root, url_prefix="/load")
add_validate(api_root, url_prefix="/validate")
add_format(api_root, url_prefix="/format")
add_transform(api_root, url_prefix="/transform")
add_upload(api_root, url_prefix="/upload")
