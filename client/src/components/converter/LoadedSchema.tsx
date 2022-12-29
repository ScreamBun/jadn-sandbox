import { loadFile } from "actions/util";
import React, { useEffect, useState } from "react";
import JSONInput from "react-json-editor";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button, Input } from "reactstrap";
import { getFiles } from "reducers/convert";
import { validateSchema } from "actions/validate";
import { loadURL, validURL } from "components/utils";

const LoadedSchema = (props: any) => {
    const { selectedFile, setSelectedFile, loadedSchema, setLoadedSchema } = props;
    const [urlString, setURLString] = useState('');
    const [uploadedFile, setUploadedFile] = useState('')
    const schemaOpts = useSelector(getFiles);
    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedFile == "") {
            setLoadedSchema({ placeholder: 'Paste JADN schema here' })
        } else if (selectedFile == "file") {
            setLoadedSchema({ placeholder: 'Paste JADN schema here' })
            setUploadedFile('');
        } else if (selectedFile == "url") {
            setLoadedSchema({ placeholder: 'Paste JADN schema here' })
            setURLString('');
        } else {
            try {
                dispatch(loadFile('schemas', selectedFile))
                    .then((onLoadFileSuccess) => { setLoadedSchema(onLoadFileSuccess.payload.data) })
                    .catch((onLoadFileFail) => { setLoadedSchema(onLoadFileFail.payload.data) })
            } catch (err) {
                setLoadedSchema({ placeholder: 'ERROR: file not found' })
            }
        }
    }, [selectedFile]);

    const handleValidationOnClick = (e: any) => {
        e.preventDefault();
        let schemaObj = loadedSchema;
        if (typeof schemaObj == 'string') {
            try {
                schemaObj = JSON.parse(loadedSchema);
            } catch (err) {
                toast(<p>{err}</p>, { type: toast.TYPE.WARNING });
                return;
            }
        }

        try {
            dispatch(validateSchema(schemaObj))
                .then((onValidateSuccess) => { toast(<p>{onValidateSuccess.payload.valid_msg}</p>, { type: toast.TYPE[onValidateSuccess.payload.valid_bool ? 'INFO' : 'WARNING'] }) })
                .catch((onValidateFail) => { toast(<p>{onValidateFail.payload.valid_msg}</p>, { type: toast.TYPE.WARNING }) })
        } catch (err) {
            toast(<p>{err}</p>, { type: toast.TYPE.WARNING });
            return;
        }
    }

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        setUploadedFile(file.name);
        //read file
        const fileReader = new FileReader();
        fileReader.onload = (ev: ProgressEvent<FileReader>) => {
            let data = ev.target.result;
            try {
                //data = JSON.parse(data);
                data = JSON.stringify(data, null, 2); //must turn str into obj before str
            } catch (err) {
                toast(<p>File cannot be loaded</p>, { type: toast.TYPE.WARNING });
            }
            setLoadedSchema({ data });
        };
        fileReader.readAsText(file);
    }

    const handleURLonChange = (e: any) => {
        setLoadedSchema({ placeholder: 'Please input URL' });
        setURLString(e.target.value);
    }

    const handleURLonClick = (e: any) => {
        e.preventDefault();

        //validate URL
        if (!validURL(urlString)) {
            toast(<p>ERROR: Invalid URL, cannot load from a non valid location</p>, { type: toast.TYPE.WARNING });
            return;
        }

        const file = urlString.substring(urlString.lastIndexOf('/') + 1);
        const fileExt = file.substring(file.lastIndexOf('.') + 1);

        if (!['json', 'jadn'].includes(fileExt)) {
            toast(<p>This file cannot be loaded as a schema, only JADN/JSON files are valid</p>, { type: toast.TYPE.WARNING });
            return;
        }

        //load URL
        loadURL(urlString)
            .then((data) => {
                const d = data as Record<string, any>;
                setLoadedSchema(d.data)
            })
            .catch(_err => {
                toast(<p>ERROR: Invalid URL</p>, { type: toast.TYPE.WARNING });
            });
    }

    return (
        <fieldset className="col-6 p-0 float-left">
            <legend>JADN Schema</legend>
            <div className="card">
                <div className="form-control border card-body p-0" style={{ height: '40em' }}>
                    <JSONInput
                        id='jadn_schema'
                        placeholder={loadedSchema}
                        theme='light_mitsuketa_tribute'
                        reset={false}
                        height='100%'
                        width='100%'
                    />
                </div>

                <div className="card-footer pb-3">
                    <Button color='info' className='float-right' onClick={handleValidationOnClick}>Verify</Button>
                    <div className="form-row">

                        <div className="input-group col-md-5 px-1 mb-0">
                            <select id="schema-list" name="schema-list" className="form-control mb-0" defaultValue={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
                                <option value="">Schema</option>
                                <optgroup label="Testers">
                                    {schemaOpts.map((s: any) => <option key={s} value={s} >{s}</option>)}
                                </optgroup>
                                <optgroup label="Custom">
                                    <option value="file">File...</option>
                                    <option value="url">URL...</option>
                                </optgroup>
                            </select>
                        </div>

                        <div id="schema-file-group" className={`form-group col-md-6 px-1 mb-0${selectedFile == 'file' ? '' : ' d-none'}`} >
                            <Input type="file" id="schema-file" name="schema-file" accept=".jadn" defaultValue={uploadedFile} onChange={handleFileChange} />
                        </div>

                        <div id="schema-url-group" className={`form-group col-md-6 px-1 mb-0${selectedFile == 'url' ? '' : ' d-none'}`}>
                            <div className="input-group">
                                <Input type="url" id="schema-url" name="schema-url" value={urlString} onChange={handleURLonChange} />
                                <div className="input-group-prepend">
                                    <Button outline color="secondary" onClick={handleURLonClick}>Load URL</Button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div className="col-12 m-1" />
        </fieldset>)
}
export default LoadedSchema;