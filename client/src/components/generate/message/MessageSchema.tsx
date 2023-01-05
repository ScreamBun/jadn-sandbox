import React, { useEffect, useState } from "react";
import JSONInput from "react-json-editor";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button, Input } from "reactstrap";
import { loadFile } from "actions/util";
import { getAllSchemas } from "reducers/generate";
import { validateSchema } from "actions/validate";
import { setSchema } from "actions/generate";

const MessageSchema = (props: any) => {
    const { selectedFile, setSelectedFile, loadedSchema, setLoadedSchema } = props;
    const [uploadedFile, setUploadedFile] = useState('')
    const schemaOpts = useSelector(getAllSchemas);
    const dispatch = useDispatch();

    //load selected file
    useEffect(() => {
        if (selectedFile == "") {
            setLoadedSchema({ placeholder: 'Paste JADN schema here' });
        } else if (selectedFile == "file") {
            setLoadedSchema({ placeholder: 'Paste JADN schema here' });
            setUploadedFile('');
        } else {
            try {
                //load selected file
                dispatch(loadFile('schemas', selectedFile))
                    .then((loadFileVal) => { setLoadedSchema(loadFileVal.payload.data) })
                    .catch((loadFileErr) => { setLoadedSchema(loadFileErr.payload.data) })

            } catch (err) {
                setLoadedSchema({ placeholder: 'File not found' });
            }
        }
    }, [selectedFile]);

    //set selected file ...
    useEffect(() => {
        try {
            dispatch(setSchema(loadedSchema))
        } catch (err) {
            if (err instanceof Error) {
                toast(`${err.message}`, { type: toast.TYPE.WARNING });
                return;
            }
        }
    }, [loadedSchema])

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
                    } catch (err) {
                        toast(`File cannot be loaded`, { type: toast.TYPE.WARNING });
                    }
                    setLoadedSchema({ data });
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
                    <Button color='info' className='float-right' onClick={handleValidationOnClick}>Verify</Button>
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
export default MessageSchema;