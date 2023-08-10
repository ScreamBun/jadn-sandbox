import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Button } from "reactstrap";
import { sbToastError, sbToastSuccess } from "./SBToast";
import SBSpinner from "./SBSpinner";

const SBCopyToClipboard = (props: any) => {

    const { buttonId, data, customClass, shouldStringify = false } = props;
    const [isLoading, setIsLoading] = useState(false);

    const onCopyClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let copied_data = data;
        setIsLoading(true);
        try {
            if (shouldStringify == true) {
                copied_data = JSON.stringify(data, null, 4);
            }

            navigator.clipboard.writeText(copied_data);
            setIsLoading(false);
            sbToastSuccess(`Copied to clipboard`);
        } catch {
            setIsLoading(false);
            sbToastError('Failed to copy to clipboard')
        }
    }

    return (
        <>
            {isLoading ? <SBSpinner color={"primary"} /> : <Button id={buttonId || 'copyToClipboard'} title="Copy to clipboard" color="primary" className={'btn-sm ' + customClass} onClick={onCopyClick}>
                <FontAwesomeIcon icon={faCopy} />
            </Button>
            }
        </>
    )
}
export default SBCopyToClipboard;