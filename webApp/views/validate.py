import logging
import os
import re

from flask import Blueprint, current_app, redirect, render_template, Response
from flask_restful import Api, Resource, reqparse

logger = logging.getLogger()
validate = Blueprint('validate', __name__)
api = Api(validate)

parser = reqparse.RequestParser()
parser.add_argument('schema', type=str)
parser.add_argument('message', type=str)
parser.add_argument('message-format', type=str)
parser.add_argument('message-decode', type=str)


class Validate(Resource):
    """
    Endpoint for /validate
    """
    def get(self):
        schemas = re.compile('\.(' + '|'.join(current_app.config.get('VALID_SCHEMAS')) + ')$')
        messages = re.compile('\.(' + '|'.join(current_app.config.get('VALID_MESSAGES')) + ')$')

        opts = {
            'schemas': [s for s in os.listdir(os.path.join(current_app.config.get('OPEN_C2_DATA'), 'schemas')) if schemas.search(s)],
            'messages': [m for m in os.listdir(os.path.join(current_app.config.get('OPEN_C2_DATA'), 'messages')) if messages.search(m)]
        }

        resp = Response(render_template('index.html', page_title="Message Validator", options=opts), mimetype='text/html')
        resp.status_code = 200
        return resp

    def post(self):
        args = parser.parse_args()
        fmt = args['message-format'] or 'json'

        val = current_app.validator.validateMessage(args['schema'], args['message'], fmt, args['message-decode'])

        page_data = {
            "schema": args['schema'],
            "message": args['message'],
            "message_format": args['message-format'],
            "message_type": args['message-decode'],
            "valid_bool": val[0],
            "valid_msg": val[1]
        }

        return Response(render_template("validate/validate.html", page_title="Message Validation", page_data=page_data))


class ValidateSchema(Resource):
    """
    Endpoint for /validate/schema
    """
    def get(self):
        return redirect('/')

    def post(self):
        args = parser.parse_args()

        val = current_app.validator.validateSchema(args['schema'])
        data = {
            "valid_bool": val[0],
            "valid_msg": val[1]
        }

        return data, 200


# Register resources
api.add_resource(Validate, '/')
api.add_resource(ValidateSchema, '/schema')
