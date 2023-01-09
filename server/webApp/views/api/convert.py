import logging
import os
import re

from io import BytesIO
import traceback
from flask import current_app, jsonify, Response, request
from flask_restful import Resource, reqparse
from jadnschema.convert import SchemaFormats, dumps, html_dumps
from weasyprint import HTML


logger = logging.getLogger(__name__)

parser = reqparse.RequestParser()
parser.add_argument("schema", type=dict)
parser.add_argument("schema-list", type=str)
parser.add_argument("convert", type=str)
parser.add_argument("convert-to", type=str)


class Convert(Resource):
    """
    Endpoint for api/convert
    """

    def get(self):
        schemas = re.compile(fr"\.({'|'.join(current_app.config.get('VALID_SCHEMAS'))})$")

        return jsonify({
            "schemas": [s for s in os.listdir(os.path.join(current_app.config.get("OPEN_C2_DATA"), "schemas")) if schemas.search(s)],
            "conversions": current_app.config.get("VALID_SCHEMA_CONV")
        })

    def post(self):
        args = parser.parse_args()
        conv = "Valid Base Schema"
        request_json = request.json

        is_valid, schema = current_app.validator.validateSchema(request_json["schema"], False)
        if is_valid:
            try:
                conv_fmt = SchemaFormats(args["convert-to"])
            except Exception:  
                conv = "Error: Invalid Conversion Type"
            else:

                kwargs = {
                    "fmt": conv_fmt,
                }

                if conv_fmt == "html":
                    kwargs["styles"] = current_app.config.get("OPEN_C2_SCHEMA_THEME", "")
                

                try:
                    conv = dumps(schema, **kwargs)
                except:
                    tb = traceback.format_exc()
                    print(tb)
                    conv = "Error: " + tb

        else:
            conv = "Error: Fix the base schema errors before converting..."

        return jsonify({
            "schema": {
                "base": args["schema"],
                "convert": conv,
                "fmt": args["convert-to"]
            }
        })


class ConvertPDF(Resource):
    """
    Endpoint for api/convert/pdf
    """

    def post(self):
        args = parser.parse_args()
        pdf = BytesIO()
        print("convert to pdf")
        val, schema = current_app.validator.validateSchema(args["schema"], False)
        if val:  # Valid Schema
            html = html_dumps(schema, styles=current_app.config.get("OPEN_C2_SCHEMA_THEME", ""))
        else:  # Invalid Schema
            html = "<h1>ERROR: Invalid Schema. Fix the base schema errors before converting...</h1>"
            
        pdf_obj = HTML(string=html)  # the HTML to convert
        pdf_obj.write_pdf(target=pdf)  # file handle to receive result
        return Response(pdf.getvalue(), mimetype="application/pdf")


resources = {
    Convert: {"urls": ("/", )},
    ConvertPDF: {"urls": ("/pdf",)}
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
