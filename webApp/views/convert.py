import json
import logging
import os
import re

from flask import Blueprint, current_app, url_for, render_template, redirect, Response
from flask_restful import Api, Resource, reqparse

from oc2.codec import jadn_loads
from oc2.convert import base_dumps, cddl_dumps, proto_dumps, relax_dumps, thrift_dumps
from oc2.utils import Utils

logger = logging.getLogger()
convert = Blueprint('convert', __name__)
api = Api(convert)

parser = reqparse.RequestParser()
parser.add_argument('schema', type=str)
parser.add_argument('schema-list', type=str)
parser.add_argument('convert', type=str)
parser.add_argument('convert-to', type=str)


class Convert(Resource):
    """
    Endpoint for /convert
    """
    conversions = {
        'cddl': (cddl_dumps,),
        'html': (base_dumps, {'form': 'html'}),
        'jadn': (lambda x: json.dumps(x), ),
        # 'json': (json_dumps, ),
        'md': (base_dumps, {'form': 'markdown'}),
        'proto3': (proto_dumps, ),
        'rng': (relax_dumps, ),
        'thrift': (thrift_dumps, ),
    }

    def get(self):
        schemas = re.compile('\.(' + '|'.join(current_app.config.get('VALID_SCHEMAS')) + ')$')

        opts = {
            'schemas': [s for s in os.listdir(os.path.join(current_app.config.get('OPEN_C2_DATA'), 'schemas')) if schemas.search(s)],
            'convs': current_app.config.get('VALID_SCHEMA_CONV'),
            'schema': {}
        }

        resp = Response(render_template('convert/index.html', page_title="Schema Conversion", options=opts), mimetype='text/html')
        resp.status_code = 200
        return resp

    def post(self):
        args = parser.parse_args()
        schemas = re.compile('\.(' + '|'.join(current_app.config.get('VALID_SCHEMAS')) + ')$')
        err = []
        conv = 'Their are some issues....'

        val = current_app.validator.validateSchema(args['schema'])

        if val[0]:  # Valid Schema
            conv = 'Valid Base Schema'
            conv_fun = self.conversions.get(args['convert-to'])

            if conv_fun is None:
                conv = 'Invalid Conversion Type'

            else:
                opts = {} if len(conv_fun) == 1 else conv_fun[1]
                conv = conv_fun[0](jadn_loads(args['schema']), **opts)

        else:  # Invalid Schema
            err.append(val[1])
            conv = 'Fix the base schema errors before converting...'

        opts = {
            'schemas': [s for s in os.listdir(os.path.join(current_app.config.get('OPEN_C2_DATA'), 'schemas')) if schemas.search(s)],
            'convs': current_app.config.get('VALID_SCHEMA_CONV'),
            'schema': {
                'base': args['schema'],
                'convert': conv
            }
        }

        resp = Response(render_template('convert/index.html', page_title="Schema Conversion", options=opts, errors=err), mimetype='text/html')
        resp.status_code = 200
        return resp


class ConvertHTML(Resource):
    """
    Endpoint for /convert/html
    """

    def get(self):
        return redirect(url_for('convert.convert'))

    def post(self):
        args = parser.parse_args()
        err = []
        opts = {}

        val = current_app.validator.validateSchema(args['schema'])

        if val[0]:  # Valid Schema
            conv = base_dumps(jadn_loads(args['schema']), form='html')
            opts['schema'] = re.sub(r'^.*?<body>(?P<schema>.*?)</body>.*$', r'\g<schema>', re.sub(r'\n\r?', '', conv))
            print(conv)
        else:  # Invalid Schema
            err.append(val[1])
            opts['schema'] = 'Fix the base schema errors before converting...'

        resp = Response(render_template('convert/html_page.html', page_title="Schema HTML", options=opts, errors=err), mimetype='text/html')
        resp.status_code = 200
        return resp


api.add_resource(Convert, '/')
api.add_resource(ConvertHTML, '/html')
