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