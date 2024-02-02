import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowMaximize, faTableColumns } from "@fortawesome/free-solid-svg-icons";
import { getValidVisualizations } from "reducers/convert";
import { getSelectedSchema } from "reducers/util";
import { FILE_TYPE_PDF, FILE_TYPE_PNG, FILE_TYPE_SVG, LANG_GRAPHVIZ, LANG_HTML, LANG_JIDL, LANG_MARKDOWN, LANG_PLANTUML } from "components/utils/constants";
import { sbToastError } from "components/common/SBToast";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import SBCollapseViewer from "components/common/SBCollapseViewer";
import SBSelect, { Option } from "components/common/SBSelect";
import SBDownloadBtn from "components/common/SBDownloadBtn";
import SBHtmlPreviewer, { onHTMLPopOutClick } from "components/visualize/SBHtmlPreviewer";
import SBMarkdownPreviewer, { onMDPopOutClick } from "components/visualize/SBMarkdownPreviewer";
import SBPumlPreviewer, { convertToPuml } from "components/visualize/SBPumlPreviewer";
import SBGvPreviewer, { convertToGvFullView, convertToGvSplitView, onGVPopOutClick } from "components/visualize/SBGvPreviewer";
import { initConvertedSchemaState } from "./SchemaVisualizer";
import SBSubmitBtn from "components/common/SBSubmitBtn";

const SchemaVisualized = (props: any) => {
    const location = useLocation();

    const { conversion, setConversion, convertedSchema, setConvertedSchema, spiltViewFlag, setSplitViewFlag, isLoading, formId } = props;
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
        if ((conversion.length == 1 ? conversion[0].value : conversion) == LANG_PLANTUML && convertedSchema.length != 0) {
            setPumlURL(convertToPuml(convertedSchema[0].schema));
        }
        if ((conversion.length == 1 ? conversion[0].value : conversion) == LANG_GRAPHVIZ && convertedSchema.length != 0) {
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
                            placeholder={'Visualize to...(select at least one)'} isMultiSelect
                            isSmStyle
                            isClearable />
                    </div>
                    <div className='col-md-6 align-self-center'>
                        <div className={`${conversion.length == 1 && convertedSchema[0].schema ? '' : ' d-none'}`}>
                            <SBCopyToClipboard buttonId='copyConvertedSchema' data={convertedSchema[0].schema} customClass='float-end' />
                            <SBDownloadBtn buttonId='schemaDownload' customClass={`me-1 float-end${convertedSchema[0].schema && conversion.length <= 1 ? '' : ' d-none'}`} data={convertedSchema[0].schema} ext={conversion.length == 1 ? conversion[0].value : conversion} />

                            <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == LANG_HTML ? '' : ' d-none'}`}>
                                <SBDownloadBtn buttonId={`htmlPdfDownload`} customClass='me-1 float-end' data={validSchema} ext={FILE_TYPE_PDF} />
                                <button type='button' id="htmlPopOut" title="View Schema in new window" className="btn btn-primary btn-sm me-1 float-end" onClick={() => onHTMLPopOutClick(convertedSchema[0].schema)}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </button>
                            </div>

                            <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == LANG_MARKDOWN ? '' : ' d-none'}`}>
                                <SBDownloadBtn buttonId={`mdPdfDownload`} customClass='me-1 float-end' data={validSchema} ext={FILE_TYPE_PDF} />
                                <button type='button' id="mdPopOut" title="View Schema in new window" className="btn btn-primary btn-sm me-1 float-end" onClick={() => onMDPopOutClick(convertedSchema[0].schema)}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </button>
                            </div>

                            <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == LANG_JIDL ? '' : ' d-none'}`}>
                                <button type='button' id="jidlPopOut" title="View Schema in new window" className="btn btn-primary btn-sm me-1 float-end" onClick={onPopOutClick}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </button>
                            </div>

                            <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == LANG_PLANTUML ? '' : ' d-none'}`}>
                                <SBDownloadBtn buttonId={`pumlPngDownload`} customClass='me-1 float-end' data={pumlURL} ext={FILE_TYPE_PNG} />
                                <a role='button' id="pumlPopOut" title="View Schema in new window" className="btn btn-primary btn-sm me-1 float-end" target="_blank" href={pumlURL}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </a>
                            </div>

                            <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == LANG_GRAPHVIZ ? '' : ' d-none'}`}>
                                <SBDownloadBtn buttonId={`gvSvgDownload`} customClass='me-1 float-end' ext={FILE_TYPE_SVG} />
                                <button type='button' id="gvPopOut" title="View Schema in new window" className="btn btn-primary btn-sm me-1 float-end" onClick={onGVPopOutClick}>
                                    <FontAwesomeIcon icon={faWindowMaximize} />
                                </button>
                            </div>

                            <div className={`${((conversion.length == 1 ? conversion[0].value : conversion) != LANG_JIDL) ? '' : ' d-none'}`}>
                                <button type='button' id="SplitView" title="View Schema and Preview together" className="btn btn-primary btn-sm me-1 float-end" onClick={toggleSplitView}>
                                    <FontAwesomeIcon icon={faTableColumns} className='fa-rotate-90' />
                                </button>
                            </div>
                        </div>

                        <div>
                            <SBSubmitBtn buttonId="visualizeSchema"
                                buttonTitle="Visualize the given JADN schema to the selected format"
                                buttonTxt="Visualize"
                                customClass="me-1 float-end"
                                isLoading={isLoading}
                                formId={formId}
                                isDisabled={Object.keys(validSchema).length != 0 && conversion.length != 0 ? false : true}>
                            </SBSubmitBtn>
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
                <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == LANG_HTML && convertedSchema.length != 0 ? '' : ' d-none'}`}>
                    <SBHtmlPreviewer htmlText={convertedSchema[0].schema} showPreviewer={true} conversion={(conversion.length == 1 ? conversion[0].value : conversion)}></SBHtmlPreviewer>
                </div>
                <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == LANG_MARKDOWN && convertedSchema.length != 0 ? '' : ' d-none'}`}>
                    <SBMarkdownPreviewer markdownText={convertedSchema[0].schema} showPreviewer={true}></SBMarkdownPreviewer>
                </div>
                <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == LANG_PLANTUML && convertedSchema.length != 0 ? '' : ' d-none'}`}>
                    <SBPumlPreviewer data={pumlURL} convertedSchema={convertedSchema[0].schema} conversion={(conversion.length == 1 ? conversion[0].value : conversion)}></SBPumlPreviewer>
                </div>
                <div className={`${(conversion.length == 1 ? conversion[0].value : conversion) == LANG_GRAPHVIZ && convertedSchema.length != 0 ? '' : ' d-none'}`}>
                    <SBGvPreviewer convertedSchema={convertedSchema[0].schema} conversion={(conversion.length == 1 ? conversion[0].value : conversion)}></SBGvPreviewer>
                </div>
            </div>
        </div>
    );
}
export default SchemaVisualized;