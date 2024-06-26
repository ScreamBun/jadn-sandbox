import React from "react";
import SBSpinner from "./SBSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

const SBValidBtn = (props: any) => {

    const { buttonId, customClass, isLoading, isDisabled, buttonTitle, formId, isValid } = props;

    return (
        <>
            {isLoading ? <SBSpinner color={"primary"} /> :
                <button 
                    id={buttonId || 'submitBtn'} 
                    type={'submit'} 
                    form={formId}
                    title={buttonTitle || "Click to validate"} 
                    className={'btn btn-sm btn-primary ms-1 me-1 ' + customClass} 
                    disabled={isDisabled}>
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
            }
        </>
    )
}
export default SBValidBtn;