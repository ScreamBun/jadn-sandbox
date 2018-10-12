import logging

from flask import Blueprint, current_app, jsonify
from flask_restful import Api, Resource, fields

from .convert import add_resources as add_convert
from .create import add_resources as add_create
from .load import add_resources as add_load
from .validate import add_resources as add_validate

log = logging.getLogger()
api = Blueprint('api', __name__)
api_root = Api(api)


class API(Resource):
    """
    Endpoint for /api
    """
    def get(self):
        rsp = dict(
            title='JADN Lint',
            message='MESSAGE'
        )
        return jsonify(rsp)


# Register resources
api_root.add_resource(API, '/')
add_convert(api_root, url_prefix='/convert')
add_create(api_root, url_prefix='/create')
add_load(api_root, url_prefix='/load')
add_validate(api_root, url_prefix='/validate')
