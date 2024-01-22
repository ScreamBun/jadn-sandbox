import React, { useEffect, useState } from "react";
import SBCopyToClipboard from "./SBCopyToClipboard";
import SBEditor from "./SBEditor";
import { faWindowMaximize } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FILE_TYPE_PDF, FILE_TYPE_PNG, FILE_TYPE_SVG, LANG_GRAPHVIZ, LANG_HTML, LANG_JIDL, LANG_MARKDOWN, LANG_PLANTUML, LANG_XSD } from "components/utils/constants";
import { convertToGvFullView, onGVPopOutClick } from "../visualize/SBGvPreviewer";
import { onHTMLPopOutClick } from "../visualize/SBHtmlPreviewer";
import { onMDPopOutClick } from "../visualize/SBMarkdownPreviewer";
import { convertToPuml } from "../visualize/SBPumlPreviewer";
import SBDownloadBtn from "./SBDownloadBtn";
import { sbToastError } from "./SBToast";
import SBDownloadFileBtn from "./SBDownloadFileBtn";

//given a list of data
//toggle each view
//allow user to download or copy to clipboard
const SBCollapseViewer = (props: any) => {
    const { data, pumlURL, setPumlURL, loadedSchema } = props;
    const [toggle, setToggle] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        for (const obj of data) {
            if (obj.fmt_ext == LANG_PLANTUML) {
                setPumlURL(convertToPuml(obj.schema));
            }
            if (obj.fmt_ext == LANG_GRAPHVIZ) {
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
                    <h5 className="mb-0 align-self-center">
                        <button id={`toggleMsg#${i}`} type="button" className="btn btn-link" onClick={() => onToggle(i)} >
                            {obj.fmt}
                        </button>
                        <SBCopyToClipboard buttonId={`copy${i}`} data={obj.schema} customClass='float-end' />
                        <SBDownloadBtn buttonId={`download${i}`} customClass='me-1 float-end' data={obj.schema} ext={obj.fmt_ext} />

                        {obj.fmt_ext == LANG_XSD &&
                            <>
                                <SBDownloadFileBtn buttonId='jadnBaseTypesDownload' buttonTitle='Download JADN Base Types Schema' fileName='jadn_base_types.xsd' customClass={`me-1 float-end`}></SBDownloadFileBtn>
                            </>
                        }

                        {obj.fmt_ext == LANG_HTML &&
                            <>
                                <SBDownloadBtn buttonId={`download${i}AsHTML`} customClass='me-1 float-end' data={loadedSchema} ext={FILE_TYPE_PDF} />
                                <button id="htmlPopOut" type='button' title="View Schema in new window" className="btn btn-sm btn-primary me-1 float-end" onClick={() => onHTMLPopOutClick(obj.schema)}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </button>
                            </>
                        }

                        {obj.fmt_ext == LANG_MARKDOWN &&
                            <>
                                <SBDownloadBtn buttonId={`download${i}AsMD`} customClass='me-1 float-end' data={loadedSchema} ext={FILE_TYPE_PDF} />
                                <button id="mdPopOut" type='button' title="View Schema in new window" className="btn btn-sm btn-primary me-1 float-end" onClick={() => onMDPopOutClick(obj.schema)}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </button>
                            </>
                        }

                        {obj.fmt_ext == LANG_JIDL &&
                            <>
                                <button id="jidlPopOut" type='button' title="View Schema in new window" className="btn btn-sm btn-primary me-1 float-end" onClick={() => onPopOutClick(obj.schema)}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </button>
                            </>
                        }

                        {obj.fmt_ext == LANG_PLANTUML &&
                            <>
                                <SBDownloadBtn buttonId={`pumlPngDownload`} customClass='me-1 float-end' data={pumlURL} ext={FILE_TYPE_PNG} />
                                <button id="pumlPopOut" type='button' title="View Schema in new window" className="btn btn-sm btn-primary me-1 float-end" onClick={() => onPopOutClick('', pumlURL)}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </button>
                            </>
                        }

                        {obj.fmt_ext == LANG_GRAPHVIZ &&
                            <>
                                <SBDownloadBtn buttonId={`gvSvgDownload`} customClass='me-1 float-end' ext={FILE_TYPE_SVG} />
                                <button id="gvPopOut" type='button' title="View Schema in new window" className="btn btn-sm btn-primary me-1 float-end" onClick={onGVPopOutClick}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </button>
                            </>
                        }

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