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