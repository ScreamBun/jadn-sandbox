import ast
import json
import logging
import os
import re

from flask import Blueprint, current_app, jsonify, redirect, render_template, Response, request
from flask_restful import Api, Resource, reqparse

logger = logging.getLogger()
validate = Blueprint('validate', __name__)
api = Api(validate)

parser = reqparse.RequestParser()
parser.add_argument('schema', type=dict)
parser.add_argument('message', type=dict)
parser.add_argument('message-format', type=str)
parser.add_argument('message-decode', type=str)


class Validate(Resource):
    """
    Endpoint for api/validate
    """
    def get(self):
        schemas = re.compile('\.(' + '|'.join(current_app.config.get('VALID_SCHEMAS')) + ')$')
        messages = re.compile('\.(' + '|'.join(current_app.config.get('VALID_MESSAGES')) + ')$')
        message_files = {}

        for msg in os.listdir(os.path.join(current_app.config.get('OPEN_C2_DATA'), 'messages')):
            if messages.search(msg) and not msg.startswith('_'):
                message_files[msg] = current_app.config.get('DEFAULT_MESSAGE_TYPES').get(msg, '')

        opts = {
            'schemas': [s for s in os.listdir(os.path.join(current_app.config.get('OPEN_C2_DATA'), 'schemas')) if schemas.search(s)],
            'messages': message_files
        }

        return jsonify(opts)

    def post(self):
        args = parser.parse_args()
        fmt = args['message-format'] or 'json'
        try:
            schema = json.dumps(ast.literal_eval(args['schema']))
        except (TypeError, ValueError) as e:
            schema = args['schema']

        val, valMsg, msgJson, msgOrig = current_app.validator.validateMessage(schema, args['message'], fmt, args['message-decode'])

        page_data = {
            # "schema": args['schema'],
            "message_original": msgOrig,
            "message_json": msgJson,
            "message_format": args['message-format'],
            "message_type": args['message-decode'],
            "valid_bool": val,
            "valid_msg": valMsg
        }

        return jsonify(page_data)


class ValidateSchema(Resource):
    """
    Endpoint for api//validate/schema
    """
    def get(self):
        return redirect('/')

    def post(self):
        args = parser.parse_args()
        schema = args['schema']
        print(type(schema))
        if type(schema) is not dict:
            try:
                schema = json.dumps(ast.literal_eval(args['schema']))
            except (TypeError, ValueError) as e:
                print(e)
                return {
                    "valid_bool": False,
                    "valid_msg": 'Schema invalid'
                }, 200

        val = current_app.validator.validateSchema(schema)
        return {
            "valid_bool": val[0],
            "valid_msg": val[1]
        }, 200


# Register resources
api.add_resource(Validate, '/')
api.add_resource(ValidateSchema, '/schema')
