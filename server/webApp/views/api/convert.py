import ast
import json
import logging
import os
import re

from io import BytesIO
import traceback
from flask import current_app, jsonify, Response, request
from flask_restful import Resource, reqparse
import jadn
from jadnschema.convert import CommentLevels, SchemaFormats, dumps
# from jadnschema.convert import cddl_dumps, proto_dumps, thrift_dumps
from jadnschema.convert import html_dumps, jadn_dumps, md_dumps, relax_dumps
from weasyprint import HTML

from server.webApp.conversion.conversionLogic import ConversionLogic



logger = logging.getLogger(__name__)

parser = reqparse.RequestParser()
parser.add_argument("schema", type=dict)
parser.add_argument("schema-list", type=str)
parser.add_argument("convert", type=str)
parser.add_argument("convert-to", type=str)
# parser.add_argument("comments", type=str, default=any, choices=any)
parser.add_argument("comments", type=str, default=CommentLevels.ALL, choices=CommentLevels)


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

                cl = ConversionLogic()
                match conv_fmt:
                    case "html":
                        conv = cl.convertToHTML(request_json['schema'])

                    case "gv":
                        conv = cl.convertToGraphViz(request_json['schema'])                  

                    case "jadn":
                        conv = cl.convertToJADN(request_json['schema'])

                    case "jidl":
                        conv = cl.convertToJIDL(request_json['schema'])

                    case "md":
                        conv = cl.convertToMarkDown(request_json['schema'])

                    case "rng":
                        conv = cl.convertToRelax(request_json['schema'])                                                                      

                    case _:
                        conv = "Error: Unknown Conversion Type " + conv_fmt


                # if args["convert-to"] not in ["html", "jadn", "md"]:
                #     kwargs["comm"] = args.comments
                # elif args["convert-to"] == "html":
                #     kwargs["styles"] = current_app.config.get("OPEN_C2_SCHEMA_THEME", "")

                # conv = dumps(schema, **kwargs)

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
