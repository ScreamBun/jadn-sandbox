import ast
import binascii
import cbor_json
import json
import os

from enum import Enum, EnumMeta
from json2xml import json2xml
from flask import current_app
from webApp.utils import constants


class MetaEnum(EnumMeta):
    def __contains__(cls, item):
        try:
            cls(item)
        except ValueError:
            return False
        return True

class BaseEnum(Enum, metaclass=MetaEnum):
    pass 

def getValidationErrorMsg(err: dict):
    err_msg = err['msg']
    return err_msg
    
def getValidationErrorPath(err: dict):
    err_loc_tuple = err['loc']
    err_loc_list = list(err_loc_tuple)
    if '__root__' in err_loc_list:
        err_loc_list.remove('__root__')
    err_path = "/".join(err_loc_list)
    return err_path

def error_worker(e, err_set: set) -> list:
    if isinstance(e, ValueError):
        if e.__context__ is not None:
            err_set.add(error_worker(e.__context__, err_set))
        else:
            err_set.add(str(e))

    err_list = []
    if err_set:
        err_list = list(err_set)
        
    return err_list                
    
def get_value_error_messages(e) -> list:
    err_set = set()
    err_list = []
    err_list = error_worker(e, err_set)
    return err_list

def does_dir_exist(dir_path: str, isCreate: bool):
    isExist = os.path.exists(dir_path)
    if isExist:
        return True
    else:
        if isCreate:
            os.mkdir(dir_path) 
            return True
        else:
            return False

def find_file_by_name(name: str, path: str):
    file_found = None
    for (root, dirs, file) in os.walk(path):
        for f in file:
            if name.lower() == f.lower():
                fp = root + '/' + f
                file_found = {'name': f, 'path' : fp}
                break
    return file_found


def find_file_names_by_extension(ext: str, path: str, isReturnNamesOnly: bool):
    files_found = []
    for (root, dirs, file) in os.walk(path):
        for f in file:
            if ext in f or ext == "*":
                fp = root + '/' + f
                file_info = {'filename': f, 'fullpath': fp}
                if isReturnNamesOnly:
                    files_found.append(f)
                else:
                    files_found.append(file_info)             
    return files_found


def get_upload_loc(loc: str):
    if loc == 'schemas':
        return current_app.config.get("SCHEMA_CUSTOM_DATA")
    elif loc == 'messages':
        return current_app.config.get("CUSTOM_DATA")
    else:
        return False


def is_file_in_dir(path: str, filename: str):
    if os.path.isfile(os.path.join(path, filename)):
        return True
    else:
        return False


def remove_file(path: str, filename: str):
    if is_file_in_dir(path, filename):
        os.remove(os.path.join(path, filename))
        if not os.path.isfile(os.path.join(path, filename)):
            return True
        else:
            return False
        

def remove_files(path: str, filenames: list):
    for file in filenames:
        if is_file_in_dir(path, file):
            os.remove(os.path.join(path, file))

    failed_files = []
    for file in filenames:
        if is_file_in_dir(path, file):
            failed_files.append(file)
            
    return failed_files


def read_file(path: str, filename: str = None):
    data = None
    
    fp = path
    if path and filename:   
        fp = os.path.join(path, filename)
        
    f = open(fp, 'r')
    data = f.read()
    
    return data

def write_file(path: str, filename: str, data):
    fp = os.path.join(path, filename)
    with open(fp, 'w') as outfile:
        outfile.write(data)        

    if is_file_in_dir(path, filename):
        return True
    else:
        return False
    
    
def convert_json_to_xml(data_dict: dict) -> str:
    return_val = None
    if data_dict:
        return_val = json2xml.Json2xml(data_dict, wrapper="all", pretty=True).to_xml()
        
    return return_val
 
    
def convert_json_to_cbor_hex(data_dict: dict) -> bytes:
    cbor_val = cbor_json.cbor_from_jsonable(data_dict)
    cbor_hex_val = cbor_val.hex()    
    
    return cbor_hex_val
                         

def convert_cbor_hex_to_json(cbor_hex: str) -> str:
    cbor_data = binascii.unhexlify(cbor_hex)
    json_data = json.dumps(cbor_json.jsonable_from_cbor(cbor_data), indent=2)
    
    return json_data


