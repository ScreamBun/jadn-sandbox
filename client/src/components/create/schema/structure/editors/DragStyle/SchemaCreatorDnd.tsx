import React, { memo, useEffect, useState } from 'react'
import { flushSync } from 'react-dom';
import { faCircleChevronDown, faCircleChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { v4 as uuid4 } from 'uuid';
import { VariableSizeList as List } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import { Info, Types } from '../../structure';
import { TypeArray, StandardTypeArray } from 'components/create/schema/interface';
import { TypeObject } from '../consts';
import withSchemaCreator, { configInitialState } from '../ParentEditor/withSchemaCreator';
import { getTypeName } from 'components/utils/general';
import { sbToastError } from 'components/common/SBToast';
import SBEditor from 'components/common/SBEditor';
import SBSpinner from 'components/common/SBSpinner';
import SBScrollToTop from 'components/common/SBScrollToTop';
import SBOutline, { DragItem, DragItem as Item } from './SBOutline';
import { Droppable } from './Droppable'
import { DraggableKey } from './DraggableKey';

const SchemaCreatorDnd = memo(function SchemaCreator(props: any) {
    const { selectedFile, generatedSchema, setGeneratedSchema, cardsState, setCardsState, getItemSize, listRef,
        setIsValidJADN, setIsValidating, isLoading, setRowHeight,
        activeOpt, setActiveOpt, activeView, configOpt, setConfigOpt, fieldCollapseState, setFieldCollapseState } = props;

    const [visibleType, setVisibleType] = useState<number | null>(null);

    const [allFieldsCollapse, setAllFieldsCollapse] = useState(false);
    const [infoCollapse, setInfoCollapse] = useState(false);
    const [typesCollapse, setTypesCollapse] = useState(false);

    useEffect(() => {
        if (Object.keys(fieldCollapseState).length > 0) {
            const count = Object.keys(fieldCollapseState).length;
            let tracker = 0;

            for (let i in Object.values(fieldCollapseState)) {
                if (fieldCollapseState[i] == true) {
                    tracker++;
                }
            }

            if (tracker == count && allFieldsCollapse != true) {
                setAllFieldsCollapse(true);
            } else if (tracker == 0 && allFieldsCollapse != false) {
                setAllFieldsCollapse(false)
            }
        }
    }, [fieldCollapseState])

    useEffect(() => {
        if (allFieldsCollapse == true) {
            const updatedFieldCollapseState = { ...fieldCollapseState };
            Object.keys(updatedFieldCollapseState).forEach((item) => updatedFieldCollapseState[item] = true);
            setFieldCollapseState(updatedFieldCollapseState);

        } else if (allFieldsCollapse == false) {
            const updatedFieldCollapseState = { ...fieldCollapseState };
            Object.keys(updatedFieldCollapseState).forEach((item) => updatedFieldCollapseState[item] = false);
            setFieldCollapseState(updatedFieldCollapseState);
        }
    }, [allFieldsCollapse])

    const onSchemaDrop = (item: Item) => {
        let key = item.text;
        if (Object.keys(Info).includes(key)) {
            const edit = key == 'config' ? Info[key].edit(configInitialState) : Info[key].edit();
            const updatedSchema = generatedSchema.types ? {
                info: {
                    ...generatedSchema.info || {},
                    ...edit
                },
                types: [...generatedSchema.types]
            } :
                {
                    info: {
                        ...generatedSchema.info || {},
                        ...edit
                    },
                }

            flushSync(() => {
                setGeneratedSchema(updatedSchema);
            });
            setIsValidJADN(false);
            setIsValidating(false);

            var scrollSpyContentEl = document.getElementById(`${key}`)
            scrollSpyContentEl?.scrollIntoView();

        } else if (Object.keys(Types).includes(key)) {
            const tmpTypes = generatedSchema.types ? [...generatedSchema.types] : [];
            const type_name = getTypeName(tmpTypes, `${Types[key].key}-Name`);
            const tmpDef = Types[key].edit({ name: type_name });
            tmpTypes.push(tmpDef);
            const dataIndex = generatedSchema.types?.length || 0;

            const new_card = {
                id: self.crypto.randomUUID(),
                index: dataIndex,
                text: type_name,
                value: tmpDef,
                isStarred: false
            }

            flushSync(() => {
                setGeneratedSchema((prev: any) => ({ ...prev, types: tmpTypes }));
                setCardsState((prev: any) => ([...prev, new_card]));
                if (Types[key].type == 'structure') {
                    setFieldCollapseState((prev: any) => ({ ...prev, [dataIndex]: false }));
                }
            });

            setIsValidJADN(false);
            setIsValidating(false);
            onScrollToCard(dataIndex);
        }
    }

    const onOutlineDrop = (updatedCards: DragItem[]) => {
        const updatedTypes = updatedCards.map(item => item.value);
        setGeneratedSchema((prev: any) => ({ ...prev, types: updatedTypes }));
        setCardsState(updatedCards);
        //TODO updated field collapse
        listRef.current?.resetAfterIndex(0, false);
    };

    const onStarClick = (updatedCards: DragItem[]) => {
        setCardsState(updatedCards);
    }

    const onScrollToCard = (idx: number) => {
        listRef.current?.scrollToItem(idx);
    }

    const onTypesToOutlineDrop = (item: any) => {
        let key = item.text;
        let insertAt = item.index;
        const tmpTypes = generatedSchema.types ? [...generatedSchema.types] : [];
        const type_name = getTypeName(tmpTypes, `${Types[key].key}-Name`);
        const tmpDef = Types[key].edit({ name: type_name });

        let updatedTypes = [
            ...tmpTypes.slice(0, insertAt),
            tmpDef,
            ...tmpTypes.slice(insertAt)
        ];

        const new_card = {
            id: self.crypto.randomUUID(),
            index: insertAt,
            text: type_name,
            value: tmpDef,
            isStarred: false
        }

        let updatedCards = [
            ...cardsState.slice(0, insertAt),
            new_card,
            ...cardsState.slice(insertAt)
        ];

        flushSync(() => {
            setGeneratedSchema((prev: any) => ({ ...prev, types: updatedTypes }));
            setCardsState(updatedCards);
            /*         todo:   update at index 
            if (Types[key].type == 'structure') {
                          //update field collapse
                          //add field in insertAt
          
                          const updatedFieldCollapseState = { ...fieldCollapseState };
                          const out = Object.keys(updatedFieldCollapseState).reduce((ac, a, i) => {
                              if (i === insertAt) {
                                  ac[insertAt] = false
                              };
                              ac[a] = updatedFieldCollapseState[a];
                              return ac;
                          }, {})
                          console.log(out)
                      } */
        });

        setIsValidating(false);
        onScrollToCard(insertAt);
    }

    let infoKeys;
    if (generatedSchema.info) {
        const unusedInfoKeys = Object.keys(Info).filter(k =>
            !(Object.keys(generatedSchema.info).includes(k)));

        const unusedInfo = Object.fromEntries(Object.entries(Info).filter(([key]) => unusedInfoKeys.includes(key)));

        infoKeys = Object.keys(unusedInfo).map(k => (
            <DraggableKey item={Info[k].key} acceptableType={'InfoKeys'} key={uuid4()} id={uuid4()} index={-1} text={k} isDraggable={selectedFile?.value == 'file' ? false : true} />
        ));
    } else {
        infoKeys = Object.keys(Info).map(k => (
            <DraggableKey item={Info[k].key} acceptableType={'InfoKeys'} key={uuid4()} id={uuid4()} index={-1} text={k} isDraggable={selectedFile?.value == 'file' ? false : true} />
        ));
    }

    const typesKeys = Object.keys(Types).map(k => (
        <DraggableKey item={Types[k].key} acceptableType={'TypesKeys'} key={uuid4()} id={uuid4()} index={-1} text={k}
            isDraggable={selectedFile?.value == 'file' ? false : true} onTypesDrop={onTypesToOutlineDrop}
        />
    ));

    const infoEditors = Object.keys(Info).map((k, i) => {
        const key = k as keyof typeof Info;
        if (generatedSchema.info && k in generatedSchema.info) {
            return Info[key].editor({
                key: self.crypto.randomUUID(),
                value: generatedSchema.info[key],
                dataIndex: i,
                placeholder: k,
                change: (val: any) => {
                    if (key == 'config') {
                        setConfigOpt(val);
                    }

                    setGeneratedSchema((prev: any) => ({
                        ...prev,
                        info: {
                            ...prev.info,
                            ...Info[key].edit(val)
                        }
                    }));

                    setIsValidJADN(false);
                    setIsValidating(false);

                },
                remove: (id: string) => {
                    if (generatedSchema.info && id in generatedSchema.info) {
                        if (id == 'config') {
                            setConfigOpt(configInitialState);
                        }
                        const tmpInfo = { ...generatedSchema.info };
                        delete tmpInfo[id];
                        let updatedSchema;
                        //remove info if empty
                        if (Object.keys(tmpInfo).length == 0) {
                            const tmpData = { ...generatedSchema };
                            delete tmpData['info'];
                            updatedSchema = tmpData;
                        } else {
                            updatedSchema = {
                                ...generatedSchema,
                                info: tmpInfo
                            };
                        }
                        setGeneratedSchema(updatedSchema);
                        setIsValidJADN(false);
                        setIsValidating(false);
                    }
                },
                config: generatedSchema.info[key] ? generatedSchema.info[key] : configInitialState
            });
        }
        return null;
    });

    const typesEditors = ({ data, index, style }) => {
        const def = data[index];
        let type = def[1].toLowerCase() as keyof typeof Types;

        //CHECK FOR VALID TYPE
        if (!Object.keys(Types).includes(type)) {
            sbToastError(`Error: ${type} in Type definition [${def}] is not a valid type. Changing type to String.`)
            def[1] = "String";
            type = "string";
        }

        return (Types[type].dndeditor({
            key: self.crypto.randomUUID(),
            value: def,
            dataIndex: index,
            customStyle: { ...style, height: 'auto' },
            fieldCollapse: fieldCollapseState && Types[type].type == 'structure' ? fieldCollapseState[index] : false,
            setFieldCollapse: (bool: boolean, idx: number) => {
                setFieldCollapseState((prev) => ({ ...prev, [idx]: bool }))
            },
            setRowHeight: setRowHeight,
            setIsVisible: setVisibleType,
            change: (val: TypeObject, idx: number) => {
                const tmpTypes = [...generatedSchema.types];
                tmpTypes[idx] = Types[val.type.toLowerCase()].edit(val);

                const valArray: TypeArray = Object.values(val);
                const updatedCards = cardsState.map((card, i) => {
                    if (i === idx) {
                        return ({
                            ...card,
                            text: val.name,
                            value: valArray
                        });
                    } else {
                        return card;
                    }
                });

                if (tmpTypes.length != 0) {
                    setGeneratedSchema((prev: any) => ({ ...prev, types: tmpTypes }));
                } else {
                    if (generatedSchema.info) {
                        setGeneratedSchema((prev: any) => ({ info: { ...prev.info } }));
                    } else {
                        setGeneratedSchema({});
                    }
                }

                setCardsState(updatedCards);
                setIsValidJADN(false);
                setIsValidating(false);
            }
            ,
            remove: (idx: number) => {
                const tmpTypes = generatedSchema.types.filter((_type: StandardTypeArray, i: number) => i != idx);
                const tmpCards = cardsState.filter((_card: DragItem, index: number) => index != idx);
                if (tmpTypes.length != 0) {
                    setGeneratedSchema((prev: any) => ({ ...prev, types: tmpTypes }));
                } else {
                    if (generatedSchema.info) {
                        setGeneratedSchema((prev: any) => ({ info: { ...prev.info } }));
                    } else {
                        setGeneratedSchema({});
                    }
                }
                setCardsState(tmpCards);
                setFieldCollapseState((prev) => {
                    const { idx, ...data } = prev;
                    return data;
                });
                setIsValidJADN(false);
                setIsValidating(false);
            },
            config: configOpt
        }))
    };

    return (
        <>
            <div className='tab-content mb-2'>
                <div className={`container-fluid tab-pane fade ${activeView == 'creator' ? 'show active' : ''}`} id="creator" role="tabpanel" aria-labelledby="creator-tab" tabIndex={0}>
                    <div className='row'>
                        <div id="schema-options" className='col-sm-3 ps-0 card-body-scroller'>
                            <div className='row'>
                                <div className='col'>
                                    <ul className="nav nav-pills pb-2" id="editorKeys" role="tablist">
                                        <li className='nav-item me-2'>
                                            <a
                                                className={`nav-link 
                                                    ${activeOpt == 'info' && (selectedFile?.value == 'file' && !generatedSchema ? false : true) ? ' active bg-primary' : ''}
                                                    ${selectedFile?.value == 'file' && !generatedSchema ? 'disabled' : ''}`}
                                                onClick={() => setActiveOpt('info')}
                                                title="meta data (about a schema package)"
                                                data-bs-toggle="pill"
                                            >
                                                Info
                                            </a>
                                        </li>
                                        <li className='nav-item'>
                                            <a
                                                className={`nav-link 
                                                    ${activeOpt == 'types' && (selectedFile?.value == 'file' && !generatedSchema ? false : true) ? ' active bg-primary' : ''}
                                                    ${selectedFile?.value == 'file' && !generatedSchema ? 'disabled' : ''}`}
                                                onClick={() => setActiveOpt('types')}
                                                title="schema content (the information model)"
                                                data-bs-toggle="pill"
                                            >
                                                Types*
                                            </a>
                                        </li>
                                    </ul>
                                    <div className='tab-content mb-2'>
                                        <div className={`tab-pane fade ${activeOpt == 'info' ? 'show active' : ''}`} id="info" role="tabpanel" aria-labelledby="info-tab" tabIndex={0}>
                                            <ul className="list-group">
                                                {infoKeys.length != 0 ? infoKeys : <div className='col'>No Info to add</div>}
                                            </ul>
                                        </div>
                                        <div className={`tab-pane fade ${activeOpt == 'types' ? 'show active' : ''}`} id="types" role="tabpanel" aria-labelledby="types-tab" tabIndex={0}>
                                            <ul className="list-group">
                                                {typesKeys}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col'>
                                    <SBOutline
                                        id={'schema-outline'}
                                        cards={cardsState}
                                        title={'Outline'}
                                        onDrop={onOutlineDrop}
                                        onStarToggle={onStarClick}
                                        onScrollToCard={onScrollToCard}
                                        visibleCard={visibleType}
                                    ></SBOutline>
                                </div>
                            </div>
                        </div>
                        <div id="schema-editor" className='col-md-9 px-1 card-body-scroller' >
                            {isLoading ? <SBSpinner action={'Loading'} isDiv /> :
                                <>
                                    <div className='row'>
                                        <div className="col">
                                            <div className='card'>
                                                <div className='card-header text-light bg-primary' style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                                                    <div className='row'>
                                                        <div className='col'>
                                                            <h5 id="info" className="card-title text-light">Info <small style={{ fontSize: '10px' }}> metadata </small></h5>
                                                        </div>
                                                        <div className='col'>
                                                            <span>
                                                                <FontAwesomeIcon icon={infoCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                    className='float-end btn btn-sm text-light'
                                                                    onClick={() => setInfoCollapse(!infoCollapse)}
                                                                    title={infoCollapse ? ' Show Info' : ' Hide Info'} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='card-body'>
                                                    {!infoCollapse &&
                                                        <Droppable onDrop={onSchemaDrop} acceptableType={'InfoKeys'} >
                                                            {generatedSchema.info ?
                                                                <>{infoEditors}</>
                                                                :
                                                                <><p>To add metadata info click and drag items from Info</p></>
                                                            }
                                                        </Droppable>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row mt-2'>
                                        <div className="col pt-2">
                                            <div className='card'>
                                                <div className='card-header bg-primary'>
                                                    <div className='row'>
                                                        <div className='col'>
                                                            <h6 id="types" className='pt-1 text-light'>Types* <small style={{ fontSize: '10px' }}> schema content </small></h6>
                                                        </div>
                                                        <div className='col'>
                                                            {generatedSchema.types &&
                                                                <>
                                                                    <div className="btn-group btn-group-sm float-end" role="group" aria-label="Basic example">
                                                                        <button type="button" className="btn btn-secondary" onClick={() => setTypesCollapse(!typesCollapse)}>
                                                                            {typesCollapse ? 'Show Types' : ' Hide Types'}
                                                                            <FontAwesomeIcon icon={typesCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                                className='float-end btn btn-sm text-light'
                                                                                title={typesCollapse ? 'Show Types' : 'Hide Types'} />
                                                                        </button>
                                                                        <button type="button" className="btn btn-secondary" onClick={() => setAllFieldsCollapse(!allFieldsCollapse)}>
                                                                            {allFieldsCollapse ? 'Show Fields' : 'Hide Fields'}
                                                                            <FontAwesomeIcon icon={allFieldsCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                                className='float-end btn btn-sm text-light'
                                                                                title={allFieldsCollapse ? 'Show Fields' : 'Hide Fields'} />
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='card-body'>
                                                    {!typesCollapse &&
                                                        <Droppable onDrop={onSchemaDrop} acceptableType={"TypesKeys"} >
                                                            {generatedSchema.types ?
                                                                <div style={{ height: '65vh' }}>
                                                                    <AutoSizer disableWidth>
                                                                        {({ height }) => (
                                                                            <List
                                                                                className='List'
                                                                                height={height}
                                                                                itemCount={generatedSchema.types.length || 0}
                                                                                itemData={generatedSchema.types}
                                                                                itemSize={getItemSize}
                                                                                width={'100%'}
                                                                                ref={listRef}
                                                                                itemKey={() => self.crypto.randomUUID()}
                                                                            >
                                                                                {typesEditors}
                                                                            </List>
                                                                        )}
                                                                    </AutoSizer>
                                                                </div> :
                                                                <><p>To add schema content click and drag items from Types</p></>
                                                            }
                                                        </Droppable>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>

                <div className={`tab-pane fade ${activeView == 'schema' ? 'show active' : ''}`} id="schema" role="tabpanel" aria-labelledby="schema-tab" tabIndex={0}>
                    <div className='card'>
                        <div className='card-body p-0'>
                            <SBEditor data={generatedSchema} isReadOnly={true}></SBEditor>
                        </div>
                    </div>
                </div>
                <SBScrollToTop divID='schema-editor' />
            </div >
        </>
    )
});
export const SchemaCreatorDndStyle = withSchemaCreator(SchemaCreatorDnd);