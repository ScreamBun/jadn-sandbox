import logging

from io import BytesIO
import traceback
import jadn
from flask import current_app, jsonify, Response, request
from flask_restful import Resource, reqparse
from jadnschema.convert import SchemaFormats, dumps, html_dumps, plant_dumps
from jadn.translate import json_schema_dumps
from weasyprint import HTML


logger = logging.getLogger(__name__)

class Convert(Resource):
    """
    Endpoint for api/convert
    """

    def get(self):
        return jsonify({
            "conversions": current_app.config.get("VALID_SCHEMA_CONV")
        })

    def post(self):
        conv = "Valid Base Schema"
        request_json = request.json      

        is_valid, schema = current_app.validator.validateSchema(request_json["schema"], False)
        data = request_json["schema"]
        schema_checked = jadn.check(data) 
        
        if is_valid:
            convertedData = []
            if isinstance(request_json["convert-to"], str):
                try:
                    conv_fmt = SchemaFormats(request_json["convert-to"])
                except Exception:  
                    return "Invalid Conversion Type", 500
                
                try:
                    conv = self.convertTo(schema_checked, conv_fmt)
                    convertedData.append({'fmt': conv_fmt.name,'fmt_ext': conv_fmt, 'schema': conv})
                except:
                    tb = traceback.format_exc()
                    print(tb)
                    return "Failed to Convert", 500
            
            else:     
                for i in request_json["convert-to"]:
                    try:
                        conv_fmt = SchemaFormats(i)
                    except Exception:  
                        return "Invalid Conversion Type", 500
                    
                    try:
                        conv = self.convertTo(schema_checked, conv_fmt)
                        convertedData.append({'fmt': conv_fmt.name,'fmt_ext': conv_fmt, 'schema': conv})
                    except:
                        tb = traceback.format_exc()
                        print(tb)
                        return "Failed to Convert", 500
        else:
            return "Schema is not valid", 500

        return jsonify({
            "schema": {
                "base": request_json["schema"],
                "convert": convertedData
            }
        })
    
    def convertTo(self, schema, lang):
        kwargs = { "fmt": lang,}

        if lang == "html":
            kwargs["styles"] = current_app.config.get("OPEN_C2_SCHEMA_THEME", "")

        if lang == "json":
            return json_schema_dumps(schema)
        elif lang == "jadn":
            return dumps(schema, **kwargs)
        elif lang == "puml":
            return plant_dumps(schema, style={'links': True, 'detail': 'information'})                                      
        else:
            return dumps(schema, **kwargs)
        


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
