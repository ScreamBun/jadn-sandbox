import { faFileDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Button } from "reactstrap";
import SBCopyToClipboard from "./SBCopyToClipboard";
import SBEditor from "./SBEditor";
import { sbToastError } from "./SBToast";

//given a list of data
//toggle each view
//allow user to download or copy to clipboard
const SBCollapseViewer = (props: any) => {
    //const { data } = props;
    const [toggle, setToggle] = useState('');

    const onToggle = (index: number) => {
        if (toggle == index.toString()) {
            setToggle('');

        } else {
            setToggle(`${index}`);
        }
    }

    const onDownload = (index: number) => {
        //TODO: change filename ext
        try {
            const item = data[index].schema;
            const filename = `schema.json`;

            const blob = new Blob([item], { type: "application/json" });
            const elem = document.createElement('a');
            elem.href = URL.createObjectURL(blob);
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();

            elem.remove();
            URL.revokeObjectURL(elem.href);
        } catch (err) {
            console.log(err);
            sbToastError(`File cannot be downloaded`);
        }
    }

    //TODO: remove when data props has been properly fixed
    let data = [
        { language: "html", schema: 'schema data for html' },
        { language: "html", schema: 'schema data for html' },
        { language: "html", schema: 'schema data for html' },
    ]

    const listData = data.map((obj: any, i: number) => {
        return (
            <div className="card" key={i}>
                <div className="card-header">
                    <h5 className="mb-0">
                        <button className="btn btn-link" id={`toggleMsg#${i}`} type="button" onClick={() => onToggle(i)} >
                            {obj.language}
                        </button>
                        <SBCopyToClipboard buttonId={`copy${i}`} data={obj.schema} customClass='float-right' />
                        <Button id={`download${i}`} title="Download" color="info" className='btn-sm mr-1 float-right' onClick={() => onDownload(i)}>
                            <FontAwesomeIcon icon={faFileDownload} />
                        </Button>
                    </h5>
                </div>

                {toggle == `${i}` ?
                    <div className="card-body" key={i}>
                        <SBEditor data={obj.schema} isReadOnly={true} height={'20em'}></SBEditor>
                    </div> : ''}
            </div>
        );
    });

    return (
        <div className='card-body p-0' style={{ height: '40em', overflowY: 'auto' }}>
            {listData}
        </div>
    );
}

export default SBCollapseViewer;