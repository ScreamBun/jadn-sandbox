import logging
import os

from flask import Blueprint, current_app, jsonify
from flask_restful import Api, Resource

from webApp.utils import utils

from .convert import add_resources as add_convert
from .load import add_resources as add_load
from .validate import add_resources as add_validate
from .format import add_resources as add_format
from .transform import add_resources as add_transform
from .save import add_resources as add_save

log = logging.getLogger()
api = Blueprint("api", __name__)
api_root = Api(api)


class API(Resource):
    """
    Endpoint for /api
    """

    def get(self):

        schema_files = { 'custom': [], 'examples': [] }
        message_files = { 'custom': [], 'examples': [] }

        jadn_ext = "jadn"
        all_ext = "*"
        isReturnNamesOnly = True

        custom_msg_path = os.path.join(current_app.config.get("OPEN_C2_MESSAGE_CUSTOM_DATA"))
        message_files['custom'] = utils.find_file_names_by_extension(all_ext, custom_msg_path, isReturnNamesOnly)

        example_msg_path = os.path.join(current_app.config.get("OPEN_C2_MESSAGE_EXAMPLE_DATA"))
        message_files['examples'] = utils.find_file_names_by_extension(all_ext, example_msg_path, isReturnNamesOnly)

        custom_schema_path = os.path.join(current_app.config.get("OPEN_C2_SCHEMA_CUSTOM_DATA"))
        schema_files['custom'] = utils.find_file_names_by_extension(jadn_ext, custom_schema_path, isReturnNamesOnly)

        example_schema_path = os.path.join(current_app.config.get("OPEN_C2_SCHEMA_EXAMPLE_DATA"))
        schema_files['examples'] = utils.find_file_names_by_extension(jadn_ext, example_schema_path, isReturnNamesOnly)  

        version_info = current_app.config.get("VERSION_INFO")

        rsp = dict(
            title="JADN Sandbox",
            message="MESSAGE",
            valid_msg_types = current_app.config.get('VALID_MESSAGES'),
            schemas=schema_files,
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
add_save(api_root, url_prefix="/save")
