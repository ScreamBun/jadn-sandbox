import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndent } from "@fortawesome/free-solid-svg-icons";
import { LANG_JADN } from "components/utils/constants";
import { FormatJADN } from "components/utils";
import { sbToastError } from "./SBToast";

const SBFormatBtn = (props: any) => {

    const { ext, data, customClass, handleFormatClick } = props;

    const onFormatClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!data) {
            sbToastError('Format Error: No Schema to format');
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

            handleFormatClick(dataObj);

        } catch {
            sbToastError('Failed to format: Invalid JSON')
            return;
        }
    }

    return (
        <>
            <button
                id='formatButton'
                type='button'
                className={'btn btn-sm btn-primary ' + customClass}
                onClick={onFormatClick}
                title='Format'>
                <FontAwesomeIcon icon={faIndent} />
            </button>
        </>
    );
}

export default SBFormatBtn;