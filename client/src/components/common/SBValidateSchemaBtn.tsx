import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setSchema } from "actions/util";
import React from "react";
import { useDispatch } from "react-redux";
import { sbToastSuccess, dismissAllToast, sbToastError } from "./SBToast";
import { validateSchema } from "actions/validate";
import { validateJSON } from "components/utils/general";


const SBValidateSchemaBtn = (props: any) => {

    const { isValid, setIsValid, setIsValidating, schemaData, schemaFormat } = props;
    const dispatch = useDispatch();

    const onValidateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsValid(false);
        setIsValidating(true);

        let schemaStr = schemaData;
        if (typeof schemaData != 'string') {
            schemaStr = JSON.stringify(schemaData);
        }

        if (schemaFormat == 'jadn') {
            validateJADN(schemaStr)

        } else {
            onValidateJSON(schemaStr)
        }

        setIsValidating(false);
    }


    const validateJADN = (jsonToValidate: any) => {
        let jsonObj = validateJSON(jsonToValidate);
        if (jsonObj == false) {
            sbToastError(`Invalid JSON. Cannot validate JADN`);
            return false;
        }

        return dispatch(validateSchema(jsonObj))
            .then((validateSchemaVal: any) => {
                if (validateSchemaVal.payload.valid_bool == true) {
                    setIsValid(true);
                    dispatch(setSchema(jsonObj));
                    sbToastSuccess(validateSchemaVal.payload.valid_msg);
                    return true;
                } else {
                    sbToastError(validateSchemaVal.payload.valid_msg);
                    return false;
                }
            })
            .catch((validateSchemaErr) => {
                sbToastError(validateSchemaErr.payload.valid_msg)
                return false;
            })
    }

    const onValidateJSON = (jsonSchema: any) => {
        let jsonObj = validateJSON(jsonSchema);
        if (jsonObj) {
            setIsValid(true);
            setIsValidating(false);
            dispatch(setSchema(jsonObj));
        }
        return jsonObj;
    }

    return (
        <>
            <button id='validateJADNButton' type='button' className='btn btn-sm btn-primary float-end ms-1 me-1' title={isValid ? "Schema is valid" : "Click to validate Schema"}
                onClick={onValidateClick}>
                <span className="m-1">Valid</span>
                {isValid ? (
                    <span className="badge rounded-pill text-bg-success">
                        <FontAwesomeIcon icon={faCheck} />
                    </span>) : (
                    <span className="badge rounded-pill text-bg-danger">
                        <FontAwesomeIcon icon={faXmark} />
                    </span>)
                }
            </button>
        </>
    );
}

export default SBValidateSchemaBtn;