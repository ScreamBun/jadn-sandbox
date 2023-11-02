import React, { useEffect, useState } from "react";
import SBCopyToClipboard from "./SBCopyToClipboard";
import SBEditor from "./SBEditor";
import SBDownloadFile from "./SBDownloadFile";
import { faWindowMaximize, faFileImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
    const [toggle, setToggle] = useState<{ [key: string]: boolean }>({});

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
        setToggle((prev) => ({ ...prev, [index]: !prev[index] }));
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
            obj.err == false && <div className="card" key={i}>
                <div className="card-header">
                    <h5 className="mb-0">
                        <button id={`toggleMsg#${i}`} type="button" className="btn btn-link" onClick={() => onToggle(i)} >
                            {obj.fmt}
                        </button>
                        <SBCopyToClipboard buttonId={`copy${i}`} data={obj.schema} customClass='float-end' />
                        <SBDownloadFile buttonId={`download${i}`} customClass='me-1 float-end' data={obj.schema} ext={obj.fmt_ext} />

                        <span className={`${obj.fmt == 'HTML' ? '' : ' d-none'}`}>
                            <SBDownloadPDF buttonId="htmlPdfDownload" customClass='me-1 float-end' data={loadedSchema} />
                            <button id="htmlPopOut" type='button' title="View Schema in new window" className="btn btn-sm btn-primary me-1 float-end" onClick={() => onHTMLPopOutClick(obj.schema)}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </button>
                        </span>

                        <span className={`${obj.fmt == 'MarkDown' ? '' : ' d-none'}`}>
                            <SBDownloadPDF buttonId="mdPdfDownload" customClass='me-1 float-end' data={loadedSchema} />
                            <button id="mdPopOut" type='button' title="View Schema in new window" className="btn btn-sm btn-primary me-1 float-end" onClick={() => onMDPopOutClick(obj.schema)}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </button>
                        </span>

                        <span className={`${obj.fmt == 'JIDL' ? '' : ' d-none'}`}>
                            <button id="jidlPopOut" type='button' title="View Schema in new window" className="btn btn-sm btn-primary me-1 float-end" onClick={() => onPopOutClick(obj.schema)}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </button>
                        </span>

                        <span className={`${obj.fmt == 'PlantUML' ? '' : ' d-none'}`}>
                            <button id="pumlPngDownload" type='button' title="Download PNG of the schema" className="btn btn-sm btn-primary me-1 float-end" onClick={() => onDownloadPNGClick(pumlURL)}>
                                <FontAwesomeIcon icon={faFileImage} />
                            </button>
                            <button id="pumlPopOut" type='button' title="View Schema in new window" className="btn btn-sm btn-primary me-1 float-end" onClick={() => onPopOutClick('', pumlURL)}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </button>
                        </span>

                        <span className={`${obj.fmt == 'GraphViz' ? '' : ' d-none'}`}>
                            <button id="gvSvgDownload" type='button' title="Download SVG of the schema" className="btn btn-sm btn-primary me-1 float-end" onClick={onDownloadSVGClick}>
                                <FontAwesomeIcon icon={faFileImage} />
                            </button>
                            <button id="gvPopOut" type='button' title="View Schema in new window" className="btn btn-sm btn-primary me-1 float-end" onClick={onGVPopOutClick}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </button>
                        </span>
                    </h5>
                </div>

                {toggle[i] == true ?
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