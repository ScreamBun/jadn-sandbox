import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "reactstrap";
import { getAllSchemas } from "reducers/util";
import { sbToastError } from "./SBToast";
import { faExclamationCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { info, loadFile } from "actions/util";
import SBEditor from "./SBEditor";
import SBFileUploader from "./SBFileUploader";
import SBSelect, { Option } from "./SBSelect";

interface SBMultiSchemaLoaderProps {
    data: { 'name': string, 'type': string, 'data': object }[];
    setData: any;
    selectedFileOpts: Option[];
    setSelectedFileOpts: any;
}

const SBMultiSchemaLoader = (props: SBMultiSchemaLoaderProps) => {
    const dispatch = useDispatch();
    const { data, setData, selectedFileOpts, setSelectedFileOpts } = props;
    const [selectedFile, setSelectedFile] = useState<null | 'file'>(null);
    const [toggle, setToggle] = useState('');
    const ref = useRef<HTMLInputElement | null>(null);

    const schemaOpts = useSelector(getAllSchemas);

    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    const onToggle = (index: number) => {
        if (toggle == index.toString()) {
            setToggle('');

        } else {
            setToggle(`${index}`);
        }
    }

    //onFileUpload : upload file(s) to uploaded file list
    const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length != 0) {
            const chosenFiles = Array.prototype.slice.call(e.target.files);
            const uploadedFiles = [...data];
            chosenFiles.forEach((file) => {
                if (!uploadedFiles.includes(file.name)) {
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
                }
            });
        }
        setSelectedFile(null);
    }

    const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedFile(null);
    }

    //onFileCheck : add selected file from prepopulated list to uploaded file list
    const onFileCheck = (e: Option[] | Option) => {
        if (e.value == 'file') {
            ref.current?.click();
            return;
        }

        let selectedOpts = [];
        let tmpData: any[] = [];

        if (e.length != 0) {
            for (let i in e) {
                selectedOpts.push(e[i]);
                setSelectedFileOpts(selectedOpts);

                dispatch(loadFile('schemas', e[i].value))
                    .then((loadFileVal) => {
                        if (loadFileVal.error) {
                            sbToastError(loadFileVal.payload.response);
                            return;
                        }
                        const file = loadFileVal.payload;
                        tmpData.push(file);
                        setData(tmpData);
                    })
                    .catch((loadFileErr) => { sbToastError(loadFileErr.payload.data); })
            }
        } else {
            setSelectedFileOpts([]);
            setData([]);
        }
    }

    //removeFile : remove selected uploaded file
    const removeFile = (filename: string) => {
        setData(data.filter((file) => file.name !== filename));
        setSelectedFileOpts(selectedFileOpts.filter((opt) => opt.value != filename));
    }

    const listData = data.map((fileObj: any, i: number) => {
        return (
            <div className="card" key={i}>
                <div className="card-header">
                    <h5 className="mb-0">
                        <button className={fileObj.data == 'err' ? `btn` : `btn btn-link`} id={`toggleMsg#${i}`} type="button" onClick={() => onToggle(i)} >
                            {fileObj.name} {fileObj.data == 'err' ? <FontAwesomeIcon style={{ color: 'red' }} title={'Invalid JADN. Please remove or fix schema.'} icon={faExclamationCircle}></FontAwesomeIcon> : ''}
                        </button>
                        <Button id='removeFile' color="danger" className='btn-sm float-right' onClick={() => removeFile(fileObj.name)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </h5>
                </div>

                {toggle == `${i}` && fileObj.data != 'err' ?
                    <div className="card-body" key={i}>
                        <SBEditor data={fileObj.data} isReadOnly={true} height={'35vh'}></SBEditor>
                    </div>
                    : ''}
            </div>
        )
    })

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className="row no-gutters">
                    <div className="col-md-6">
                        <div className={`${selectedFile == 'file' ? ' d-none' : ''}`}>
                            <div className="input-group">
                                <SBSelect id={"schema-list"} data={schemaOpts} onChange={onFileCheck}
                                    placeholder={'Select schema...(at least one)'}
                                    loc={'schemas'}
                                    value={selectedFileOpts}
                                    isGrouped isFileUploader isMultiSelect isSmStyle/>
                            </div>
                        </div>
                        <div className={`${selectedFile == 'file' ? '' : ' d-none'}`} style={{ display: 'inline' }}>
                            <SBFileUploader ref={ref} id={"schema-file"} accept={".jadn"} onCancel={onCancelFileUpload} onChange={onFileUpload} isMultiple />
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body-page">
                {listData}
            </div>
        </div>
    )
}
export default SBMultiSchemaLoader;