import binascii
import json
from json2xml import json2xml
import os

from cbor2 import dumps
import cbor_json
from flask import current_app

from webApp.utils import constants


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