import React from "react";
import { FormatJADN } from "components/utils";
import { sbToastError } from "./SBToast";

const SBFormatBtn = (props: any) => {

    const { ext, data, customClass, handleFormatClick } = props;

    const onFormatClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            let dataObj = data;
            if (typeof data == 'string') {
                dataObj = JSON.parse(dataObj);
            }

            if (ext == 'jadn') {
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
            <button id='formatButton' type='button' className={'btn btn-sm btn-primary ' + customClass} onClick={onFormatClick}
                title='Attempts to Parse and Format.'>
                <span className="m-1">Format</span>
            </button>
        </>
    );
}

export default SBFormatBtn;