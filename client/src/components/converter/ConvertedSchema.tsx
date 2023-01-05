import { faFileDownload, faFilePdf, faWindowMaximize } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { getConversions } from "reducers/convert";

const ConvertedSchema = (props: any) => {
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

    const schemaDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
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
                toast(`File cannot be downloaded`, { type: toast.TYPE.WARNING });
            }
        } else {
            toast(`No Converted Schema Exists`, { type: toast.TYPE.WARNING });
        }
    }

    const pdfDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (convertedSchema != '') {
            try {
                fetch('/api/convert/pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        schema: loadedSchema
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
                toast(`PDF cannot be downloaded`, { type: toast.TYPE.WARNING });
            }
        } else {
            toast(`No Converted Schema Exists`, { type: toast.TYPE.WARNING });
        }
    }

    const popOut = (e: React.MouseEvent<HTMLButtonElement>) => {
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
                        className='form-control'
                        placeholder='Converted schema'
                        style={{
                            resize: 'none',
                            outline: 'none',
                            width: '100%',
                            padding: '10px',
                            border: 'none',
                            height: '100%'
                        }}
                        readOnly
                    />
                </div>

                <div className='card-footer p-2'>
                    <div className={`btn-group btn-group-sm float-right mr-2${convertedSchema ? '' : ' d-none'}`}>
                        <Button id='schemaDownload' title="Download converted schema" color="info" className={`btn-sm float-right${convertedSchema ? '' : ' d-none'}`} onClick={schemaDownload}>
                            <FontAwesomeIcon icon={faFileDownload} size='2x' />
                        </Button>
                    </div>

                    <div className={`btn-group btn-group-sm float-right mr-2${conversion == 'html' && convertedSchema ? '' : ' d-none'}`}>
                        <Button id="pdfDownload" title="Download PDF of the schema" color="info" onClick={pdfDownload}>
                            <FontAwesomeIcon icon={faFilePdf} size='2x' />
                        </Button>

                        <Button id="popOut" title="View Schema in new window" color="info" onClick={popOut}>
                            <FontAwesomeIcon icon={faWindowMaximize} size='2x' />
                        </Button>
                    </div>

                    <div className="form-row ml-1 mb-0">
                        <div className="input-group col-md-6 px-1 mb-0">
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
export default ConvertedSchema;