import React, { useState } from "react";
import SBSpinner from "./SBSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCode } from "@fortawesome/free-solid-svg-icons";
import { sbToastError, sbToastSuccess } from "./SBToast";

const SBDownloadFileBtn = (props: any) => {

    const { buttonId, customClass, isDisabled, buttonTitle, fileName } = props;
    const [isLoading, setIsLoading] = useState(false);

    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            fetch('/api/convert/download_xml', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'filename': fileName
                })

            }).then(response => response.blob())
            .then(data => {

                const blobUrl = URL.createObjectURL(data);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = fileName;                
                document.body.appendChild(link);

                link.dispatchEvent(
                    new MouseEvent('click', { 
                      bubbles: true, 
                      cancelable: true, 
                      view: window 
                    })
                  );   
                  
                document.body.removeChild(link);

                sbToastSuccess(`${fileName} downloaded`);
            }).catch(err => {
                console.log(err);
                sbToastError(`${fileName} cannot be downloaded`);
            }).finally(()=>{
                setIsLoading(false);
            });

        } catch (err) {
            console.log(err);
            sbToastError(`${fileName} cannot be downloaded`);
        }

    }

    return (
        <>
            {isLoading ? <SBSpinner color={"primary"} /> :
                <button 
                    id={buttonId || 'downloadFileBtn'} 
                    type={'button'} 
                    title={buttonTitle || "Download File"} 
                    className={'btn btn-sm btn-primary border-0 ' + customClass} 
                    disabled={isDisabled}
                    onClick={onClick}>
                    <FontAwesomeIcon icon={faFileCode} />
                </button>
            }
        </>
    )
}
export default SBDownloadFileBtn;