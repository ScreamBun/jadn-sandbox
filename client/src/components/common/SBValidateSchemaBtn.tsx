import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setSchema } from "actions/util";
import React from "react";
import { useDispatch } from "react-redux";
import { sbToastSuccess, dismissAllToast, sbToastError } from "./SBToast";
import { validateSchema } from "actions/validate";
import { LANG_JADN, LANG_JSON } from "components/utils/constants";

const SBValidateSchemaBtn = (props: any) => {

    const { isValid, setIsValid, setIsValidating, schemaData, schemaFormat, customClass } = props;
    const dispatch = useDispatch();

    const onValidateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsValid(false);

        if (!schemaData) {
            sbToastError('Validation Error: No Schema to validate');
            setIsValidating(false);
            return;
        }

        setIsValidating(true);

        let jsonObj = schemaData;
        if (typeof jsonObj == 'string') {
            try {
                jsonObj = JSON.parse(jsonObj);
            } catch (err: any) {
                sbToastError(`Invalid JSON: ${err.message}`)
                setIsValidating(false);
                return;
            }
        }

        if (schemaFormat == LANG_JSON) {
            validateJSONSchema(jsonObj);
        } else {
            validateJADNSchema(jsonObj);
        }

        setIsValidating(false);
    }


    const validateJADNSchema = (jsonObj: any) => {
        try {
            dispatch(validateSchema(jsonObj, LANG_JADN))
                .then((validateSchemaVal: any) => {
                    if (validateSchemaVal.payload.valid_bool == true) {
                        setIsValid(true);
                        dispatch(setSchema(jsonObj));
                        sbToastSuccess(validateSchemaVal.payload.valid_msg);
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

    const validateJSONSchema = (jsonObj: any) => {
        try {
            dispatch(validateSchema(jsonObj, LANG_JSON))
                .then((validateSchemaVal: any) => {
                    if (validateSchemaVal.payload.valid_bool == true) {
                        setIsValid(true);
                        dispatch(setSchema(jsonObj));
                        sbToastSuccess(validateSchemaVal.payload.valid_msg);
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
                sbToastError(err.message)
                setIsValidating(false);
                sbToastError(err.message)
            }
        }
    }

    return (
        <>
            <button id='validateJADNButton' type='button' className={`btn btn-sm btn-primary ms-1 me-1 + ${customClass}`} title={isValid ? "Schema is valid" : "Click to validate Schema"}
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
};

export default SBValidateSchemaBtn;