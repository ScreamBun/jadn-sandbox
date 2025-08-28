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
from .validatefield import add_resources as add_validatefield

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

        custom_msg_path = os.path.join(current_app.config.get("CUSTOM_DATA"))
        custom_data = utils.find_file_names_by_extension(all_ext, custom_msg_path, isReturnNamesOnly)
        if custom_data:
            message_files['custom'].extend(custom_data)
            message_files['custom'] = sorted(message_files['custom'])

        example_msg_path = os.path.join(current_app.config.get("EXAMPLE_DATA"))
        example_data = utils.find_file_names_by_extension(all_ext, example_msg_path, isReturnNamesOnly)
        if example_data:
            message_files['examples'].extend(example_data)
            message_files['examples'] = sorted(message_files['examples'])

        custom_schema_path = os.path.join(current_app.config.get("SCHEMA_CUSTOM_DATA"))
        custom_schemas = utils.find_file_names_by_extension(jadn_ext, custom_schema_path, isReturnNamesOnly)
        if custom_schemas:
            schema_files['custom'].extend(custom_schemas)
            schema_files['custom'] = sorted(schema_files['custom'])

        example_schema_path = os.path.join(current_app.config.get("SCHEMA_EXAMPLE_DATA"))
        example_schemas = utils.find_file_names_by_extension(jadn_ext, example_schema_path, isReturnNamesOnly)  
        if example_schemas:
            schema_files['examples'].extend(example_schemas)
            schema_files['examples'] = sorted(schema_files['examples'])

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
add_validatefield(api_root, url_prefix="/validate/field")