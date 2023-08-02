import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowMaximize, faTableColumns, faFileImage } from "@fortawesome/free-solid-svg-icons";
import { getConversions } from "reducers/convert";
import { sbToastError } from "components/common/SBToast";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import SBHtmlPreviewer, { onHTMLPopOutClick } from "components/visualize/SBHtmlPreviewer";
import SBMarkdownPreviewer, { onMDPopOutClick } from "components/visualize/SBMarkdownPreviewer";
import SBPumlPreviewer, { convertToPuml, onDownloadPNGClick } from "components/visualize/SBPumlPreviewer";
import { isNull } from "lodash";
import { useLocation } from "react-router-dom";
import SBGvPreviewer, { convertToGvFullView, convertToGvSplitView, onDownloadSVGClick, onGVPopOutClick } from "components/visualize/SBGvPreviewer";
import SBCollapseViewer from "components/common/SBCollapseViewer";
import SBDownloadFile from "components/common/SBDownloadFile";
import SBDownloadPDF from "components/common/SBDownloadPDF";
import Spinner from "components/common/Spinner";
import SBSelect, { Option } from "components/common/SBSelect";

const validConversions = ['GraphViz', 'HTML', 'JIDL', 'MarkDown', 'PlantUML'];

const SchemaVisualized = (props: any) => {
    const location = useLocation();
    const { navConvertTo } = location.state;

    const { loadedSchema, conversion, setConversion, convertedSchema, setConvertedSchema, spiltViewFlag, setSplitViewFlag, isLoading } = props;
    const [pumlURL, setPumlURL] = useState('');
    const data = useSelector(getConversions);
    let convertOpts = {};
    for (let i = 0; i < Object.keys(data).length; i++) {
        if (validConversions.includes(Object.keys(data)[i])) {
            convertOpts[Object.keys(data)[i]] = Object.values(data)[i];
        }
    }

    useEffect(() => {
        if (!isNull(navConvertTo)) {
            setConversion(navConvertTo);
        }
    }, []);

    useEffect(() => {
        if (conversion == 'puml' && convertedSchema) {
            setPumlURL(convertToPuml(convertedSchema));
        }
        if (conversion == 'gv' && convertedSchema) {
            convertToGvSplitView(convertedSchema);
            convertToGvFullView(convertedSchema);
        }
    }, [convertedSchema]);

    const handleConversion = (e: Option[]) => {
        let convertTo;
        if (e.length == 1) {
            convertTo = convertOpts[e[0].value];
        } else {
            convertTo = [];
            for (let i = 0; i < Object.values(e).length; i++) {
                convertTo.push(convertOpts[Object.values(e)[i].value])
            }
        }
        setConversion(convertTo);
        setConvertedSchema('');
        setSplitViewFlag(false);
    }

    const onPopOutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            var newWindow = window.open("");
            newWindow?.document.write('<html><body><pre>' + convertedSchema + '</pre></body></html>');
        } catch {
            sbToastError('Error: Unable to open schema in pop out');
        }
    }

    const toggleSplitView = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSplitViewFlag(splitView => !splitView);
    }
    console.log(conversion)

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-6'>
                        <SBSelect id={"conversion-list"} data={Object.keys(convertOpts)} onChange={handleConversion}
                            placeholder={'Convert to...'} isMultiSelect
                        />
                    </div>
                    <div className='col-md-6'>
                        <div className={`${convertedSchema ? '' : ' d-none'}`}>
                            <SBCopyToClipboard buttonId='copyConvertedSchema' data={convertedSchema} customClass='float-right' />
                            <SBDownloadFile buttonId='schemaDownload' customClass={`mr-1 float-right${convertedSchema ? '' : ' d-none'}`} data={convertedSchema} ext={conversion} />

                            <div className={`${conversion == 'html' ? '' : ' d-none'}`}>
                                <SBDownloadPDF buttonId="htmlPdfDownload" customClass='mr-1 float-right' data={loadedSchema} />
                                <Button id="htmlPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={() => onHTMLPopOutClick(convertedSchema)}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </Button>
                            </div>

                            <div className={`${typeof conversion == 'string' && conversion == 'md' ? '' : ' d-none'}`}>
                                <SBDownloadPDF buttonId="mdPdfDownload" customClass='mr-1 float-right' data={loadedSchema} />
                                <Button id="mdPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={() => onMDPopOutClick(convertedSchema)}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </Button>
                            </div>

                            <div className={`${typeof conversion == 'string' && conversion == 'jidl' ? '' : ' d-none'}`}>
                                <Button id="jidlPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={onPopOutClick}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </Button>
                            </div>

                            <div className={`${typeof conversion == 'string' && conversion == 'puml' ? '' : ' d-none'}`}>
                                <Button id="pumlPngDownload" title="Download PNG of the schema" color="info" className="btn-sm mr-1 float-right" onClick={() => onDownloadPNGClick(pumlURL)}>
                                    <FontAwesomeIcon icon={faFileImage} />
                                </Button>
                                <Button id="pumlPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" target="_blank" href={pumlURL}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </Button>
                            </div>

                            <div className={`${typeof conversion == 'string' && conversion == 'gv' ? '' : ' d-none'}`}>
                                <Button id="gvSvgDownload" title="Download SVG of the schema" color="info" className="btn-sm mr-1 float-right" onClick={onDownloadSVGClick}>
                                    <FontAwesomeIcon icon={faFileImage} />
                                </Button>
                                <Button id="gvPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={onGVPopOutClick}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </Button>
                            </div>

                            <div className={`${typeof conversion == 'string' && conversion != 'jidl' ? '' : ' d-none'}`}>
                                <Button id="SplitView" title="View Schema and Preview together" color="info" className="btn-sm mr-1 float-right" onClick={toggleSplitView}>
                                    <FontAwesomeIcon icon={faTableColumns} className='fa-rotate-90' />
                                </Button>
                            </div>
                        </div>

                        <div>
                            {isLoading ? <Spinner action={'Converting'} /> : <Button color="success" type="submit" id="convertSchema" className="btn-sm mr-1 float-right"
                                disabled={loadedSchema && conversion ? false : true}
                                title={"Convert the given JADN schema to the selected format"}>

                                Convert
                            </Button>}
                        </div>
                    </div>
                </div>
            </div>
            <div className={`card-body p-0 ${spiltViewFlag ? 'd-none' : ''}`}>
                {typeof conversion != 'string' && convertedSchema ? <SBCollapseViewer data={convertedSchema} pumlURL={pumlURL} setPumlURL={setPumlURL} loadedSchema={loadedSchema} /> :
                    <SBEditor data={typeof convertedSchema == 'object' ? convertedSchema[0].schema : convertedSchema} isReadOnly={true} convertTo={typeof conversion == 'object' ? '' : conversion} height="40em"></SBEditor>
                }
            </div>
            <div className={`card-body p-0 ${spiltViewFlag ? '' : ' d-none'}`}>
                <div className={`${typeof conversion == 'string' && conversion == 'html' && convertedSchema ? '' : ' d-none'}`}>
                    <SBHtmlPreviewer htmlText={typeof convertedSchema == 'object' ? convertedSchema[0].schema : convertedSchema} showPreviewer={true} conversion={conversion}></SBHtmlPreviewer>
                </div>
                <div className={`${typeof conversion == 'string' && conversion == 'md' && convertedSchema ? '' : ' d-none'}`}>
                    <SBMarkdownPreviewer markdownText={typeof convertedSchema == 'object' ? convertedSchema[0].schema : convertedSchema} showPreviewer={true}></SBMarkdownPreviewer>
                </div>
                <div className={`${typeof conversion == 'string' && conversion == 'puml' && convertedSchema ? '' : ' d-none'}`}>
                    <SBPumlPreviewer data={pumlURL} convertedSchema={typeof convertedSchema == 'object' ? convertedSchema[0].schema : convertedSchema} conversion={conversion}></SBPumlPreviewer>
                </div>
                <div className={`${typeof conversion == 'string' && conversion == 'gv' && convertedSchema ? '' : ' d-none'}`}>
                    <SBGvPreviewer convertedSchema={typeof convertedSchema == 'object' ? convertedSchema[0].schema : convertedSchema} conversion={conversion}></SBGvPreviewer>
                </div>
            </div>
        </div>
    );
}
export default SchemaVisualized;