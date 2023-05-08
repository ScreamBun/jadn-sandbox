import React, { useState } from "react";
import SBCopyToClipboard from "./SBCopyToClipboard";
import SBEditor from "./SBEditor";
import SBDownloadFile from "./SBDownloadFile";

//given a list of data
//toggle each view
//allow user to download or copy to clipboard
const SBCollapseViewer = (props: any) => {
    const { data } = props;
    const [toggle, setToggle] = useState('');

    const onToggle = (index: number) => {
        if (toggle == index.toString()) {
            setToggle('');

        } else {
            setToggle(`${index}`);
        }
    }

    const listData = data.map((obj: any, i: number) => {
        return (
            <div className="card" key={i}>
                <div className="card-header">
                    <h5 className="mb-0">
                        <button className="btn btn-link" id={`toggleMsg#${i}`} type="button" onClick={() => onToggle(i)} >
                            {obj.fmt}
                        </button>
                        <SBCopyToClipboard buttonId={`copy${i}`} data={obj.schema} customClass='float-right' />
                        <SBDownloadFile buttonId={`download${i}`} customClass='mr-1 float-right' data={obj.schema} ext={obj.fmt} />
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