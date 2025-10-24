import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinimize } from "@fortawesome/free-solid-svg-icons";
import { LANG_JSON, LANG_JSON_UPPER, COMPACT_CONST, CONCISE_CONST } from "components/utils/constants";
import { sbToastError } from "./SBToast";
import { convertData } from "actions/convert";
import { useDispatch, useSelector } from "react-redux";
import { getSelectedSchema } from "reducers/util";
import { SchemaJADN } from "components/create/schema/interface";

const SBCompactConciseBtn = (props: any) => {

    const { ext, data, convertTo, handleClick, setCompact, setConcise, customClass, index = null } = props;
    const dispatch = useDispatch();
    const schemaObj: SchemaJADN = useSelector(getSelectedSchema);

    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!data) {
        return;
    }

    // Calculate the next state before calling handleClick
    let nextConvertTo = '';
    if (convertTo === '') {
        nextConvertTo = COMPACT_CONST;
    } else if (convertTo === COMPACT_CONST) {
        nextConvertTo = CONCISE_CONST;
    } else if (convertTo === CONCISE_CONST) {
        nextConvertTo = '';
    }

    // Call handleClick to update the state
    handleClick();

    // Only dispatch if we're moving to compact or concise (not turning off)
    if (nextConvertTo === COMPACT_CONST || nextConvertTo === CONCISE_CONST) {
        try {
            let dataObj = data;
            if (typeof data == 'string') {
                dataObj = JSON.parse(dataObj);
            }

            console.log(dataObj, nextConvertTo);
            dispatch(convertData(JSON.stringify(dataObj), LANG_JSON_UPPER, nextConvertTo, schemaObj))
                .then((rsp: any) => {
                    if(rsp.payload.data) {
                        if(rsp.payload.data.compact_json) {
                            if (index !== null) {
                                setCompact((prev: { [key: string]: string }) => ({ ...prev, [index]: rsp.payload.data.compact_json }));
                            } else {
                                setCompact(rsp.payload.data.compact_json);
                            }
                        } else if (rsp.payload.data.concise_json) {
                            if (index !== null) {
                                setConcise((prev: { [key: string]: string }) => ({ ...prev, [index]: rsp.payload.data.concise_json }));
                            } else {
                                setConcise(rsp.payload.data.concise_json);
                            }
                        }
                    } else {
                        console.log(rsp.payload.message);
                    }
                })
                .catch((submitErr: { message: string }) => {
                    sbToastError(submitErr.message)
                });

        } catch {
            sbToastError('Failed to convert to compact: Invalid JSON')
            return;
        }
    }
}

    return (
        <>
            <button
                id='formatButton'
                type='button'
                className={`btn btn-sm ${convertTo == "" || ext != LANG_JSON ? 'btn-primary' : convertTo == COMPACT_CONST ? 'btn-warning' : 'btn-danger-primary'} ` + customClass}
                disabled={ext != LANG_JSON}
                onClick={onClick}
                title={convertTo == "" ? 'Compact JSON' : convertTo == COMPACT_CONST ? 'Concise JSON' : 'Turn off Compact/Concise JSON'}>
                <FontAwesomeIcon icon={faMinimize} />
            </button>
        </>
    );
}

export default SBCompactConciseBtn;