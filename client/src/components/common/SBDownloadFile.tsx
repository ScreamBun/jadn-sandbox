import React from "react";
import { faFileDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "reactstrap";
import { sbToastError, sbToastSuccess } from "./SBToast";

const SBDownloadFile = (props: any) => {

    const { buttonId, data, customClass, ext } = props;

    const onDownloadClick = (fmt: string = 'jadn') => {
        //prompt file name with extension
        const userInput = prompt("Save file as.. ");
        try {
            const filename = `${userInput}.${fmt}`;

            const blob = new Blob([data], { type: "application/json" });
            //content: `data:application/json;charset=utf-8,${encodeURIComponent(FormatJADN(prevState.schema))}`
            const elem = document.createElement('a');
            elem.href = URL.createObjectURL(blob);
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();

            // To make this work on Firefox we need to wait
            // a little while before removing it.
            setTimeout(() => {
                elem.remove();
                URL.revokeObjectURL(elem.href);
            }, 0);
            sbToastSuccess('File downloaded')
        } catch (err) {
            console.log(err);
            sbToastError(`File cannot be downloaded`);
        }
    }

    return (
        <Button id={buttonId || 'downloadFile'} title="Download File" color="info" className={'btn-sm ' + customClass} onClick={() => onDownloadClick(ext)}>
            <FontAwesomeIcon icon={faFileDownload} />
        </Button>
    )
}
export default SBDownloadFile;