import logging
import os
import re

from flask import Blueprint, current_app, jsonify, render_template, Response
from flask_restful import Api, Resource

logger = logging.getLogger()
create = Blueprint('create', __name__)
api = Api(create)


class Create(Resource):
    """
    Endpoint for /create
    """
    def get(self):
        """
        Load Create Page
        """
        schemas = re.compile('\.(' + '|'.join(current_app.config.get('VALID_SCHEMAS')) + ')$')

        opts = {
            'schemas': [s for s in os.listdir(os.path.join(current_app.config.get('OPEN_C2_DATA'), 'schemas')) if schemas.search(s)],
            # 'conversions': current_app.config.get('VALID_SCHEMA_CONV')
        }

        return jsonify(opts)


# Register resources
api.add_resource(Create, '/')
