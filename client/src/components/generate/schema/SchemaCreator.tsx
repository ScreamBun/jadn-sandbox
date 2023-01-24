import React, { useEffect, useState } from 'react'
import { TabContent, TabPane, Button, ListGroup, Nav, NavItem, NavLink, ListGroupItem, Input } from 'reactstrap'
import { Draggable, Droppable } from 'react-drag-and-drop';
import JSONPretty from 'react-json-pretty';
import { Info, Types } from './structure';
import { loadFile, setSchema } from 'actions/util';
import { useDispatch, useSelector } from 'react-redux';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sbToastError } from 'components/common/SBToast';
import { SchemaJADN } from './interface';
import { getAllSchemas } from 'reducers/util';

const SchemaCreator = (props: any) => {
    const dispatch = useDispatch();
    const { selectedFile, setSelectedFile, generatedSchema, setGeneratedSchema } = props;

    //state 
    const [activeView, setActiveView] = useState('creator');
    const [activeOpt, setActiveOpt] = useState('info');
    const schemaOpts = useSelector(getAllSchemas);

    useEffect(() => {
        dispatch(setSchema(generatedSchema.jsObject as SchemaJADN));
    }, [generatedSchema])

    useEffect(() => {
        if (selectedFile == "file") {
            setGeneratedSchema('');
        } else {
            try {
                dispatch(loadFile('schemas', selectedFile))
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
                    .catch((_loadFileErr) => {
                        setGeneratedSchema('');
                    })
            } catch (err) {
                setGeneratedSchema('');
            }
        }
    }, [selectedFile]);


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

    const onDrop = (data: any) => {
        if (data.info) {
            if (!(data.info in (generatedSchema.info || {}))) {
                setGeneratedSchema({
                    ...generatedSchema,
                    info: {
                        ...generatedSchema.info || {},
                        ...Info[data.info].edit()
                    }
                });
            }
        } else if (data.types) {
            const tmpTypes = [...generatedSchema.types] || [];
            const tmpDef = Types[data.types].edit();
            tmpTypes.push(tmpDef);
            setGeneratedSchema({
                ...generatedSchema,
                types: tmpTypes
            });
        } else {
            console.log('Error: OnDrop() in client/src/components/generate/schema/SchemaCreator.tsx');
        }
    }

    const infoKeys = Object.keys(Info).map(k => (
        <Draggable type="info" data={k} key={Info[k].key}>
            <ListGroupItem action>{Info[k].key}</ListGroupItem>
        </Draggable>
    ));

    const typesKeys = Object.keys(Types).map(k => (
        <Draggable type="types" data={k} key={Types[k].key}>
            <ListGroupItem action>{Types[k].key}</ListGroupItem>
        </Draggable>
    ));

    const infoEditors = Object.keys(Info).map((k, i) => {
        const key = k as keyof typeof Info;
        if (generatedSchema.info && k in generatedSchema.info) {
            return Info[key].editor({
                key: i,
                value: generatedSchema.info[key],
                placeholder: k,
                change: val => setGeneratedSchema({
                    ...generatedSchema,
                    info: {
                        ...generatedSchema.info,
                        ...Info[key].edit(val)
                    }
                })
                ,
                remove: (id: string) => {
                    if (generatedSchema.info && id in generatedSchema.info) {
                        const tmpInfo = { ...generatedSchema.info };
                        delete tmpInfo[id];
                        setGeneratedSchema({
                            ...generatedSchema,
                            info: tmpInfo
                        });
                    }
                }
            });
        }
        // eslint-disable-next-line no-useless-return
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
                setGeneratedSchema({
                    ...generatedSchema,
                    types: tmpTypes
                })
            }
            ,
            remove: (idx: number) => {
                if (generatedSchema.types.length >= idx) {
                    const tmpTypes = [...generatedSchema.types];
                    tmpTypes.splice(idx, 1);
                    setGeneratedSchema({
                        ...generatedSchema,
                        types: tmpTypes
                    });
                }
            }
        });
    });

    const schemaDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            const data = generatedSchema;
            const filename = `schema.jadn`; //convert to jadn??

            const blob = new Blob([data], { type: "application/json" });
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

    return (
        <fieldset className="p-0">
            <TabContent activeTab={activeView}>
                <TabPane tabId='creator'>
                    <div className='card'>
                        <div className='card-body p-0' style={{ height: '40em' }}>
                            <div className='row'>
                                <div id="schema-options" className='col-sm-3'>
                                    <Nav>
                                        <NavItem>
                                            <NavLink
                                                style={activeOpt == 'info' ? { textDecoration: 'underline' } : { textDecoration: 'none' }}
                                                onClick={() => setActiveOpt('info')}
                                            >
                                                Info
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                style={activeOpt == 'types' ? { textDecoration: 'underline' } : { textDecoration: 'none' }}
                                                onClick={() => setActiveOpt('types')}
                                            >
                                                Types
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                    <TabContent activeTab={activeOpt}>
                                        <TabPane tabId='info'>
                                            <ListGroup>
                                                {infoKeys}
                                            </ListGroup>
                                        </TabPane>
                                        <TabPane tabId='types'>
                                            <ListGroup>
                                                {typesKeys}
                                            </ListGroup>
                                        </TabPane>
                                    </TabContent>
                                </div>

                                <div id="schema-editor" className='col-md-9' style={{ height: '40em', overflowY: 'auto' }}>
                                    <Droppable
                                        types={['info', 'types']} // <= allowed drop types
                                        onDrop={onDrop}
                                        className='border col-12 p-0 pt-1'
                                        style={{
                                            minHeight: '20em',
                                        }}
                                    >
                                        <div className="col pt-2">
                                            <h2>Info</h2>
                                            {infoEditors}
                                        </div>
                                        <hr />
                                        <div className="col">
                                            <h2>Types</h2>
                                            {typesEditors}
                                        </div>
                                    </Droppable>
                                </div>
                            </div>
                        </div>
                        <div className='card-footer p-1'>
                            <div className='row no-gutters'>
                                <div className='col-md-6'>
                                    <select id="schema-list" name="schema-list" className="form-control form-control-sm" value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
                                        <option value="">Select a Schema...</option>
                                        <optgroup label="Testers">
                                            {schemaOpts.map((s: any) => <option key={s} value={s} >{s}</option>)}
                                        </optgroup>
                                        <optgroup label="Custom">
                                            <option value="file">File...</option>
                                        </optgroup>
                                    </select>
                                    <Input type="file" id="schema-file" name="schema-file" className={`form-control ${selectedFile == 'file' ? '' : ' d-none'}`} accept=".jadn" onChange={onFileChange} />
                                </div>
                                <div className='col-md-6'>
                                    <Button onClick={() => setActiveView('schema')} color="info" className='float-right btn-sm mr-1'>See Generated Schema</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPane>

                <TabPane tabId='schema'>
                    <div className='card'>
                        <div className='card-body' style={{ height: '40em' }}>
                            <JSONPretty
                                id='schema'
                                json={generatedSchema}
                            />
                        </div>
                        <div className='card-footer p-1'>
                            <div className='btn-group btn-group-sm float-right'>
                                <Button onClick={() => setActiveView('creator')} className="float-right btn-sm mr-1" color="info">See Schema Creator</Button>
                                <Button id='schemaDownload' title="Download generated schema" color="info" className='btn-sm float-right mr-1' onClick={schemaDownload}>
                                    <FontAwesomeIcon icon={faFileDownload} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabPane>
            </TabContent>
        </fieldset>
    )
}
export default SchemaCreator 