import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Input } from "reactstrap";
import { getAllSchemasList } from "reducers/util";
import { sbToastError } from "./SBToast";
import { faExclamationCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { info, loadFile } from "actions/util";

const SBMultiSchemaLoader = (props: any) => {
    const dispatch = useDispatch();
    const { data, setData } = props;

    const schemaOpts = useSelector(getAllSchemasList);
    useEffect(() => {
        dispatch(info());
    }, [dispatch])


    //onFileUpload : upload file(s) to uploaded file list
    const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length != 0) {
            const chosenFiles = Array.prototype.slice.call(e.target.files);
            const uploadedFiles = [...data];
            chosenFiles.forEach((file) => {
                const fileReader = new FileReader();
                fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                    if (ev.target) {
                        let dataStr = ev.target.result;
                        try {
                            let dataObj = JSON.parse(dataStr);
                            uploadedFiles.push({ 'name': file['name'], 'type': 'schemas', 'data': dataObj });
                            setData(uploadedFiles);
                        } catch (err) {
                            sbToastError(`File cannot be loaded: Invalid JSON`);
                        }
                    }
                };
                fileReader.readAsText(file);
            });
        }
    }

    //onFileCheck : add selected file from prepopulated list to uploaded file list
    const onFileCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = [...data];

        if (e.target.checked) {
            dispatch(loadFile('schemas', e.target.value))
                .then((loadFileVal) => {
                    if (loadFileVal.error) {
                        sbToastError(loadFileVal.payload.response);
                        return;
                    }
                    const file = loadFileVal.payload;
                    selectedFiles.push(file);
                    setData(selectedFiles)
                })
                .catch((loadFileErr) => { sbToastError(loadFileErr.payload.data); })
        } else {
            //remove file if not selected
            const index = selectedFiles.indexOf(e.target.value);
            selectedFiles.splice(index, 1);
            setData(selectedFiles);
        }
    }

    //removeFile : remove selected uploaded file
    const removeFile = (index: number, filename: string) => {
        //uncheck box 
        var inputElem = document.getElementsByTagName('input');
        for (var i = 0; i < inputElem.length; i++) {
            if (inputElem[i].type == 'checkbox') {
                if (inputElem[i].name == 'schema-files' && inputElem[i].id == filename) {
                    inputElem[i].checked = false;
                }
            }
        }
        setData(data.filter((_file: File, fileIndex: number) => fileIndex !== index));
    }

    //removeAll : remove all uploaded files
    const removeAll = () => {
        setData([]);
        //clear checkboxes
        var inputElem = document.getElementsByTagName('input');
        for (var i = 0; i < inputElem.length; i++) {
            if (inputElem[i].type == 'checkbox') {
                if (inputElem[i].name == 'schema-files') {
                    inputElem[i].checked = false;
                }
            }
        }
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <Input type="file" id="schema-files" name="schema-files" accept=".jadn" onChange={onFileUpload} multiple hidden />
                <Button color="primary" id="triggerFileLoader" className="btn-sm mr-1 float-right" onClick={() => document.getElementById('schema-files')?.click()}> Upload Files </Button>
            </div>
            <div className="card-body p-0" style={{ height: '40em' }}>
                <h5 className="p-2"> Pre-populated List of Files to Choose from </h5>
                <div id="prepopulated-schema-list" className='m-2 p-2' style={{ overflowY: 'auto', borderStyle: 'ridge', borderWidth: 'thin' }}>
                    <div style={{ height: '5em' }}>
                        <ul style={{ listStyleType: 'none' }}>
                            {schemaOpts.map((s: any, index: number) => (
                                <li key={index}>
                                    <input type='checkbox' id={s} value={s} name='schema-files'
                                        onChange={onFileCheck} />
                                    <label htmlFor={s} className='ml-2'> {s} </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="uploaded-files-list">
                    <div>
                        <Button id='removeAll' color="danger" className='btn-sm float-right mr-1' onClick={removeAll}>
                            Remove all
                        </Button>
                        <h5 className="p-2"> Uploaded Files </h5>
                    </div>
                    <div style={{ height: '20em' }}>
                        <ul className="list-group">
                            {data.map((file: any, index: number) => (
                                <li className="list-group-item" key={index}>
                                    {file.name} {file.data == 'err' ? <FontAwesomeIcon style={{ color: 'red' }} title={'Invalid JADN. Please remove or fix schema.'} icon={faExclamationCircle}></FontAwesomeIcon> : ''}
                                    <Button id='removeFile' color="danger" className='btn-sm float-right' onClick={() => removeFile(index, file.name)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    )
}
export default SBMultiSchemaLoader;