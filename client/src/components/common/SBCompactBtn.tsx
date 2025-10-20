import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinimize } from "@fortawesome/free-solid-svg-icons";
import { LANG_JADN, LANG_JSON } from "components/utils/constants";
import { FormatJADN } from "components/utils";
import { sbToastError } from "./SBToast";

const SBFormatBtn = (props: any) => {

    const { ext, data, toggle, customClass, handleCompactClick } = props;

    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!data) {
            return;
        }

        try {
            let dataObj = data;
            if (typeof data == 'string') {
                dataObj = JSON.parse(dataObj);
            }

            if (ext == LANG_JADN) {
                dataObj = FormatJADN(dataObj);
            }

            handleCompactClick(dataObj);

        } catch {
            sbToastError('Failed to minimize: Invalid JSON')
            return;
        }
    }

    return (
        <>
            <button
                id='formatButton'
                type='button'
                className={`btn btn-sm ${toggle && (ext == LANG_JSON || ext == LANG_JADN) ? 'btn-warning' : 'btn-primary'} ` + customClass}
                disabled={ext != LANG_JSON && ext != LANG_JADN}
                onClick={onClick}
                title='Minimize'>
                <FontAwesomeIcon icon={faMinimize} />
            </button>
        </>
    );
}

export default SBFormatBtn;