import React, { useEffect, useState } from "react";
import SBCopyToClipboard from "./SBCopyToClipboard";
import SBEditor from "./SBEditor";
import SBDownloadFile from "./SBDownloadFile";
import { faWindowMaximize, faFileImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "reactstrap";
import { convertToGvFullView, onDownloadSVGClick, onGVPopOutClick } from "../visualize/SBGvPreviewer";
import { onHTMLPopOutClick } from "../visualize/SBHtmlPreviewer";
import { onMDPopOutClick } from "../visualize/SBMarkdownPreviewer";
import { convertToPuml, onDownloadPNGClick } from "../visualize/SBPumlPreviewer";
import { sbToastError } from "./SBToast";
import SBDownloadPDF from "./SBDownloadPDF";

//given a list of data
//toggle each view
//allow user to download or copy to clipboard
const SBCollapseViewer = (props: any) => {
    const { data, pumlURL, setPumlURL, loadedSchema } = props;
    const [toggle, setToggle] = useState('');

    useEffect(() => {
        for (const obj of data) {
            if (obj.fmt == "PlantUML") {
                setPumlURL(convertToPuml(obj.schema));
            }
            if (obj.fmt == "GraphViz") {
                convertToGvFullView(obj.schema);
            }
        }
    }, [data]);

    const onToggle = (index: number) => {
        if (toggle == index.toString()) {
            setToggle('');

        } else {
            setToggle(`${index}`);
        }
    }

    const onPopOutClick = (data: any, url: string = "") => {
        try {
            var newWindow = window.open(url);
            if (data) {
                newWindow?.document.write('<html><body><pre>' + data + '</pre></body></html>');
            }
        } catch {
            sbToastError('Error: Unable to open data in pop out.');
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
                        <SBDownloadFile buttonId={`download${i}`} customClass='mr-1 float-right' data={obj.schema} ext={obj.fmt_ext} />

                        <span className={`${obj.fmt == 'HTML' ? '' : ' d-none'}`}>
                            <SBDownloadPDF buttonId="htmlPdfDownload" customClass='mr-1 float-right' data={loadedSchema} />
                            <Button id="htmlPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={() => onHTMLPopOutClick(obj.schema)}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </Button>
                        </span>

                        <span className={`${obj.fmt == 'MarkDown' ? '' : ' d-none'}`}>
                            <SBDownloadPDF buttonId="mdPdfDownload" customClass='mr-1 float-right' data={loadedSchema} />
                            <Button id="mdPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={() => onMDPopOutClick(obj.schema)}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </Button>
                        </span>

                        <span className={`${obj.fmt == 'JIDL' ? '' : ' d-none'}`}>
                            <Button id="jidlPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={() => onPopOutClick(obj.schema)}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </Button>
                        </span>

                        <span className={`${obj.fmt == 'PlantUML' ? '' : ' d-none'}`}>
                            <Button id="pumlPngDownload" title="Download PNG of the schema" color="info" className="btn-sm mr-1 float-right" onClick={() => onDownloadPNGClick(pumlURL)}>
                                <FontAwesomeIcon icon={faFileImage} />
                            </Button>
                            <Button id="pumlPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={() => onPopOutClick('', pumlURL)}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </Button>
                        </span>

                        <span className={`${obj.fmt == 'GraphViz' ? '' : ' d-none'}`}>
                            <Button id="gvSvgDownload" title="Download SVG of the schema" color="info" className="btn-sm mr-1 float-right" onClick={onDownloadSVGClick}>
                                <FontAwesomeIcon icon={faFileImage} />
                            </Button>
                            <Button id="gvPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={onGVPopOutClick}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </Button>
                        </span>
                    </h5>
                </div>

                {toggle == `${i}` ?
                    <div className="card-body" key={i}>
                        <SBEditor data={obj.schema} isReadOnly={true} height={'35vh'}></SBEditor>
                    </div>
                    : ''}
            </div>
        );
    });

    return (
        <div className='card-body-page'>
            {listData}
            <div id="fullGV" style={{ visibility: 'hidden', overflow: 'hidden' }}></div>
        </div>
    );
}

export default SBCollapseViewer;