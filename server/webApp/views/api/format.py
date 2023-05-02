from enum import Enum
import json
import logging
import traceback

from flask import current_app, jsonify, request, render_template
from flask_restful import Resource, reqparse
from jadnschema.convert import dumps
<<<<<<< HEAD
from flask import Blueprint
=======
from pydantic import ValidationError
>>>>>>> 4772ba959b2b50ee90f42b5cf181d647e8deb8ab

from webApp.validator.utils import getValidationErrorMsg, getValidationErrorPath

logger = logging.getLogger(__name__)

parser = reqparse.RequestParser()
parser.add_argument("schema", type=dict)

class Format(Resource):

    blog = Blueprint('blog', __name__)

    ## as a decorator
    @blog.errorhandler(500)
    def internal_server_error(e):
        return render_template('500.html'), 500

    """
    Endpoint for api/format
    """

    def post(self):
        #args = parser.parse_args()
        request_json = request.json

        try:
            output = dumps(request_json)

<<<<<<< HEAD
        except (TypeError):
            tb = traceback.format_exc()
            tb2 = self.internal_server_error(tb)
            raise Exception("Error: " + tb2)
=======
        except (TypeError, ValueError) as err:
            tb = traceback.format_exc()
            print(tb)
            errorMsgs=[]
            if isinstance(err, ValidationError):
                for error in err.errors():
                    err_msg = getValidationErrorMsg(error)
                    err_path = getValidationErrorPath(error)
                    errorMsgs.append(err_msg + " at " +  err_path)
                return errorMsgs, 500
            else:
                return err, 500
>>>>>>> 4772ba959b2b50ee90f42b5cf181d647e8deb8ab
        
        return jsonify({
        "schema": output
        })
    

class FormatOptions(Resource):
    """
    Endpoint for api/format/options
    """

    def get(self, type):

        #get_formats of given format type from parameters
        format_options = current_app.formatOptionLogic.get_formats_by_type(type)
        
        try:
            j = jsonify({
                "format_options": format_options
            }) 
        except:
            raise traceback.print_exc()

        return j
         

# Register resources (APIs)
resources = {
    Format: {"urls": ("/", )},
    FormatOptions: {"urls": ("/options/<string:type>", )}
}

def add_resources(bp, url_prefix=""):
    for cls, opts in resources.items():
        args = [f"{url_prefix}{url}" for url in opts["urls"]] + opts.get("args", [])
        bp.add_resource(cls, *args, **opts.get("kwargs", {}))         
                 