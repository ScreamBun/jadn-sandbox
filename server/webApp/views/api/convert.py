import json
import logging

from io import BytesIO
import os
import sys
import traceback
import jadn
from flask import current_app, jsonify, Response, request
from flask_restful import Resource
from jadnschema.convert import SchemaFormats, dumps, html_dumps, plant_dumps, json_to_jadn_dumps
from jadnschema.convert.schema.writers.json_schema.schema_validator import validate_schema
from jadnxml.builder.xsd_builder import convert_xsd_from_dict
from jadnxml.builder.xml_builder import build_xml_from_json
from jadnjson.generators import json_generator
from weasyprint import HTML

from webApp.utils.utils import convert_json_to_cbor_annotated_hex, convert_json_to_cbor_hex, convert_json_to_xml
from webApp.utils import constants


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

        if schema_fmt == constants.JADN:
            
            if isinstance(schema_data, str):
                    schema_data = json.loads(schema_data)              
            
            is_valid, schema = current_app.validator.validateSchema(schema_data, False)
            if not is_valid:
                return "Schema is not valid", 500    
            
            jadn.check(schema_data) 
        elif schema_fmt == constants.JSON:
            
            if isinstance(schema_data, str):
                    schema_data = json.loads(schema_data)              
            
            is_valid, msg = validate_schema(schema_data)
            if is_valid != True:
                return f"JSON Schema Error: {msg}", 500
        elif schema_fmt == constants.JIDL:
            is_valid = True
            # TODO: JIDL validator needed          
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
    
    def convertTo(self, src, fromLang, toLang):
        kwargs = { "fmt": toLang,}

        try:
            
            if fromLang == constants.JADN:
                
                if toLang == constants.GV:
                    return dumps(src, **kwargs)
                
                elif toLang == constants.HTML:
                    kwargs["styles"] = current_app.config.get("OPEN_C2_SCHEMA_THEME", "")
                    return dumps(src, **kwargs)
                
                elif toLang == constants.JSON:
                    return jadn.translate.json_schema_dumps(src)
            
                elif toLang == constants.JIDL:
                    return jadn.convert.jidl_dumps(src)
                
                elif toLang == constants.MD:
                    return dumps(src, **kwargs)                
                
                elif toLang == constants.PUML:
                    return plant_dumps(src, style={'links': True, 'detail': 'information'})
                
                elif toLang == constants.XSD:
                    return convert_xsd_from_dict(src)[0]
                
                else:
                    raise ValueError('Unknown JADN conversion type')
            
            elif fromLang == constants.JSON:
                
                if toLang == constants.JADN:
                    return json_to_jadn_dumps(src, **kwargs)
                
                else:
                    raise ValueError('Unknown JSON conversion type')
                
            elif fromLang == constants.JIDL:
                
                if toLang == constants.JADN:
                    return jadn.convert.jidl_loads(src)
                
                else:
                    raise ValueError('Unknown JIDL conversion type')
            
            else:
                raise ValueError('Unknown schema type')
            
        except:
            raise ValueError
        

class ConvertJSON(Resource):
    """
    Endpoint for api/convert/convert_json
    """

    def post(self):
        request_json = request.json
        json_schema = request_json["json_schema"] 
        fmt = request_json["fmt"]
        num_to_gen = request_json["num_to_gen"]
        
        data_gen_array = []
        err_msg = None
        i = 0
        
        while i < int(num_to_gen):
            
            ret_val = json_generator.ReturnVal()
            try:
                ret_val = json_generator.gen_data_from_schema(json_schema)
            except Exception:  
                tb = traceback.format_exc()
                print(tb)
                raise Exception("Unable to generate JSON")
                    
            if isinstance(ret_val.err_msg, ValueError):
                err_msg = ret_val.err_msg.args[0]
                break
                
            if fmt == constants.XML.upper():
                try:
                    # TODO: Update return value to return error msg
                    g_data = build_xml_from_json(g_data)
                except Exception:  
                    tb = traceback.format_exc()
                    print(tb)            
                    raise Exception("Unable to generate XML")

            data_gen_array.append(g_data)
            i += 1
   
        return jsonify({
            "data":  data_gen_array,
            "err_msg": err_msg
        }) 


class ConvertData(Resource):
    """
    Endpoint for api/convert/convert_data
    """

    def post(self):
        request_json = request.json
        data = request_json["data"]
        conv_from = request_json["from"]
        conv_to = request_json["to"]
        
        cbor_annotated_hex_rsp = ""
        cbor_hex_rsp = ""
        xml_rsp = ""
            
        try:
            data_js = json.loads(data)
            
            if conv_to == constants.CBOR:
                cbor_annotated_hex_rsp = convert_json_to_cbor_annotated_hex(data_js)
                cbor_hex_rsp = convert_json_to_cbor_hex(data_js)
            elif conv_to == constants.XML:
                xml_rsp = convert_json_to_xml(data_js)
                
        except Exception:  
            tb = traceback.format_exc()
            print(tb)            
            raise
   
        return jsonify({
            "data":  {
             "cbor_annotated_hex" : cbor_annotated_hex_rsp,   
             "cbor_hex" : cbor_hex_rsp,
             "xml" : xml_rsp,
            }
        }) 



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
    ConvertData: {"urls": ("/convert_data",)},
    ConvertJSON: {"urls": ("/convert_json",)},
    ConvertPDF: {"urls": ("/pdf",)},
    DownloadXML: {"urls": ("/download_xml",)}
}


def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))
