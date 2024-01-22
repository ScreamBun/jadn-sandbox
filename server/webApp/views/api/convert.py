import logging

from io import BytesIO
import os
import sys
import traceback
import jadn
from flask import current_app, jsonify, Response, request, send_file
from flask_restful import Resource
from jadnschema.convert import SchemaFormats, dumps, html_dumps, plant_dumps, json_to_jadn_dumps
from jadnschema.convert.schema.writers.json_schema.schema_validator import validate_schema
from jadnxml.builder.xsd_builder import convert_xsd_from_dict
from jadn.translate import json_schema_dumps
from weasyprint import HTML

from webApp.utils.constants import JADN, JSON


logger = logging.getLogger(__name__)

class Convert(Resource):
    """
    Endpoint for api/convert
    """
        
    def get(self):
        return jsonify({
            "schema_conversions": current_app.config.get("VALID_SCHEMAS"),
            "conversions": current_app.config.get("VALID_SCHEMA_CONV"),
            "translations": current_app.config.get("VALID_SCHEMA_TRANSLATIONS"),
            "visualizations": current_app.config.get("VALID_SCHEMA_VISUALIZATIONS")
        })
        

    def post(self):
        conv = "Valid Base Schema"
        request_json = request.json      
        schema_data = request_json["schema"]
        schema_lang = request_json["schema_format"]
        schema_fmt = SchemaFormats(schema_lang)

        if schema_fmt == JADN:
            is_valid, schema = current_app.validator.validateSchema(schema_data, False)
            if not is_valid:
                return "Schema is not valid", 500    
            jadn.check(schema_data) 
        elif schema_fmt == JSON:
            is_valid, msg = validate_schema(schema_data)
            if is_valid != True:
                return f"JSON Schema Error: {msg}", 500
        else:
            return "Invalid Schema Format", 500    

        convertedData = []
        if len(request_json["convert-to"]) == 1:
            try:
                lang = request_json["convert-to"][0]
                
                valid_fmt_name, valid_fmt_ext = self.validateConversionType(lang) 
                if not valid_fmt_name:
                    return "Invalid Conversion Type", 500      
                    
            except Exception:  
                return "Invalid Conversion Type", 500
                
            try:
                conv = self.convertTo(schema_data, schema_fmt, lang)
                convertedData.append({'fmt': valid_fmt_name, 'fmt_ext': valid_fmt_ext, 'schema': conv, 'err': False})
            
            except (TypeError, ValueError) as err:
                tb = traceback.format_exc()
                print(tb)
                convertedData.append({'fmt': valid_fmt_name,'fmt_ext': valid_fmt_ext, 'schema': f"{err}", 'err': True})
           
        else:     
            for conv_type in request_json["convert-to"]:
                try:
                    valid_fmt_name, valid_fmt_ext = self.validateConversionType(conv_type)    
                    if not valid_fmt_name:
                        return "Invalid Conversion Type", 500  
                except Exception:  
                    return "Invalid Conversion Type", 500              
                    
                try:
                    conv = self.convertTo(schema_data, schema_fmt, conv_type)
                    convertedData.append({'fmt': valid_fmt_name,'fmt_ext': valid_fmt_ext, 'schema': conv, 'err': False})

                except (TypeError, ValueError) as err:
                    tb = traceback.format_exc()
                    print(tb)
                    convertedData.append({'fmt': valid_fmt_name,'fmt_ext': valid_fmt_ext, 'schema': f"{err}", 'err': True})

                        
        return jsonify({
            "schema": {
                "base": request_json["schema"],
                "convert": convertedData
            }
        })
        
    def validateConversionType(self, type: str):
        valid_conversions = current_app.config.get("VALID_SCHEMA_CONV")
        
        for item in valid_conversions.items():
            if type == item[1]:
                return item    
        return False  
    
    def convertTo(self, schema, schemalang, lang):
        kwargs = { "fmt": lang,}

        try:
            if lang == "html":
                kwargs["styles"] = current_app.config.get("OPEN_C2_SCHEMA_THEME", "")
                
            if lang == "json":
                return json_schema_dumps(schema)
            elif lang == "jadn":
                if schemalang == "json":
                    return json_to_jadn_dumps(schema, **kwargs)
                return dumps(schema, **kwargs)
            elif lang == "puml":
                return plant_dumps(schema, style={'links': True, 'detail': 'information'})                                      
            elif lang == "xsd":
                return convert_xsd_from_dict(schema)[0]
            else:
                return dumps(schema, **kwargs)
            
        except:
            raise ValueError
        


class ConvertPDF(Resource):
    """
    Endpoint for api/convert/pdf
    """

    def post(self):
        request_json = request.json      
        pdf = BytesIO()
        print("convert to pdf")
        val, schema = current_app.validator.validateSchema(request_json["schema"], False)
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


class DownloadXML(Resource):
    """
    Endpoint for api/convert/download_xml
    """

    def post(self):
        request_json = request.json
        filename = request_json["filename"]
        # jadn_base_types is whl data_file from jadnxml
        jadn_base_types_path = os.path.join(sys.prefix, 'jadn_base_types')
        xsd_file_path = os.path.join(jadn_base_types_path, filename)
        xsd_file_path = os.path.abspath(os.path.realpath(xsd_file_path))   

        file = None
        with open(xsd_file_path, 'r') as f:
            file = f.read()           
        
        return Response(file, mimetype="text/xml")     


resources = {
    Convert: {"urls": ("/", )},
    DownloadXML: {"urls": ("/download_xml",)}
}



def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
