import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowMaximize, faTableColumns, faFileImage } from "@fortawesome/free-solid-svg-icons";
import { getValidVisualizations } from "reducers/convert";
import { sbToastError } from "components/common/SBToast";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import SBHtmlPreviewer, { onHTMLPopOutClick } from "components/visualize/SBHtmlPreviewer";
import SBMarkdownPreviewer, { onMDPopOutClick } from "components/visualize/SBMarkdownPreviewer";
import SBPumlPreviewer, { convertToPuml, onDownloadPNGClick } from "components/visualize/SBPumlPreviewer";
import { useLocation } from "react-router-dom";
import SBGvPreviewer, { convertToGvFullView, convertToGvSplitView, onDownloadSVGClick, onGVPopOutClick } from "components/visualize/SBGvPreviewer";
import SBCollapseViewer from "components/common/SBCollapseViewer";
import SBDownloadFile from "components/common/SBDownloadFile";
import SBDownloadPDF from "components/common/SBDownloadPDF";
import SBSpinner from "components/common/SBSpinner";
import SBSelect, { Option } from "components/common/SBSelect";
import { initConvertedSchemaState } from "./SchemaVisualizer";
import { getSelectedSchema } from "reducers/util";

const SchemaVisualized = (props: any) => {
    const location = useLocation();

    const { conversion, setConversion, convertedSchema, setConvertedSchema, spiltViewFlag, setSplitViewFlag, isLoading } = props;
    const validSchema = useSelector(getSelectedSchema);
    const [pumlURL, setPumlURL] = useState('');
    const data = useSelector(getValidVisualizations);
    let convertOpts: Option[] = [];
    for (let i = 0; i < Object.keys(data).length; i++) {
        convertOpts.push({ ['label']: Object.keys(data)[i], ['value']: Object.values(data)[i] });
    }

    useEffect(() => {
        if (location.state) {
            const index = Object.values(data).indexOf(location.state)
            setConversion({ value: Object.values(data)[index], label: Object.keys(data)[index] });
        }
    }, []);

    useEffect(() => {
        if ((conversion.length == 1 ? conversion[0].value : conversion) == 'puml' && convertedSchema.length != 0) {
            setPumlURL(convertToPuml(convertedSchema[0].schema));
        }
        if ((conversion.length == 1 ? conversion[0].value : conversion) == 'gv' && convertedSchema.length != 0) {
            convertToGvSplitView(convertedSchema[0].schema);
            convertToGvFullView(convertedSchema[0].schema);
        }
    }, [convertedSchema]);

    const handleConversion = (e: Option[]) => {
        let convertTo = [];
        for (let i = 0; i < Object.values(e).length; i++) {
            convertTo.push(Object.values(e)[i])
        }
        setConversion(convertTo);
        setConvertedSchema(initConvertedSchemaState);
        setSplitViewFlag(false);
    }

    const onPopOutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            var newWindow = window.open("");
            newWindow?.document.write('<html><body><pre>' + convertedSchema[0].schema + '</pre></body></html>');
        } catch {
            sbToastError('Error: Unable to open schema in pop out');
        }
    }

    const toggleSplitView = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSplitViewFlag(!spiltViewFlag);
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-6'>
                        <SBSelect id={"conversion-list"} data={convertOpts} onChange={handleConversion}
                            value={conversion}
                            placeholder={'Convert to...(select at least one)'} isMultiSelect
                            isSmStyle
                        />
                    </div>
                    <div className='col-md-6'>
                        <div className={`${conversion.length == 1 && convertedSchema[0].schema ? '' : ' d-none'}`}>
                            <SBCopyToClipboard buttonId='copyConvertedSchema' data={convertedSchema[0].schema} customClass='float-right' />
                            <SBDownloadFile buttonId='schemaDownload' customClass={`mr-1 float-right${convertedSchema[0].schema && conversion.length <= 1 ? '' : ' d-none'}`} data={convertedSchema[0].schema} ext={conversion.length == 1 ? conversion[0].value : conversion} />

                            <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == 'html' ? '' : ' d-none'}`}>
                                <SBDownloadPDF buttonId="htmlPdfDownload" customClass='mr-1 float-right' data={validSchema} />
                                <button type='button' id="htmlPopOut" title="View Schema in new window" className="btn btn-info btn-sm mr-1 float-right" onClick={() => onHTMLPopOutClick(convertedSchema[0].schema)}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </button>
                            </div>

                            <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == 'md' ? '' : ' d-none'}`}>
                                <SBDownloadPDF buttonId="mdPdfDownload" customClass='mr-1 float-right' data={validSchema} />
                                <button type='button' id="mdPopOut" title="View Schema in new window" className="btn btn-info btn-sm mr-1 float-right" onClick={() => onMDPopOutClick(convertedSchema[0].schema)}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </button>
                            </div>

                            <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == 'jidl' ? '' : ' d-none'}`}>
                                <button type='button' id="jidlPopOut" title="View Schema in new window" className="btn btn-info btn-sm mr-1 float-right" onClick={onPopOutClick}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </button>
                            </div>

                            <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == 'puml' ? '' : ' d-none'}`}>
                                <button type='button' id="pumlPngDownload" title="Download PNG of the schema" className="btn btn-info btn-sm mr-1 float-right" onClick={() => onDownloadPNGClick(pumlURL)}>
                                    <FontAwesomeIcon icon={faFileImage} />
                                </button>
                                <a role='button' id="pumlPopOut" title="View Schema in new window" className="btn btn-info btn-sm mr-1 float-right" target="_blank" href={pumlURL}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </a>
                            </div>

                            <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == 'gv' ? '' : ' d-none'}`}>
                                <button type='button' id="gvSvgDownload" title="Download SVG of the schema" className="btn btn-info btn-sm mr-1 float-right" onClick={onDownloadSVGClick}>
                                    <FontAwesomeIcon icon={faFileImage} />
                                </button>
                                <button type='button' id="gvPopOut" title="View Schema in new window" className="btn btn-info btn-sm mr-1 float-right" onClick={onGVPopOutClick}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </button>
                            </div>

                            <div className={`${((conversion.length == 1 ? conversion[0].value : conversion) != 'jidl') ? '' : ' d-none'}`}>
                                <button type='button' id="SplitView" title="View Schema and Preview together" className="btn btn-info btn-sm mr-1 float-right" onClick={toggleSplitView}>
                                    <FontAwesomeIcon icon={faTableColumns} className='fa-rotate-90' />
                                </button>
                            </div>
                        </div>

                        <div>
                            {isLoading ? <SBSpinner action={'Converting'} /> :
                                <button type="submit"
                                    id="convertSchema"
                                    className="btn btn-success btn-sm mr-1 float-right"
                                    disabled={Object.keys(validSchema).length != 0 && conversion.length != 0 ? false : true}
                                    title={"Convert the given JADN schema to the selected format"}>
                                    Convert
                                </button>}
                        </div>
                    </div>
                </div>
            </div>
            <div className={`card-body-page ${spiltViewFlag ? 'd-none' : ''}`}>
                {conversion.length > 1 && convertedSchema.length > 1 ?
                    <SBCollapseViewer data={convertedSchema} pumlURL={pumlURL} setPumlURL={setPumlURL} loadedSchema={validSchema} /> :
                    <SBEditor data={convertedSchema[0].schema} isReadOnly={true} convertTo={(conversion.length == 1 ? conversion[0].value : conversion)}></SBEditor>
                }
            </div>
            <div className={`card-body-page ${spiltViewFlag ? '' : ' d-none'}`}>
                <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == 'html' && convertedSchema.length != 0 ? '' : ' d-none'}`}>
                    <SBHtmlPreviewer htmlText={convertedSchema[0].schema} showPreviewer={true} conversion={(conversion.length == 1 ? conversion[0].value : conversion)}></SBHtmlPreviewer>
                </div>
                <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == 'md' && convertedSchema.length != 0 ? '' : ' d-none'}`}>
                    <SBMarkdownPreviewer markdownText={convertedSchema[0].schema} showPreviewer={true}></SBMarkdownPreviewer>
                </div>
                <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == 'puml' && convertedSchema.length != 0 ? '' : ' d-none'}`}>
                    <SBPumlPreviewer data={pumlURL} convertedSchema={convertedSchema[0].schema} conversion={(conversion.length == 1 ? conversion[0].value : conversion)}></SBPumlPreviewer>
                </div>
                <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == 'gv' && convertedSchema.length != 0 ? '' : ' d-none'}`}>
                    <SBGvPreviewer convertedSchema={convertedSchema[0].schema} conversion={(conversion.length == 1 ? conversion[0].value : conversion)}></SBGvPreviewer>
                </div>
            </div>
        </div>
    );
}
export default SchemaVisualized;