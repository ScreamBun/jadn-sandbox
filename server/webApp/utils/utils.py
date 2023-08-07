import os


def find_file_by_name(name: str, path: str):
    file_found = None
    for (root, dirs, file) in os.walk(path):
        for f in file:
            if name == f.lower():
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