import json
import logging
import os
import sys
import traceback
import jadn
import jadn.convert
from jadnjson.generators import json_generator

from io import BytesIO
from flask import current_app, jsonify, Response, request
from flask_restful import Resource
from jadnschema.convert import SchemaFormats, json_to_jadn_dumps

from jadnxml.builder.xsd_builder import XSDBuilder
from jadnxml.builder.xml_builder import build_xml_from_json
from jadnutils.html.html_converter import HtmlConverter

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
        schema_fmt = request_json["schema_format"]
        # schema_fmt = SchemaFormats(schema_lang) 
        
        opts = None
        if 'opts' in request_json:    
            opts = request_json["opts"]

        if schema_fmt == constants.JADN:
            
            if isinstance(schema_data, str):
                schema_data = json.loads(schema_data)              
            
            is_valid, schema = current_app.validator.validateSchema(schema_data, False)
            if not is_valid:
                return "Schema is not valid", 500    
            
        elif schema_fmt == constants.JSON:
            
            if isinstance(schema_data, str):
                schema_data = json.loads(schema_data)              
            
            is_valid, err_msg = current_app.validator.validateSchema(schema_data, False)
            if not is_valid:
                return f"JSON Schema Error: {err_msg}", 500
            
        elif schema_fmt == constants.JIDL:
            is_valid, err_msg = current_app.validator.validate_jidl(schema_data)
            if not is_valid:
                return f"JSON Schema Error: {err_msg}", 500  
                                
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
                conv = self.convertTo(schema_data, schema_fmt, lang, opts)
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
                    conv = self.convertTo(schema_data, schema_fmt, conv_type, opts)
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
        for conv in valid_conversions:
            for label, value in conv.items():
                if type == value:
                    return label, value
        return False
    
    def convertTo(self, src, fromLang, toLang, opts):
        kwargs = { "fmt": toLang,}

        try:
            
            if fromLang == constants.JADN:
                
                if toLang == constants.GV:
                    gv_style = jadn.convert.diagram_style()
                    gv_style['format'] = 'graphviz'
                    gv_style['detail'] = 'information'
                    gv_style['attributes'] = True
                    gv_style['enums'] = 100
                    
                    if opts and opts["graphVizOpt"]:
                        gv_style['detail'] = opts["graphVizOpt"]
                    
                    return jadn.convert.diagram_dumps(src, gv_style)
                
                elif toLang == constants.HTML:                       
                    html_output = ""                        
                    try:
                        converter = HtmlConverter(src)
                        html_output = converter.jadn_to_html(run_validation=False)
                    except Exception as e:
                        print(f"Unable to convert to HTML: {e}")                        

                    return html_output

                elif toLang == constants.JSON:
                    return jadn.translate.json_schema_dumps(src)
            
                elif toLang == constants.JIDL:
                    jidl_style = jadn.convert.jidl_style()
                    return jadn.convert.jidl_dumps(src, jidl_style)
                
                elif toLang == constants.MD:
                    md_style = jadn.convert.diagram_style()
                    return jadn.convert.markdown_dumps(src, md_style)
                
                elif toLang == constants.PUML:
                    puml_style = jadn.convert.diagram_style()
                    puml_style['format'] = 'plantuml'
                    puml_style['detail'] = 'information'
                    puml_style['attributes'] = True
                    puml_style['enums'] = 100
                    
                    if opts and opts["pumlOpt"]:
                        puml_style['detail'] = opts["pumlOpt"]                   
                    
                    return jadn.convert.diagram_dumps(src, puml_style)
                
                elif toLang == constants.XSD:
                    xsd_builder = XSDBuilder()
                    return xsd_builder.convert_xsd_from_dict(src)[0]
                
                elif toLang == constants.JADN:
                    return src
                
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
                    ret_val.gen_data = build_xml_from_json(ret_val.gen_data)
                except Exception:  
                    tb = traceback.format_exc()
                    print(tb)            
                    raise Exception("Unable to generate XML")

            data_gen_array.append(ret_val.gen_data)
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

        if not conv_to:
            return jsonify({
                "error": "No conversion type specified (conv_to is None or empty)."
            }), 400
            
        conv_to = conv_to.lower()

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
            else:
                return jsonify({
                    "error": f"Conversion type '{conv_to}' not supported."
                }), 400

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
        html = ""
        pdf = BytesIO()
        val, schema = current_app.validator.validateSchema(request_json["schema"], False)
        
        if val:
            
            try:
                converter = HtmlConverter(schema)
                html = converter.jadn_to_html(run_validation=False)
            except Exception as e:
                print(f"Unable to convert to HTML: {e}")                
            
        else:
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
