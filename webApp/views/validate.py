import logging
import os

from flask import Blueprint, current_app, url_for, redirect, render_template, Response
from flask_restful import Api, Resource, reqparse

logger = logging.getLogger()
validate = Blueprint('validate', __name__)
api = Api(validate)

parser = reqparse.RequestParser()
parser.add_argument('schema', type=str)
parser.add_argument('schema-text', type=str)
parser.add_argument('message', type=str)
parser.add_argument('message-text', type=str)


class Verify(Resource):
    """
    Endpoint for /validate
    """
    def get(self):
        """
        check if the requested file exists, load and send to client if available
        :param content: path that was navigated to
        :return: file or 404
        """

        return redirect('/')

    def post(self):
        args = parser.parse_args()

        val = current_app.validator.validateMessage(args['schema-text'], args['message-text'])

        page_data = {
            "schema": args['schema-text'],
            "message": args['message-text'],
            "valid_bool": val[0],
            "valid_msg": val[1]
        }

        return Response(render_template("validate.html", page_title="Message Validation", page_data=page_data))


class Format(Resource):
    """
    Endpoint for /validate/format
    """
    def get(self):
        return Response("")

    def post(self):
        return Response("")


# Register resources
api.add_resource(Verify, '/')
api.add_resource(Format, '/format')
