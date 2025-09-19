import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setSchema, setSchemaValid } from "actions/util";
import { isSchemaValid } from "reducers/util";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissAllToast, sbToastError, sbToastSuccess } from "./SBToast";
import { validateSchema } from "actions/validate";
import { LANG_JADN, LANG_JIDL, LANG_JSON } from "components/utils/constants";

const SBValidateSchemaBtn = (props: any) => {

    const { isValid, setIsValid, setIsValidating, schemaData, schemaFormat = "jadn", customClass, showToast = true } = props;
    const dispatch = useDispatch();
    const schemaValid = useSelector(isSchemaValid);

    const onValidateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsValid(false);
        dispatch(setSchemaValid(false));

        if (!schemaData) {
            sbToastError('Validation Error: No Schema to validate');
            setIsValidating(false);
            return;
        }

        if (!schemaFormat) {
            sbToastError('Validation Error: Schema Format selection required');
            setIsValidating(false);
            return;
        }        

        setIsValidating(true);

        let jsonObj = schemaData;
        if (schemaFormat == LANG_JSON || schemaFormat == LANG_JADN) {
            if (typeof jsonObj == 'string') {
                try {
                    jsonObj = JSON.parse(jsonObj);
                } catch (err: any) {
                    sbToastError(`Invalid JSON: ${err.message}`)
                    setIsValidating(false);
                    return;
                }
            }
        }

        if (schemaFormat == LANG_JSON) {
            sendSchemaToValidate(jsonObj, LANG_JSON);
        } else if  (schemaFormat == LANG_JIDL) {
            sendSchemaToValidate(jsonObj, LANG_JIDL);
        } else {
            sendSchemaToValidate(jsonObj, LANG_JADN);
        }

        setIsValidating(false);
    }

    const sendSchemaToValidate = (jsonObj: any, schema_format: string) => {
        try {
            dispatch(validateSchema(jsonObj, schema_format))
                .then((validateSchemaVal: any) => {
                    if (validateSchemaVal.payload.valid_bool == true) {
                        setIsValid(true);
                        dispatch(setSchemaValid(true));
                        dispatch(setSchema(jsonObj));
                        if (showToast){
                            sbToastSuccess(validateSchemaVal.payload.valid_msg);
                        }
                    } else {
                        dispatch(setSchema(null));
                        sbToastError(validateSchemaVal.payload.valid_msg);
                    }
                })
                .catch((validateSchemaErr) => {
                    dispatch(setSchema(null));
                    sbToastError(validateSchemaErr.payload.valid_msg)
                }).finally(() => {
                    setIsValidating(false);
                })

        } catch (err) {
            if (err instanceof Error) {
                dispatch(setSchema(null));
                setIsValidating(false);
                sbToastError(err.message)
            }
        }
    }

    return (
        <>
            <button id='validateJADNButton' type='button' className={`btn btn-sm btn-primary ms-1 me-1 + ${customClass}`} title={schemaValid ? "Schema is valid" : "Click to validate Schema"}
                onClick={onValidateClick}>
                <span className="m-1">Valid</span>
                {schemaValid ? (
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
};

export default SBValidateSchemaBtn;