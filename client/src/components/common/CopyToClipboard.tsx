import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button } from "reactstrap";
import { sbToastSuccess } from "./SBToast";

const CopyToClipboard = (props: any) => {

    const { buttonId, data, customClass } = props;

    const onCopyClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
        navigator.clipboard.writeText(data);
        sbToastSuccess(`Copied to clipboard`);
    }    

    return (
        <Button id={buttonId || 'copyToClipboard'} title="Copy to clipboard" color="info" className={'btn-sm ' + customClass} onClick={onCopyClick}>
            <FontAwesomeIcon icon={faCopy} />
        </Button>                              
    )
}
export default CopyToClipboard;