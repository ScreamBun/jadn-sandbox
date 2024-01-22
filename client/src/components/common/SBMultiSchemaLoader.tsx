import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from 'uuid';
import { faExclamationCircle, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { info, loadFile } from "actions/util";
import { getAllSchemas } from "reducers/util";
import { LANG_JADN } from "components/utils/constants";
import { isString } from "components/utils/general";
import { SelectedSchema } from "components/transform/SchemaTransformer";
import { dismissAllToast, sbToastError } from "./SBToast";
import SBEditor from "./SBEditor";
import SBSelect, { Option } from "./SBSelect";

interface SBMultiSchemaLoaderProps {
    isLoading: boolean;
    onLoading: (isLoading: boolean) => void;
    selectedSchemas: SelectedSchema[];
    onSelectedSchemaAdd: (schema: SelectedSchema) => void;
    onSelectedSchemaReplaceAll: (schemas: SelectedSchema[]) => void;
    onSelectedSchemaRemove: (schema_to_remove: string) => void;
}

const SBMultiSchemaLoader = forwardRef((props: SBMultiSchemaLoaderProps, ref) => {
    const {
        onLoading,
        selectedSchemas,
        onSelectedSchemaAdd,
        onSelectedSchemaReplaceAll,
        onSelectedSchemaRemove } = props;

    const dispatch = useDispatch();

    // Used by SBFileUploader
    const [selectedFile, setSelectedFile] = useState<null | 'file'>(null);
    const sbFileUploaderRef = useRef<HTMLInputElement | null>(null);

    const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
    const [toggle, setToggle] = useState<{ [key: string]: boolean }>({});

    // Used by SBSelector, preloads with schemas selections
    const schemaOpts = useSelector(getAllSchemas);

    useEffect(() => {
        dispatch(info());
    }, [dispatch]);

    // Allows parent to call child function
    useImperativeHandle(ref, () => ({
        onReset() {
            dismissAllToast();
            setToggle({});
            setSelectedFile(null);
            setSelectedOptions([]);
        },
    }));

    const onToggle = (index: number) => {
        setToggle((prev) => ({ ...prev, [index]: !prev[index] }));
    }

    const isDupSchemaName = (name: string, schemas: SelectedSchema[]) => {
        let is_dup: boolean = false;
        schemas?.map((schema: SelectedSchema) => {
            if (name == schema.name) {
                is_dup = true;
            }
        });

        return is_dup;
    }

    const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        onLoading(true);
        if (e.target.files && e.target.files.length != 0) {
            const chosenFiles = Array.prototype.slice.call(e.target.files);
            chosenFiles.forEach((file) => {
                if (!isDupSchemaName(file.name, selectedSchemas)) {
                    const fileReader = new FileReader();
                    fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                        if (ev.target && ev.target.result && isString(ev.target.result)) {
                            try {
                                let dataObj = JSON.parse(ev.target.result);

                                // Add to schemas
                                const new_schema: SelectedSchema = { 'id': uuidv4(), 'name': file['name'], 'type': 'schemas', 'data': dataObj };
                                onSelectedSchemaAdd(new_schema);

                                // Add to seleted options
                                setSelectedOptions([
                                    ...selectedOptions,
                                    { 'value': file['name'], 'label': file['name'] }
                                ]);

                            } catch (err) {
                                sbToastError(`File cannot be loaded: Invalid JSON`);
                            }
                        }
                    };
                    fileReader.readAsText(file);
                } else {
                    sbToastError(`${file.name} already exists`);
                }
            });
        }
        setSelectedFile(null);
        onLoading(false);
    }

    const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        onLoading(false);
        setSelectedFile(null);
    }

    const onGetSchemaData = (schema_name: string) => {
        return dispatch(loadFile('schemas', schema_name))
            .then((response) => {
                return response.payload.data;
            })
            .catch((loadFileErr) => { sbToastError(loadFileErr.payload.data); });
    };


    const onSelectChange = async (options: Option[]) => {
        // If user clicks 'file upload'...
        if (options.value == 'file') {
            sbFileUploaderRef.current?.click();
            return;
        }

        onSelectedSchemaRemove('');  // clear all

        let schemas_to_load: SelectedSchema[] = [];
        await Promise.all(
            options.map(async (option) => {
                const schema_data: SelectedSchema = await onGetSchemaData(option.label);
                const new_schema: SelectedSchema = { 'id': uuidv4(), 'name': option.label, 'type': 'schemas', 'data': schema_data };
                schemas_to_load.push(new_schema);
                // props.onSelectedSchemaAdd(new_schema);  // Causes a duplicate bug to appear                           
            }));

        onSelectedSchemaReplaceAll(schemas_to_load);

        setSelectedOptions([
            ...options
        ]);

    }

    const onRemoveSchema = (name: string) => {
        onSelectedSchemaRemove(name);
        setSelectedOptions(selectedOptions.filter((option) => option.value !== name));
    }

    const listSchemas = selectedSchemas?.map((schema: SelectedSchema, i: number) => {
        return (
            <div className="card" key={schema.id}>
                <div className="card-header">
                    <h5 className="mb-0 d-flex justify-content-between align-items-center">
                        <button className={schema.data == 'err' ? `btn` : `btn btn-link`} id={`toggleMsg#${i}`} type="button" onClick={() => {
                            onToggle(i);
                        }}>
                            {schema.name} {schema.data == 'err' ? <FontAwesomeIcon style={{ color: 'red' }} title={'Invalid JADN. Please remove or fix schema.'} icon={faExclamationCircle}></FontAwesomeIcon> : ''}
                        </button>
                        <button id='removeFile' type='button' className='btn btn-sm btn-danger' onClick={() => onRemoveSchema(schema.name)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </h5>
                </div>

                {toggle[i] == true && schema.data != 'err' ?
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
                                    isGrouped
                                    isFileUploader
                                    isMultiSelect
                                    isSmStyle 
                                    isClearable/>
                            </div>
                        </div>
                        <div className={`${selectedFile == 'file' ? '' : ' d-none'}`} style={{ display: 'inline' }}>
                            <input type="file" id="file-input" name="file-input" accept={LANG_JADN} onChange={onFileUpload} ref={sbFileUploaderRef} multiple={true} />
                            <button id="cancelFileUpload" type='button' className="btn btn-sm btn-secondary ms-0" onClick={() => onCancelFileUpload} style={{ display: 'inline' }}>
                                <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body-page">
                {listSchemas}
            </div>
        </div>
    )
})
export default SBMultiSchemaLoader;
