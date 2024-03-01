import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { sbToastSuccess, dismissAllToast, sbToastError } from "./SBToast";

const SBECMARegexBtn = (props: any) => {

    const { isECMAScriptValid, setIsECMAScriptValid, setIsValidating, patternData, customClass } = props;

    const onValidateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsECMAScriptValid(false);

        if (!patternData) {
            sbToastError('Validation Error: No Pattern to validate');
            setIsValidating(false);
            return;
        }

        setIsValidating(true);

        let regexObj = patternData;
        console.log(regexObj)
        if (typeof regexObj == 'string') {
            try {
                const regexECMA = new RegExp(regexObj);
                console.log(regexECMA.exec(""));
                sbToastSuccess("Valid ECMAScript Regex "+regexObj)
                setIsECMAScriptValid(true)

            } catch (err: any) {
                sbToastError(`Invalid ECMAScript Regex: ${err.message}`)
                setIsValidating(false);
                return;
            }
        }
        setIsValidating(false);
    }

    return (
        <>
            <button id='validateECMAButton' type='button' className={`btn btn-sm btn-primary ms-1 me-1 + ${customClass}`} title={isECMAScriptValid ? "Schema is valid" : "Click to validate Schema"}
                onClick={onValidateClick}>
                <span className="m-1">ECMA</span>
                {isECMAScriptValid ? (
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

export default SBECMARegexBtn;