def convert_json_to_cbor_annotated_hex(data: dict) -> bytes:
        
    app_mode = current_app.config.get("APP_MODE")
    anna_hex = ""
    
    if app_mode == constants.APP_MODE_CONTAINER :
        
        with open(constants.CONTAINER_JSON_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)        
        
        os.system(constants.CONTAINER_JSON2CBOR_RB + ' value_json.json > value_cbor.cbor')
        os.system(constants.CONTAINER_CBOR2PRETTY_RB + ' value_cbor.cbor > value_cbor_pretty.txt')
    
        anna_hex = read_file(constants.CONTAINER_CBOR2PRETTY_TXT)         
        
    else :
        
        with open(constants.LOCAL_JSON_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)        
        
        cp_to_container_cmd = "docker cp " + constants.LOCAL_JSON_FILE_PATH + " " + constants.CONTAINER_NAME + ":" + constants.CONTAINER_JSON_FILE_PATH
        
        os.system(cp_to_container_cmd)
        os.system('docker exec ' + constants.CONTAINER_NAME + ' bash -c "' + constants.CONTAINER_JSON2CBOR_RB + ' value_json.json > value_cbor.cbor"')
        os.system('docker exec ' + constants.CONTAINER_NAME + ' bash -c "' + constants.CONTAINER_CBOR2PRETTY_RB + ' value_cbor.cbor > value_cbor_pretty.txt"')
        
        cp_from_container_cmd = "docker cp " + constants.CONTAINER_NAME + ":" + constants.CONTAINER_CBOR2PRETTY_TXT + " " + constants.LOCAL_CBOR2PRETTY_FILE_PATH
        os.system(cp_from_container_cmd)
    
        anna_hex = read_file(constants.LOCAL_CBOR2PRETTY_FILE_PATH)        
       
    return anna_hex

def is_string_wrapping_list(text):
    try:
        result = None
        result = ast.literal_eval(text)
        return isinstance(result, list), result
    except (SyntaxError, ValueError):
        return False, result

def get_error(e):
    err_found = None
    
    if isinstance(e, ValueError):
        err = str(e)
        
        if isinstance(err, str):
            err_found = err
        
        elif isinstance(err, ValueError):
            err_found = get_error(err)
            
        else:
            err_found = str(err)

    elif isinstance(e, str): 
        err_found = e            
    else:   
        err_found = str(err)
    
    return err_found

def error_finder(e, errors: list = []) -> list:
    errors = []
    
    err = get_error(e)
    
    is_list, inner_err_list = is_string_wrapping_list(err)
    if is_list:
        for item in inner_err_list:
            errors.append(get_error(item))
    else:
        errors.append(err)
        
    return errors  
    
def get_value_errors(e) -> list:
    err_list = error_finder(e)
    
    unique_list = []
    if err_list:
        unique_list = list(set(err_list))     
    
    return unique_list


def normalize_bool(val):
    """
    Normalize various representations of boolean-like values.

    Args:
        val: input value which may be bool, str, int, None, etc.

    Returns:
        True or False when a clear boolean interpretation exists.
        None when the input is explicitly empty (None or empty string) and
        should be treated as "no value provided".

    Examples:
        normalize_bool(True) -> True
        normalize_bool('true') -> True
        normalize_bool('False') -> False
        normalize_bool('') -> None
        normalize_bool(None) -> None
        normalize_bool(1) -> True
        normalize_bool(0) -> False
    """
    # explicit empty values -> treat as no value provided
    if val is None:
        return None

    if isinstance(val, str):
        v = val.strip()
        if v == '':
            return None
        v_l = v.lower()
        if v_l in ('true', '1', 'yes', 'on'):
            return True
        if v_l in ('false', '0', 'no', 'off'):
            return False
        # fallback: non-empty string -> True
        return True

    # booleans -> return as-is
    if isinstance(val, bool):
        return val

    # numbers -> truthiness (0 -> False, non-zero -> True)
    try:
        if isinstance(val, (int, float)):
            return bool(val)
    except Exception:
        pass

    # fallback: coerce to bool for other types
    try:
        return bool(val)
    except Exception:
        return None