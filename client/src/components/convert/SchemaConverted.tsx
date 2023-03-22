import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileDownload, faFilePdf, faWindowMaximize, faTableColumns, faFileImage } from "@fortawesome/free-solid-svg-icons";
import { getConversions } from "reducers/convert";
import { sbToastError } from "components/common/SBToast";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import { markdownToHTML } from "components/common/SBMarkdownConverter";
import SBHtmlPreviewer from "components/common/SBHtmlPreviewer";
import SBMarkdownPreviewer from "components/common/SBMarkdownPreviewer";
import SBPumlPreviewer, { convertToPuml } from "components/common/SBPumlPreviewer";
import { isNull } from "lodash";
import { useLocation } from "react-router-dom";
import { saveAs } from 'file-saver';
import * as d3 from "d3-graphviz";

const validConversions = ['GraphViz', 'HTML', 'JIDL', 'MarkDown', 'PlantUML'];

const SchemaConverted = (props: any) => {
    const location = useLocation();
    const { navConvertTo } = location.state;

    const { loadedSchema, conversion, setConversion, convertedSchema, setConvertedSchema, spiltViewFlag, setSplitViewFlag } = props;
    const [pumlURL, setPumlURL] = useState('');

    useEffect(() => {
        if (!isNull(navConvertTo)) {
            setConversion(navConvertTo);
        }
    }, []);

    useEffect(() => {
        if (conversion == 'puml') {
            setPumlURL(convertToPuml(convertedSchema));
        }
        if (conversion == 'gv') {
            d3.graphviz("#gv")
                .fit(true)
                .height(320)
                .width(920)
                .zoomScaleExtent([1, 10])
                .renderDot(convertedSchema);
        }
    }, [convertedSchema]);


    const handleConversion = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setConversion(e.target.value);
        setConvertedSchema('');
        setSplitViewFlag(false);
    }

    const onDownloadSchemaClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (convertedSchema != '') {
            try {
                const data = convertedSchema;
                const fmt = conversion;
                const filename = `schema.${fmt}`;

                const blob = new Blob([data], { type: "application/json" });
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
        } else {
            sbToastError(`No Converted Schema Exists`);
        }
    }

    const onDownloadPDFClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const data = JSON.parse(loadedSchema)
        if (convertedSchema != '') {
            try {
                fetch('/api/convert/pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        schema: data
                    })
                }).then(
                    rsp => rsp.blob()
                ).then(blob => {
                    const elem = document.createElement('a');
                    elem.href = URL.createObjectURL(blob);
                    elem.download = "schema.pdf";
                    document.body.appendChild(elem);
                    elem.click();

                    elem.remove();
                    URL.revokeObjectURL(elem.href);
                }).catch(err => {
                    console.log(err);
                });

            } catch (err) {
                console.log(err);
                sbToastError(`PDF cannot be downloaded`);
            }
        } else {
            sbToastError(`No Converted Schema Exists`);
        }
    }

    const onDownloadPNGClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        saveAs(pumlURL, 'puml.png');
    }

    const onHTMLPopOutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const blob = new Blob([convertedSchema], { type: "text/html" });
        const data = URL.createObjectURL(blob);
        window.open(data);
    }

    const onMDPopOutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const htmlContent = markdownToHTML(convertedSchema);
        const blob = new Blob([htmlContent], { type: "text/html" });
        const data = URL.createObjectURL(blob);
        window.open(data);
    }

    const onGVPopOutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
    }

    const toggleSplitView = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSplitViewFlag(splitView => !splitView);
    }

    const onDiagramReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        d3.graphviz("#gv").resetZoom();
    }

    const data = useSelector(getConversions);
    let convertOpts = {};
    for (let i = 0; i < Object.keys(data).length; i++) {
        if (validConversions.includes(Object.keys(data)[i])) {
            convertOpts[Object.keys(data)[i]] = Object.values(data)[i];
        }
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-3'>
                        <select id="convert-to" name="convert-to" className="form-control form-control-sm" value={conversion} onChange={handleConversion}>
                            <option value=""> Convert To... </option>
                            {Object.entries(convertOpts).map(([d, c]) => <option key={d} value={c}> {d} </option>)}
                        </select>
                    </div>
                    <div className='col-md-9'>
                        <SBCopyToClipboard buttonId='copyConvertedSchema' data={convertedSchema} customClass='float-right' />
                        <Button id='schemaDownload' title="Download converted schema" color="info" className={`btn-sm mr-1 float-right${convertedSchema ? '' : ' d-none'}`} onClick={onDownloadSchemaClick}>
                            <FontAwesomeIcon icon={faFileDownload} />
                        </Button>

                        <div className={`${conversion == 'html' && convertedSchema ? '' : ' d-none'}`}>
                            <Button id="htmlPdfDownload" title="Download PDF of the schema" color="info" className="btn-sm mr-1 float-right" onClick={onDownloadPDFClick}>
                                <FontAwesomeIcon icon={faFilePdf} />
                            </Button>
                            <Button id="htmlPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={onHTMLPopOutClick}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </Button>
                            <Button id="htmlSplitView" title="View Schema and Preview together" color="info" className="btn-sm mr-1 float-right" onClick={toggleSplitView}>
                                <FontAwesomeIcon icon={faTableColumns} className='fa-rotate-90' />
                            </Button>
                        </div>

                        <div className={`${conversion == 'md' && convertedSchema ? '' : ' d-none'}`}>
                            <Button id="mdPdfDownload" title="Download PDF of the schema" color="info" className="btn-sm mr-1 float-right" onClick={onDownloadPDFClick}>
                                <FontAwesomeIcon icon={faFilePdf} />
                            </Button>
                            <Button id="mdPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={onMDPopOutClick}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </Button>
                            <Button id="mdSplitView" title="View Schema and Preview together" color="info" className="btn-sm mr-1 float-right" onClick={toggleSplitView}>
                                <FontAwesomeIcon icon={faTableColumns} className='fa-rotate-90' />
                            </Button>
                        </div>

                        <div className={`${conversion == 'puml' && convertedSchema ? '' : ' d-none'}`}>
                            <Button id="pumlPngDownload" title="Download PNG of the schema" color="info" className="btn-sm mr-1 float-right" onClick={onDownloadPNGClick}>
                                <FontAwesomeIcon icon={faFileImage} />
                            </Button>
                            <Button id="pumlPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" target="_blank" href={pumlURL}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </Button>
                            <Button id="pumlSplitView" title="View Schema and Preview together" color="info" className="btn-sm mr-1 float-right" onClick={toggleSplitView}>
                                <FontAwesomeIcon icon={faTableColumns} className='fa-rotate-90' />
                            </Button>
                        </div>

                        <div className={`${conversion == 'gv' && convertedSchema ? '' : ' d-none'}`}>
                            {/*    <Button id="gvPngDownload" title="Download PNG of the schema" color="info" className="btn-sm mr-1 float-right" onClick={onDownloadSVGClick}>
                                <FontAwesomeIcon icon={faFileImage} />
                            </Button> */}
                            <Button id="gvPopOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={onGVPopOutClick}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </Button>
                            <Button id="gvSplitView" title="View Schema and Preview together" color="info" className="btn-sm mr-1 float-right" onClick={toggleSplitView}>
                                <FontAwesomeIcon icon={faTableColumns} className='fa-rotate-90' />
                            </Button>
                        </div>

                        <div>
                            <Button color="success" type="submit" id="convertSchema" className="btn-sm mr-1 float-right"
                                disabled={loadedSchema && conversion ? false : true}
                                title={!loadedSchema && !conversion ? "Please select schema and language for conversion" :
                                    !loadedSchema && conversion ? "Please select a schema" :
                                        loadedSchema && !conversion ? 'Please select a language to convert to' :
                                            loadedSchema && conversion ? "Convert the given JADN schema to the selected format" : "Convert the given JADN schema to the selected format"}>

                                Convert
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`card-body p-0 ${(conversion == 'html' || conversion == 'md' || conversion == 'puml' || conversion == 'gv') && spiltViewFlag ? 'd-none' : ''}`}>
                <SBEditor data={convertedSchema} isReadOnly={true} convertTo={conversion} height="40em"></SBEditor>
            </div>
            <div className={`card-body p-0 ${(conversion == 'html' || conversion == 'md' || conversion == 'puml' || conversion == 'gv') && spiltViewFlag ? '' : ' d-none'}`}>
                <SBEditor data={convertedSchema} isReadOnly={true} convertTo={conversion} height="20em"></SBEditor>

                <div className={`${conversion == 'html' && convertedSchema && spiltViewFlag ? '' : ' d-none'}`}>
                    <SBHtmlPreviewer htmlText={convertedSchema} showPreviewer={true} height="20em"></SBHtmlPreviewer>
                </div>
                <div className={`${conversion == 'md' && convertedSchema && spiltViewFlag ? '' : ' d-none'}`}>
                    <SBMarkdownPreviewer markdownText={convertedSchema} showPreviewer={true} height="20em"></SBMarkdownPreviewer>
                </div>
                <div className={`${conversion == 'puml' && convertedSchema && spiltViewFlag ? '' : ' d-none'}`}>
                    <SBPumlPreviewer data={pumlURL} height="20em"></SBPumlPreviewer>
                </div>
                <div className={`${conversion == 'gv' && convertedSchema && spiltViewFlag ? '' : ' d-none'}`}>
                    <Button id="diagramReset" color="info" className="btn-sm m-1" style={{ zIndex: '1', position: 'absolute' }} onClick={onDiagramReset}>reset</Button>
                    <div id="gv" style={{ height: '20em', textAlign: 'center', zIndex: '0' }}>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default SchemaConverted;