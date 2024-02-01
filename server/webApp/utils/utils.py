import json
import os

from flask import current_app


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
        

def remove_files(path: str, filenames: []):

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