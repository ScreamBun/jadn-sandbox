import React from "react";
import { useSelector } from "react-redux";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faFileDownload, faFilePdf, faWindowMaximize } from "@fortawesome/free-solid-svg-icons";
import { getConversions } from "reducers/convert";
import { sbToastError, sbToastSuccess } from "components/common/SBToast";
import CopyToClipboard from "components/common/CopyToClipboard";

const SchemaConverted = (props: any) => {
    const { loadedSchema, conversion, setConversion, convertedSchema, setConvertedSchema } = props;
    const convertOpts = useSelector(getConversions);

    const handleConversion = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setConversion(e.target.value);
        setConvertedSchema('');
    }

    /*    type MimeType = 'cddl' | 'html' | 'jadn' | 'json' | 'md' | 'proto3' | 'rng' | 'thrift';
         const downloadMime = {
            cddl: 'text/plain',
            html: 'text/html',
            md: 'text/plain',
            jadn: 'application/json',
            json: 'application/json',
            proto3: 'text/x-c',
            rng: 'application/xml',
            thrift: 'text/plain'
        }; */

    const onCopyToClipboardClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
        navigator.clipboard.writeText(loadedSchema);
        sbToastSuccess(`Copied to clipboard`);
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

    const onPopOutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const blob = new Blob([convertedSchema], { type: "text/html" });
        const data = URL.createObjectURL(blob);
        window.open(data);
    }

    return (
        <fieldset className="p-0">
            <legend>Converted Schema</legend>
            <div className="card">
                <div className="card-body p-0" style={{ height: '40em' }}>
                    <textarea
                        value={convertedSchema}
                        className='form-control form-control-sm'
                        placeholder='Converted schema'
                        style={{
                            resize: 'none',
                            outline: 'none',
                            width: '100%',
                            padding: '10px',
                            border: 'none',
                            height: '100%',
                            whiteSpace: 'pre',
                            overflowWrap: 'normal',
                            overflowX: 'auto'
                        }}
                        readOnly
                    />
                </div>

                <div className='card-footer p-1'>

                    <CopyToClipboard buttonId='copyConvertedSchema' data={convertedSchema} customClass='float-right' />

                    <div className={`btn-group btn-group-sm float-right ${convertedSchema ? '' : ' d-none'}`}>
                        <Button id='schemaDownload' title="Download converted schema" color="info" className={`btn-sm float-right${convertedSchema ? '' : ' d-none'}`} onClick={onDownloadSchemaClick}>
                            <FontAwesomeIcon icon={faFileDownload} />
                        </Button>
                    </div>

                    <div className={`${conversion == 'html' && convertedSchema ? '' : ' d-none'}`}>
                        <Button id="pdfDownload" title="Download PDF of the schema" color="info" className="btn-sm mr-1 float-right" onClick={onDownloadPDFClick}>
                            <FontAwesomeIcon icon={faFilePdf} />
                        </Button>
                        <Button id="popOut" title="View Schema in new window" color="info" className="btn-sm mr-1 float-right" onClick={onPopOutClick}>
                            <FontAwesomeIcon icon={faWindowMaximize} />
                        </Button>
                    </div>

                    <div className="form-row">
                        <div className="input-group  input-group-sm col-md-6 px-1">
                            <select id="convert-to" name="convert-to" className="form-control" value={conversion} onChange={handleConversion}>
                                <option value=""> Convert To... </option>
                                {Object.entries(convertOpts).map(([d, c]) => <option key={d} value={c}> {d} </option>)}
                            </select>
                            <div className="input-group-append">
                                <Button color="success" type="submit" id="convertSchema" title="Convert the given JADN schema to the selected format">Convert</Button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </fieldset>)
}
export default SchemaConverted;