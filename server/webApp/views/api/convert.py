import ast
import json
import logging
import os
import re

from flask import current_app, jsonify, render_template, redirect, request, Response, url_for
from flask_restful import Resource, reqparse

from oc2.codec import jadn_loads
from oc2.convert import cddl_dumps, html_dumps, md_dumps, proto_dumps, relax_dumps, thrift_dumps

from xhtml2pdf import pisa

try:
    from StringIO import StringIO
except ImportError:
    from io import StringIO

logger = logging.getLogger(__name__)

parser = reqparse.RequestParser()
parser.add_argument('schema', type=str)
parser.add_argument('schema-list', type=str)
parser.add_argument('convert', type=str)
parser.add_argument('convert-to', type=str)


class Convert(Resource):
    """
    Endpoint for api/convert
    """
    conversions = {
        'cddl': (cddl_dumps, ),
        'html': (html_dumps, ),
        'jadn': (lambda x: json.dumps(x), ),
        # 'json': (json_dumps, ),
        'md': (md_dumps, ),
        'proto3': (proto_dumps, ),
        'rng': (relax_dumps, ),
        'thrift': (thrift_dumps, ),
    }

    def get(self):
        schemas = re.compile('\.(' + '|'.join(current_app.config.get('VALID_SCHEMAS')) + ')$')

        opts = {
            'schemas': [s for s in os.listdir(os.path.join(current_app.config.get('OPEN_C2_DATA'), 'schemas')) if schemas.search(s)],
            'conversions': current_app.config.get('VALID_SCHEMA_CONV')
        }

        return jsonify(opts)

    def post(self):
        args = parser.parse_args()
        err = []
        conv = 'Their are some issues....'

        try:
            schema = json.dumps(ast.literal_eval(args['schema']))
        except (TypeError, ValueError) as e:
            schema = args['schema']

        val = current_app.validator.validateSchema(schema)

        if val[0]:  # Valid Schema
            conv = 'Valid Base Schema'
            conv_fun = self.conversions.get(args['convert-to'])

            if conv_fun is None:
                conv = 'Invalid Conversion Type'

            else:
                opts = {} if len(conv_fun) == 1 else conv_fun[1]
                conv = conv_fun[0](jadn_loads(schema), **opts)

        else:  # Invalid Schema
            err.append(val[1])
            conv = 'Fix the base schema errors before converting...'

        opts = {
            'schema': {
                'base': args['schema'],
                'convert': conv,
                'fmt': args['convert-to']
            }
        }

        return jsonify(opts)


class ConvertPDF(Resource):
    """
    Endpoint for api/convert/pdf
    """

    def post(self):
        args = parser.parse_args()
        pdf = StringIO()
        html = '<h1>Their are some issues....</h1>'
        print('convert to pdf')

        try:
            schema = json.dumps(ast.literal_eval(args['schema']))
        except (TypeError, ValueError) as e:
            schema = args['schema']

        val = current_app.validator.validateSchema(schema)

        if val[0]:  # Valid Schema
            html = html_dumps(jadn_loads(schema))

        else:  # Invalid Schema
            html = '<h1>Fix the base schema errors before converting...</h1>'

        pisaStatus = pisa.CreatePDF(
            html,  # the HTML to convert
            dest=pdf  # file handle to recieve result
        )

        if pisaStatus.err:
            raise pisaStatus.err

        pdf.seek(0)
        return Response(pdf, mimetype="application/pdf")


resources = {
    Convert: {'urls': ('/', )},
    ConvertPDF: {'urls': ('/pdf',)}
}


def add_resources(bp, url_prefix=''):
    for cls, opts in resources.items():
        args = ['{}{}'.format(url_prefix, url) for url in opts['urls']] + opts.get('args', [])
        bp.add_resource(cls, *args, **opts.get('kwargs', {}))
