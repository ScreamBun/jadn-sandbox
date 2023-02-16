import React from "react";
import { useSelector } from "react-redux";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileDownload, faFilePdf, faWindowMaximize } from "@fortawesome/free-solid-svg-icons";
import { getConversions } from "reducers/convert";
import { sbToastError } from "components/common/SBToast";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";

const SchemaConverted = (props: any) => {
    const { loadedSchema, conversion, setConversion, convertedSchema, setConvertedSchema } = props;
    const convertOpts = useSelector(getConversions);

    const handleConversion = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setConversion(e.target.value);
        setConvertedSchema('');
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

    const onDownloadSchemaClick2 = (e2: React.MouseEvent<HTMLButtonElement>) => {
        e2.preventDefault();
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

    const onDownloadPDFClick2 = (e2: React.MouseEvent<HTMLButtonElement>) => {
        e2.preventDefault();
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

    const onPopOutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const blob = new Blob([convertedSchema], { type: "text/html" });
        const data = URL.createObjectURL(blob);
        window.open(data);
    }

    const onPopOutClick2 = (e2: React.MouseEvent<HTMLButtonElement>) => {
        e2.preventDefault();
        const blob = new Blob([convertedSchema], { type: "text/markdown" });
        const data = URL.createObjectURL(blob);
        window.open(data);
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
                            <Button id="pdfDownload" title="Download PDF of the schema" color="info" className="btn-sm mr-1 float-right" onClick={onDownloadPDFClick}>
                                <FontAwesomeIcon icon={faFilePdf} />
                            </Button>
                            <Button id="popOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={onPopOutClick}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </Button>
                        </div>

                        <div className={`${conversion == 'md' && convertedSchema ? '' : ' d-none'}`}>
                            <Button id="pdfDownload" title="Download PDF of the schema" color="info" className="btn-sm mr-1 float-right" onClick={onDownloadPDFClick2}>
                                <FontAwesomeIcon icon={faFilePdf} />
                            </Button>
                            <Button id="popOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={onPopOutClick2}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </Button>
                        </div>

                        <div className={`${conversion == 'md' && convertedSchema ? '' : ' d-none'}`}>
                            <Button id="pdfDownload" title="Download PDF of the schema" color="info" className="btn-sm mr-1 float-right" onClick={onDownloadPDFClick2}>
                                <FontAwesomeIcon icon={faFilePdf} />
                            </Button>
                            <Button id="popOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={onPopOutClick2}>
                                <FontAwesomeIcon icon={faWindowMaximize} />
                            </Button>
                        </div>

                        <Button color="success" type="submit" id="convertSchema" className="btn-sm mr-1 float-right"
                            disabled={loadedSchema && conversion ? false : true}
                            title={!loadedSchema && !conversion ? "Please select schema and language for conversion" :
                                !loadedSchema && conversion ? "Please select a schema" :
                                    loadedSchema && !conversion ? 'Please select a language to convert to' :
                                        loadedSchema && conversion ? "Convert the given JADN schema to the selected format" : "Convert the given JADN schema to the selected format"}
                        >
                            Convert
                        </Button>
                    </div>
                </div>
            </div>
            <div className="card-body p-0">
                <SBEditor data={convertedSchema} setData={setConvertedSchema} isReadOnly={true} convertTo={conversion}></SBEditor>                
            </div>
        </div>
    )
}
export default SchemaConverted;