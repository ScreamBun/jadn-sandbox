import logging
import os
import re

from flask import Blueprint, current_app, render_template, Response
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
        }

        resp = Response(render_template('create/index.html', page_title="Create Message", options=opts), mimetype='text/html')
        resp.status_code = 200
        return resp


# Register resources
api.add_resource(Create, '/')
