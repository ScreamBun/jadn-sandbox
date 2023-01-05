import React, { useEffect, useState } from "react";
import JSONInput from "react-json-editor";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button, Input } from "reactstrap";
import { loadFile } from "actions/util";
import { getSchemaFiles } from "reducers/validate";
import { validateSchema } from "actions/validate";

const LoadValidSchema = (props: any) => {
    const { selectedFile, setSelectedFile, loadedSchema, setLoadedSchema, decodeMsg, setDecodeMsg, setDecodeSchemaTypes } = props;
    const [uploadedFile, setUploadedFile] = useState('');
    const schemaOpts = useSelector(getSchemaFiles);
    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedFile == "") {
            setLoadedSchema({ placeholder: 'Paste JADN schema here' });
        } else if (selectedFile == "file") {
            setLoadedSchema({ placeholder: 'Paste JADN schema here' });
            setUploadedFile('');
        } else {
            try {
                dispatch(loadFile('schemas', selectedFile)) //load schema file
                    .then((loadFileVal) => {
                        let schemaObj = loadFileVal.payload.data;
                        dispatch(validateSchema(schemaObj)) //validate schema before displaying
                            .then((validateSchemaVal) => {
                                if (validateSchemaVal.payload.valid_bool) {
                                    setLoadedSchema(schemaObj);

                                    //getDecodeTypes
                                    let decodeTypes = {
                                        all: [],
                                        exports: []
                                    };
                                    let msgDecode = '';

                                    if (schemaObj.info !== undefined) {
                                        if (schemaObj.info.exports !== undefined) {
                                            decodeTypes.exports = schemaObj.info.exports;
                                        }
                                    }
                                    if (schemaObj.types !== undefined) {
                                        decodeTypes.all = schemaObj.types.map((def: any[]) => def[0]);
                                        decodeTypes.all = decodeTypes.all.filter(dt => !decodeTypes.exports.includes(dt));
                                        decodeTypes.all.sort();
                                    }

                                    if (decodeMsg === '' || !decodeTypes.all.includes(decodeMsg)) {
                                        if (decodeTypes.exports.length >= 1) {
                                            msgDecode = decodeTypes.exports[0];
                                        } else if (decodeTypes.all.length >= 1) {
                                            msgDecode = decodeTypes.all[0];
                                        }
                                    }

                                    setDecodeSchemaTypes(decodeTypes);
                                    setDecodeMsg(msgDecode);

                                } else {
                                    toast(`${validateSchemaVal.payload.valid_msg}`, { type: toast.TYPE.WARNING });
                                    setSelectedFile('');
                                }
                            })
                            .catch((validateSchemaErr) => {
                                toast(`${validateSchemaErr.payload.valid_msg}`, { type: toast.TYPE.WARNING });
                                setSelectedFile('');
                            })
                    })
                    .catch((loadFileErr) => {
                        setSelectedFile('');
                        setLoadedSchema(loadFileErr.payload.data);
                    })
            } catch (err) {
                setLoadedSchema({ placeholder: 'File not found' });
            }
        }
    }, [selectedFile]);

    const handleValidationOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let schemaObj = loadedSchema;
        if (typeof schemaObj == 'string') {
            try {
                schemaObj = JSON.parse(loadedSchema);
            } catch (err) {
                if (err instanceof Error) {
                    toast(`${err.message}`, { type: toast.TYPE.WARNING });
                    return;
                }
            }
        }

        try {
            dispatch(validateSchema(schemaObj))
                .then((validateSchemaVal) => { toast(`${validateSchemaVal.payload.valid_msg}`, { type: toast.TYPE[validateSchemaVal.payload.valid_bool ? 'INFO' : 'WARNING'] }) })
                .catch((validateSchemaErr) => { toast(`${validateSchemaErr.payload.valid_msg}`, { type: toast.TYPE.WARNING }) })
        } catch (err) {
            if (err instanceof Error) {
                toast(`${err.message}`, { type: toast.TYPE.WARNING });
                return;
            }
        }
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
                        data = JSON.stringify(data, null, 2); // must turn str into obj before str
                        dispatch(validateSchema(data))//validate data before displaying
                            .then((validateSchemaVal) => {
                                if (validateSchemaVal.payload.valid_bool) {
                                    setLoadedSchema(data);
                                } else {
                                    toast(`${validateSchemaVal.payload.valid_msg}`, { type: toast.TYPE.WARNING });
                                    setUploadedFile('');
                                }
                            })
                            .catch((validateSchemaErr) => { toast(`${validateSchemaErr.payload.valid_msg}`, { type: toast.TYPE.WARNING }) })
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
                    <JSONInput
                        id='jadn_schema'
                        placeholder={loadedSchema}
                        theme='light_mitsuketa_tribute'
                        reset={false}
                        height='100%'
                        width='100%'
                    />
                </div>

                <div className="card-footer p-2">
                    <Button color='info' className='float-right' onClick={handleValidationOnClick} title="Validate the schema is valid prior to validating the message">Verify JADN</Button>
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
                </div>
            </div>
        </fieldset>)
}

export default LoadValidSchema