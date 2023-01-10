import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button, Input } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { getAllSchemas } from "reducers/generate";
import { setSchema } from "actions/generate";
import { loadFile } from "actions/util";
import { validateSchema } from "actions/validate";

const MessageSchema = (props: any) => {
    const { selectedFile, setSelectedFile, loadedSchema, setLoadedSchema } = props;
    const [uploadedFile, setUploadedFile] = useState('');
    const [isValidJSON, setIsValidJSON] = useState(false);
    const [isValidJADN, setIsValidJADN] = useState(false);
    const schemaOpts = useSelector(getAllSchemas);
    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedFile == "" || selectedFile == "file") {
            setLoadedSchema('');
            setUploadedFile('');
            setIsValidJSON(false);
            setIsValidJADN(false);
        } else {
            try {
                dispatch(loadFile('schemas', selectedFile))
                    .then((loadFileVal) => {
                        let schemaObj = loadFileVal.payload.data;

                        try {
                            dispatch(setSchema(schemaObj))
                        } catch (err) {
                            if (err instanceof Error) {
                                toast(`${err.message}`, { type: toast.TYPE.WARNING });
                                return;
                            }
                        }

                        setLoadedSchema(JSON.stringify(schemaObj, null, 2));
                        validateJSON(JSON.stringify(schemaObj));
                        validateJADN(JSON.stringify(schemaObj));
                    })
                    .catch((loadFileErr) => {
                        setSelectedFile('');
                        setLoadedSchema(JSON.stringify(loadFileErr.payload.data));
                    })
            } catch (err) {
                setLoadedSchema(null);
                setIsValidJADN(false);
            }
        }
    }, [selectedFile]);

    const formatJSON = (jsonToFormat: string) => {
        if (!jsonToFormat) {
            toast(`Nothing to format`, { type: toast.TYPE.ERROR });
            return;
        }

        jsonToFormat = jsonToFormat.trim();
        jsonToFormat = validateJSON(jsonToFormat, false, true);
        if (jsonToFormat) {
            try {
                jsonToFormat = JSON.stringify(jsonToFormat, undefined, 2);
                setLoadedSchema(jsonToFormat);
                toast(`Data Formatted`, { type: toast.TYPE.SUCCESS });
            } catch (err: any) {
                toast(`Unable to Format: ${err.message}`, { type: toast.TYPE.ERROR });
            }
        } else {
            toast(`Unable to Format`, { type: toast.TYPE.ERROR });
        }
    }

    const validateJSON = (jsonToValidate: any, onErrorReturnOrig?: boolean, showErrorPopup?: boolean) => {
        let jsonObj = null;

        if (!jsonToValidate) {
            setIsValidJSON(false);
            setIsValidJADN(false);
            toast(`No data found`, { type: toast.TYPE.ERROR });
            return jsonObj;
        }

        try {
            jsonObj = JSON.parse(jsonToValidate);
            setIsValidJSON(true);
        } catch (err: any) {
            setIsValidJSON(false);
            setIsValidJADN(false);
            if (showErrorPopup) {
                toast(`Invalid Format: ${err.message}`, { type: toast.TYPE.ERROR });
            }
        }

        if (onErrorReturnOrig && !jsonObj) {
            jsonObj = jsonToValidate
        }

        return jsonObj;
    }

    const validateJADN = (jsonToValidate: any) => {
        setIsValidJADN(false);
        try {
            dispatch(validateSchema(jsonToValidate))
                .then((validateSchemaVal) => {
                    toast(`${validateSchemaVal.payload.valid_msg}`, { type: toast.TYPE[validateSchemaVal.payload.valid_bool ? 'SUCCESS' : 'ERROR'] })
                    if (validateSchemaVal.payload.valid_bool) {
                        setIsValidJADN(true);
                    }
                })
                .catch((validateSchemaErr) => { toast(`${validateSchemaErr.payload.valid_msg}`, { type: toast.TYPE.ERROR }) })
        } catch (err) {
            if (err instanceof Error) {
                toast(`${err.message}`, { type: toast.TYPE.ERROR });
            }
        }
    }

    const onFormatClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
        formatJSON(loadedSchema);
    }

    const onSchemaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoadedSchema(e.target.value);
        validateJSON(e.target.value);
    }

    const onValidateJADNClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
        let jsonObj = validateJSON(loadedSchema);
        if (!jsonObj) {
            return;
        }

        validateJADN(jsonObj);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            setUploadedFile(file.name);
            //read file
            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target) {
                    let data = ev.target.result;
                    try {
                        setLoadedSchema(JSON.stringify(data, null, 2)); // must turn str into obj before str
                    } catch (err) {
                        toast(`File cannot be loaded`, { type: toast.TYPE.WARNING });
                    }
                }
            };
            fileReader.readAsText(file);
        }
    }

    return (
        <fieldset className="p-0">
            <legend>JADN Schema</legend>
            <div className="card">
                <div className="card-body p-0" style={{ height: '40em' }}>
                    <Input
                        type="textarea"
                        onChange={onSchemaChange}
                        value={loadedSchema}
                        className='form-control'
                        placeholder='Schema to be converted'
                        style={{
                            resize: 'none',
                            outline: 'none',
                            width: '100%',
                            padding: '10px',
                            border: 'none',
                            height: '100%'
                        }}
                    />
                </div>

                <div className="card-footer p-2" style={{ height: '5em' }}>
                    <Button
                        id='validateJADNButton'
                        className="float-right"
                        color='success'
                        onClick={onValidateJADNClick}>Validate JADN</Button>
                    <Button
                        id='formatButton'
                        className="float-right mr-2"
                        color='info'
                        onClick={onFormatClick}
                        title='Converts quotes to double quotes, adds curly brackets if missing, removes orphaned commas and formats.'>Format</Button>

                    <div className="form-row">
                        <div className="input-group col-md-5 px-1 mb-0">
                            <select id="schema-list" name="schema-list" className="form-control mb-0" value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
                                <option value="">Schema</option>
                                <optgroup label="Testers">
                                    {schemaOpts.map((s: any) => <option key={s} value={s} >{s}</option>)}
                                </optgroup>
                                <optgroup label="Custom">
                                    <option value="file">File...</option>
                                </optgroup>
                            </select>
                        </div>

                        <div id="schema-file-group" className={`form-group col-md-6 px-1 mb-0${selectedFile == 'file' ? '' : ' d-none'}`} >
                            <Input type="file" id="schema-file" name="schema-file" className="px-1 py-1" accept=".jadn" value={uploadedFile} onChange={handleFileChange} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <span className="badge badge-light mx-1">Valid JSON {isValidJSON ? (
                                <span className="badge badge-success">
                                    <FontAwesomeIcon icon={faCheck} />
                                </span>
                            ) : (
                                <span className="badge badge-danger">
                                    <FontAwesomeIcon icon={faXmark} />
                                </span>
                            )}</span>
                            <span className="badge badge-light">Valid JADN {isValidJADN ? (
                                <span className="badge badge-success">
                                    <FontAwesomeIcon icon={faCheck} />
                                </span>
                            ) : (
                                <span className="badge badge-danger">
                                    <FontAwesomeIcon icon={faXmark} />
                                </span>
                            )}</span>
                        </div>
                    </div>

                </div>
            </div>
        </fieldset>)
}
export default MessageSchema;