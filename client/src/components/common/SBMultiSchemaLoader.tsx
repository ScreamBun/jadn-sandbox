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
import { isString } from "components/utils/general";


interface SBMultiSchemaLoaderProps {
    onOptionChange: (options: Option[]) => void;
}

interface SelectedSchema { id: string, name: string, type: string, data: {} };

const SBMultiSchemaLoader = (props: SBMultiSchemaLoaderProps) => {
    const dispatch = useDispatch();

    // Used by SBFileUploader
    const [selectedFile, setSelectedFile] = useState<null | 'file'>(null);
    const ref = useRef<HTMLInputElement | null>(null);

    const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
    const [selectedSchemas, setSelectedSchemas] = useState<SelectedSchema[]>([]); 
    const [toggle, setToggle] = useState('');

    // Used by SBSelector, preloads with schemas selections
    const schemaOpts = useSelector(getAllSchemas);

    useEffect(() => {
        dispatch(info());
    }, [dispatch]);

    useEffect(() => {
        props.onOptionChange(selectedOptions);
    }, [selectedOptions]);

    const onToggle = (index: number) => {
        if (toggle == index.toString()) {
            setToggle('');

        } else {
            setToggle(`${index}`);
        }
    }  

    // TODO: Move to utils?
    const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("SBMultiSchemaLoader onFileUpload");
        e.preventDefault();
        if (e.target.files && e.target.files.length != 0) {
            const chosenFiles = Array.prototype.slice.call(e.target.files);
            chosenFiles.forEach((file) => {
                if (!selectedSchemas.includes(file.name)) {
                    const fileReader = new FileReader();
                    fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                        if (ev.target && ev.target.result && isString(ev.target.result)) {
                            try {
                                let dataObj = JSON.parse(ev.target.result);
                                setSelectedSchemas( 
                                [ 
                                  ...selectedSchemas, 
                                  { 'id': Date.now().toString(), 'name': file['name'], 'type': 'schemas', 'data': dataObj } 
                                ]);

                                setSelectedOptions([
                                    ...selectedOptions,
                                    { 'value' : file['name'], 'label' : file['name'] }
                                ]);   

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
        console.log("SBMultiSchemaLoader onCancelFileUpload");
        e.preventDefault();
        setSelectedFile(null);
    }

    const onSelectChange = (options: Option[]) => {
        console.log("SBMultiSchemaLoader onSelectChange");

        // If user clicks 'file upload'...
        if (options.value == 'file') {
            ref.current?.click();
            return;
        }

        if (options.length != 0) {
            options.map((option: Option, i: number) => { 
                setSelectedSchemas([
                    ...selectedSchemas,
                    { id: Date.now().toString(), 'name': option.value, 'type': 'schema', 'data': '' }
                ]);                      
            });
        } else {
            setSelectedSchemas([]);
        }

        setSelectedOptions([
            ...options
        ]);  

    }

    const onRemoveSchema = (name: string) => {
        console.log("SBMultiSchemaLoader onRemoveSchema");
        setSelectedSchemas(selectedSchemas.filter((schema) => schema.name !== name));
        setSelectedOptions(selectedOptions.filter((option) => option.value !== name));
    }

    const getSchema = (schema_name: string) => {
        console.log("SBMultiSchemaLoader getSchema name: " + schema_name);
        dispatch(loadFile('schemas', schema_name))
            .then((response) => {
                const schema_data: SelectedSchema = response.payload;
                const next_schemas = selectedSchemas.map(schema => {
                    if (schema.name === schema_name) {
                        return {
                            ...schema,
                            data: schema_data,  
                            };
                    } else {
                        return schema;
                    }
                    });
                    setSelectedSchemas(next_schemas);  // Rerender
            })
            .catch((loadFileErr) => { sbToastError(loadFileErr.payload.data); });
    }

    const listSchemas = selectedSchemas.map((schema: SelectedSchema, i: number) => {
        return (
            <div className="card" key={schema.id}>  
                <div className="card-header">
                    <h5 className="mb-0">
                        <button className={schema.data == 'err' ? `btn` : `btn btn-link`} id={`toggleMsg#${i}`} type="button" onClick={() => {
                                onToggle(i);
                                getSchema(schema.name);
                        }}>
                        {schema.name} {schema.data == 'err' ? <FontAwesomeIcon style={{ color: 'red' }} title={'Invalid JADN. Please remove or fix schema.'} icon={faExclamationCircle}></FontAwesomeIcon> : ''}
                        </button>
                        <Button id='removeFile' color="danger" className='btn-sm float-right' onClick={() => onRemoveSchema(schema.name)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </h5>
                </div>

                {toggle == `${i}` && schema.data != 'err' ?
                    <div className="card-body" key={schema.id}>
                        <SBEditor data={schema.data} isReadOnly={true} height={'35vh'}></SBEditor>
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
                                <SBSelect id={"schema-list"} 
                                    data={schemaOpts} 
                                    onChange={onSelectChange}
                                    placeholder={'Select schema...(at least one)'}
                                    loc={'schemas'}
                                    value={selectedOptions}
                                    isGrouped isFileUploader isMultiSelect/>
                            </div>
                        </div>
                        <div className={`${selectedFile == 'file' ? '' : ' d-none'}`} style={{ display: 'inline' }}>
                            <SBFileUploader ref={ref} id={"schema-file"} accept={".jadn"} onCancel={onCancelFileUpload} onChange={onFileUpload} isMultiple />
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body">
                {listSchemas}
            </div>
        </div>
    )
}
export default SBMultiSchemaLoader;