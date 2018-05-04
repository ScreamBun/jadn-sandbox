import logging

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


class VerifyMessage(Resource):
    """
    Endpoint for /validate
    """
    def get(self):
        return redirect('/')

    def post(self):
        args = parser.parse_args()
        val = current_app.validator.validateMessage(args['schema'], args['message'], args['message-format'], args['message-decode'])

        page_data = {
            "schema": args['schema'],
            "message": args['message'],
            "message_format": args['message-format'],
            "message_type": args['message-decode'],
            "valid_bool": val[0],
            "valid_msg": val[1]
        }

        return Response(render_template("validate/validate.html", page_title="Message Validation", page_data=page_data))


class VerifySchema(Resource):
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
api.add_resource(VerifyMessage, '/')
api.add_resource(VerifySchema, '/schema')
