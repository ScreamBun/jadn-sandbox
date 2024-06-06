from io import TextIOBase
import io
import json
import os
import subprocess
import cbor_diag

from cbor2 import dumps
import docker
from flask import current_app
from cbor2 import dumps


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
        return current_app.config.get("OPEN_C2_SCHEMA_CUSTOM_DATA")
    elif loc == 'messages':
        return current_app.config.get("OPEN_C2_MESSAGE_CUSTOM_DATA")
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


def write_file(path: str, filename: str, data):
    fp = os.path.join(path, filename)
    with open(fp, 'w') as outfile:
        outfile.write(data)        

    if is_file_in_dir(path, filename):
        return True
    else:
        return False
 
    
def convert_json_to_cbor_str(data_dict: dict) -> bytes:
    json_str = json.dumps(data_dict)
    
    encoded = cbor_diag.diag2cbor(json_str)
    cbor_str= encoded.hex()    
    
    return cbor_str
                         

def convert_cbor_str_to_json(cbor_str: str) -> str:
    
    # Legacy conversion, returns dict
    # msg_binary_string = binascii.unhexlify(hex_str)
    # msg_native_json = cbor_json.native_from_cbor(msg_binary_string) 
    # print("msg_native_json: " + str(msg_native_json))
    
    bytes_obj = bytes.fromhex(cbor_str)
    cbor_bytes_obj = dumps(bytes_obj, canonical=True)
    
    # No formatting, returns str
    cbor_diag_str = cbor_diag.cbor2diag(bytes_obj)
    print("cbor_diag_str: " + cbor_diag_str)
    
    return cbor_diag_str


def convert_cbor_to_annotated_view(cbor_str: str) -> bytes:
    annoated_view = ""
    
    # Call ruby script to generate annoated view
    # Return annoated view
    
    # TODO: Add ruby install script
    # TODO: Add ruby install logic to docker file
    
    # TODO: Clear file and add cbor val to file
    
    files_path = current_app.config.get("FILES_DATA")
    app_path = current_app.config.get("APP_DIR")
    # cbor_val_full_path = os.path.join(files_path, 'cbor_val.cbor')
    # cbor_annotated_full_path = os.path.join(files_path, 'cbor_annotated.txt')
    
    # try: https://sentry.io/answers/running-external-programs-in-python/
    # https://www.decalage.info/en/python/ruby_bridge
    # os.system("cbor2pretty.rb " + cbor_val_full_path + " > " + cbor_annotated_full_path)
    # os.system("ruby cbor2pretty.rb cbor_val.cbor > cbor_annotated.txt")
    
    # pwd = subprocess.run(["pwd"], shell=True, capture_output=True, text=True)
    
    # path_to_gem_scripts = '/home/matt/.rbenv/versions/3.3.1/bin/'
    # path_to_json2cbor_script = os.path.join(path_to_gem_scripts, 'json2cbor.rb')
    # value_json2cbor_script_found = os.path.isfile(path_to_json2cbor_script)
    
    # path_to_value_json_file = os.path.join(app_path, 'value_json.json')
    # value_json_file_found = os.path.isfile(path_to_value_json_file)
    
    # path_to_value_cbor_file = os.path.join(app_path, 'value_cbor.cbor')
    # value_cbor_file_found = os.path.isfile(path_to_value_cbor_file)
    
    # cbor_to_pretty_cmd = path_to_json2cbor_script + " " + path_to_value_json_file + " > " + path_to_value_cbor_file
    
    # os.system("/home/matt/.rbenv/versions/3.3.1/bin/json2cbor.rb value_json.json > value_cbor.cbor")
    # os.system("/home/matt/.rbenv/versions/3.3.1/bin/cbor2pretty.rb value_cbor.cbor > value_cbor_pretty.txt")
    
    # Left off here... not running ruby script....
    # TODO: Read from value_cbor_pretty.txt file
    
    # CONTAINER_ID = "68f4c1f50e57"
    # client = docker.client.from_env()
    # container = client.containers.get(CONTAINER_ID)
    # exit_code, output = container.exec_run("json2cbor.rb value_json.json > value_cbor.cbor")
    
    data = {
        "Image": {
            "Width": 800,
            "Height": 600,
            "Title": "View from 13th Floor",
            "Thumbnail": {
            "Url": "http://www.example.com/image/481989942",
            "Height": 125,
            "Width": 100
            },
            "Animated": False,
            "IDs": [
                333,
                116,
                943,
                234,
                38793
            ]
        }
    }
    
    local_json_file_path = './cbor_files/value_json.json'
    # local_json_file_path = 'value_json.json'
    container_json_file_path = '/opt/jadn_sandbox/value_json.json'
    container_name = 'stingy_door'

    with open(local_json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    
    # os.system("docker run --name testcontainer -d -i -t alpine /bin/sh")
    # os.system("docker exec -d testcontainer touch /tmp/execWorks.txt")
    # os.system("docker exec -d testcontainer n () { date >> /tmp/execWorks.txt; cat >> /tmp/execWorks.txt; }")
    
    container_gem_path = "/usr/local/bin/"
    container_workdir_path = "/opt/jadn_sandbox/"
    json2cbor_script_path = "/usr/local/bin/json2cbor.rb"
    cbor2pretty_script_path = "/usr/local/bin/cbor2pretty.rb"
    value_json_file_path = os.path.join(container_workdir_path, 'value_json.json')
    value_cbor_file_path = os.path.join(container_workdir_path, 'value_cbor.cbor')
    value_cbor_pretty_file_path = os.path.join(container_workdir_path, 'value_cbor_pretty.txt')

    cp_cmd = "docker cp " + local_json_file_path + " " + container_name + ":" + container_json_file_path
    json_to_cbor_cmd = "docker exec -d " + container_name + " " + json2cbor_script_path + " " + value_json_file_path + " > " +  value_cbor_file_path
    cbor_to_hex_pretty_cmd = "docker exec -d " + container_name + " " + cbor2pretty_script_path + " " + value_cbor_file_path + " > " + value_cbor_pretty_file_path
    
    os.system(cp_cmd)
    # os.system(json_to_cbor_cmd)
    # os.system("docker exec -d stingy_door /usr/local/bin/json2cbor.rb /opt/jadn_sandbox/value_json.json > /opt/jadn_sandbox/value_cbor.cbor")
    # os.system(cbor_to_hex_pretty_cmd)
    
    # ans = subprocess.call(["docker", "exec", "-d", "stingy_door", "/usr/local/bin/json2cbor.rb", "/opt/jadn_sandbox/value_json.json", ">", "/opt/jadn_sandbox/value_cbor.cbor"]) 
    # if ans == 0: 
    #     print("Command executed.") 
    # else: 
    #     print("Command failed.")    
        
    output = io.StringIO()
    ans =  subprocess.run(
        json_to_cbor_cmd,
        shell=True
    )        
    
    return annoated_view