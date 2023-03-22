import React, { useEffect, useState } from 'react'
import { TabContent, TabPane, Button, ListGroup, Nav, NavItem, NavLink, ListGroupItem, Input } from 'reactstrap'
import { Draggable, Droppable } from 'react-drag-and-drop';
import { Info, Types } from './structure/structure';
import { loadFile, setSchema } from 'actions/util';
import { useDispatch, useSelector } from 'react-redux';
import { faFileDownload, faGripLines, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sbToastError } from 'components/common/SBToast';
import { getAllSchemas } from 'reducers/util';
import SBCopyToClipboard from 'components/common/SBCopyToClipboard';
import { format } from 'actions/format';
import SBEditor from 'components/common/SBEditor';

const SchemaCreator = (props: any) => {
    const dispatch = useDispatch();
    const { selectedFile, setSelectedFile, generatedSchema, setGeneratedSchema } = props;

    const [data, setData] = useState('');
    const [activeView, setActiveView] = useState('creator');
    const [activeOpt, setActiveOpt] = useState('info');
    const schemaOpts = useSelector(getAllSchemas);

    useEffect(() => {
        const schemaStr = JSON.stringify(generatedSchema);
        dispatch(setSchema(generatedSchema));
        dispatch(format(schemaStr))
            .then(val => {
                setData(val.payload.schema)
            });
    }, [generatedSchema])

    const onFileSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFile(e.target.value);
        if (e.target.value == "file") {
            setGeneratedSchema({
                types: []
            });
            setData('');
            dispatch(setSchema({ types: [] }));
        } else {
            try {
                dispatch(loadFile('schemas', e.target.value))
                    .then((loadFileVal) => {
                        try {
                            let schemaObj = loadFileVal.payload.data;
                            setGeneratedSchema(schemaObj);
                        } catch (err) {
                            if (err instanceof Error) {
                                sbToastError(err.message);
                                return;
                            }
                        }
                    })
                    .catch((loadFileErr) => {
                        console.log(loadFileErr);
                    })
            } catch (err) {
                console.log(err);
            }
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target) {
                    let data = ev.target.result;
                    try {
                        setGeneratedSchema(JSON.parse(data));
                    } catch (err) {
                        console.log(err);
                        sbToastError(`Schema cannot be loaded`);
                    }
                }
            };
            fileReader.readAsText(file);
        }
    }

    const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedFile('');
        setGeneratedSchema('');
        document.getElementById("schema-file").value = '';
    }

    const schemaDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            const formattedSchema = data;
            const filename = `schema.jadn`; //convert to jadn??

            const blob = new Blob([formattedSchema], { type: "application/json" });
            //content: `data:application/json;charset=utf-8,${encodeURIComponent(FormatJADN(prevState.schema))}`
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
    }

    let infoKeys;
    if (generatedSchema.info) {
        const unusedInfoKeys = Object.keys(Info).filter(k =>
            !(Object.keys(generatedSchema.info).includes(k)));

        const unusedInfo = Object.fromEntries(Object.entries(Info).filter(([key]) => unusedInfoKeys.includes(key)));

        infoKeys = Object.keys(unusedInfo).map(k => (
            <Draggable type="info" data={k} key={unusedInfo[k].key} >
                <ListGroupItem style={{ color: 'inherit', padding: '8px' }} action>{unusedInfo[k].key}
                    <FontAwesomeIcon icon={faGripLines} className='float-right' />
                </ListGroupItem>
            </Draggable>
        ));
    } else {
        infoKeys = Object.keys(Info).map(k => (
            <Draggable type="info" data={k} key={Info[k].key} >
                <ListGroupItem style={{ color: 'inherit', padding: '8px' }} action>{Info[k].key}
                    <FontAwesomeIcon icon={faGripLines} className='float-right' />
                </ListGroupItem>
            </Draggable>
        ));
    }

    const typesKeys = Object.keys(Types).map(k => (
        <Draggable type="types" data={k} key={Types[k].key}>
            <ListGroupItem style={{ color: 'inherit', padding: '8px' }} action>{Types[k].key}
                <FontAwesomeIcon icon={faGripLines} className='float-right' />
            </ListGroupItem>
        </Draggable>
    ));

    const onDrop = (data: any) => {
        if (data.info) {
            if (!(data.info in (generatedSchema.info || {}))) {
                setGeneratedSchema((generatedSchema) => ({
                    ...generatedSchema,
                    info: {
                        ...generatedSchema.info || {},
                        ...Info[data.info].edit()
                    }
                }));
            }
        } else if (data.types) {
            const tmpTypes = [...generatedSchema.types] || [];
            const tmpDef = Types[data.types].edit();
            tmpTypes.push(tmpDef);
            setGeneratedSchema(generatedSchema => ({
                ...generatedSchema,
                types: tmpTypes
            }));
        } else {
            console.log('Error: OnDrop() in client/src/components/generate/schema/SchemaCreator.tsx');
        }
    }

    const infoEditors = Object.keys(Info).map((k, i) => {
        const key = k as keyof typeof Info;
        if (generatedSchema.info && k in generatedSchema.info) {
            return Info[key].editor({
                key: i,
                value: generatedSchema.info[key],
                placeholder: k,
                change: val =>
                    setGeneratedSchema(generatedSchema => ({
                        ...generatedSchema,
                        info: {
                            ...generatedSchema.info,
                            ...Info[key].edit(val)
                        }
                    }))
                ,
                remove: (id: string) => {
                    if (generatedSchema.info && id in generatedSchema.info) {
                        const tmpInfo = { ...generatedSchema.info };
                        delete tmpInfo[id];
                        setGeneratedSchema(generatedSchema => ({
                            ...generatedSchema,
                            info: tmpInfo
                        }));
                    }
                }
            });
        }
        return null;
    }).filter(Boolean);

    const typesEditors = (generatedSchema.types || []).map((def, i) => {
        const type = def[1].toLowerCase() as keyof typeof Types;
        return Types[type].editor({
            key: i,
            value: def,
            dataIndex: i,
            change: (val, idx: number) => {
                const tmpTypes = [...generatedSchema.types];
                tmpTypes[idx] = Types[val.type.toLowerCase()].edit(val);
                setGeneratedSchema(generatedSchema => ({
                    ...generatedSchema,
                    types: tmpTypes
                }))
            }
            ,
            remove: (idx: number) => {
                if (generatedSchema.types.length >= idx) {
                    const tmpTypes = [...generatedSchema.types];
                    tmpTypes.splice(idx, 1);
                    setGeneratedSchema(generatedSchema => ({
                        ...generatedSchema,
                        types: tmpTypes
                    }));
                }
            }
        });
    }).filter(Boolean);

    return (
        <div className='card'>
            <div className='card-header p-2'>
                <div className='row no-gutters'>
                    <div className='col-md-3'>
                        <div className={`${selectedFile == 'file' ? ' d-none' : ''}`}>
                            <select id="schema-list" name="schema-list" className="form-control form-control-sm" value={selectedFile} onChange={onFileSelect}>
                                <option value="">Select a Schema...</option>
                                <optgroup label="Testers">
                                    {schemaOpts.map((s: any) => <option key={s} value={s} >{s}</option>)}
                                </optgroup>
                                <optgroup label="Custom">
                                    <option value="file">File...</option>
                                </optgroup>
                            </select>
                        </div>
                        <div className={`${selectedFile == 'file' ? '' : ' d-none'}`} style={{ display: 'inline' }}>
                            <input type="file" id="schema-file" name="schema-file" accept=".jadn" onChange={onFileChange} className='form-control-sm' />
                            <Button id="cancelFileUpload" color="secondary" size="sm" className="ml-0" onClick={onCancelFileUpload}>
                                <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
                            </Button>
                        </div>
                    </div>
                    <div className='col-md-9'>
                        <SBCopyToClipboard buttonId='copyMessage' data={data} customClass='float-right' />
                        <Button id='schemaDownload' title="Download generated schema" color="info" className='btn-sm float-right mr-1' onClick={schemaDownload}>
                            <FontAwesomeIcon icon={faFileDownload} />
                        </Button>
                        <Button onClick={() => setActiveView('schema')} className={`float-right btn-sm mr-1 ${activeView == 'schema' ? ' d-none' : ''}`} color="info">View Schema</Button>
                        <Button onClick={() => setActiveView('creator')} className={`float-right btn-sm mr-1 ${activeView == 'creator' ? ' d-none' : ''}`} color="info">View Creator</Button>
                    </div>
                </div>
            </div>
            <TabContent activeTab={activeView}>
                <TabPane tabId='creator'>
                    <div className='card-body p-0' style={{ height: '40em', overflowY: 'auto' }}>
                        <div className='row no-gutters'>
                            <div id="schema-options" className='col-sm-3'>
                                <Nav pills>
                                    <NavItem>
                                        <NavLink
                                            className={activeOpt == 'info' ? ' active' : ''}
                                            onClick={() => setActiveOpt('info')}
                                            title="meta data (about a schema package)"
                                        >
                                            Info
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={activeOpt == 'types' ? ' active' : ''}
                                            onClick={() => setActiveOpt('types')}
                                            title="schema content (the information model)"
                                        >
                                            Types
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                <TabContent activeTab={activeOpt}>
                                    <TabPane tabId='info'>
                                        <ListGroup>
                                            {infoKeys.length != 0 ? infoKeys : <div className='col'>No more Info to add</div>}
                                        </ListGroup>
                                    </TabPane>
                                    <TabPane tabId='types'>
                                        <ListGroup>
                                            {typesKeys}
                                        </ListGroup>
                                    </TabPane>
                                </TabContent>
                            </div>
                            <div id="schema-editor" className='col-md-9'>
                                <Droppable
                                    types={['info', 'types']} // <= allowed drop types
                                    onDrop={onDrop}
                                    className='col-12 mt-1'
                                    style={{
                                        minHeight: '20em',
                                    }}
                                >
                                    <div className="col pt-2">
                                        <h5>Info <small style={{ fontSize: '10px' }} className="text-muted"> metadata </small></h5>
                                        {infoEditors}
                                    </div>
                                    <hr />
                                    <div className="col">
                                        <h5>Types <small style={{ fontSize: '10px' }} className="text-muted"> schema content </small></h5>
                                        {typesEditors}
                                    </div>
                                </Droppable>
                            </div>
                        </div>
                    </div>
                </TabPane>

                <TabPane tabId='schema'>
                    <div className='card-body p-0' style={{ height: '40em', overflowY: 'auto' }}>
                        <SBEditor data={data} isReadOnly={true}></SBEditor>
                    </div>

                </TabPane>
            </TabContent >
        </div>
    )
}
export default SchemaCreator 