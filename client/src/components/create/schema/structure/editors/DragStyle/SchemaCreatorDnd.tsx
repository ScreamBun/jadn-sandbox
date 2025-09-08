import React, { memo, useState } from 'react'
import { flushSync } from 'react-dom';
import { faCircleChevronDown, faCircleChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { v4 as uuid4 } from 'uuid';
import { VariableSizeList as List } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import { Meta, Types } from '../../structure';
import { TypeArray, StandardTypeArray } from 'components/create/schema/interface';
import { TypeObject } from '../consts';
import withSchemaCreator, { configInitialState } from '../ParentEditor/withSchemaCreator';
import { getTypeName } from 'components/utils/general';
import { sbToastError, sbToastSuccess } from 'components/common/SBToast';
import SBEditor from 'components/common/SBEditor';
import SBSpinner from 'components/common/SBSpinner';
import SBScrollToTop from 'components/common/SBScrollToTop';
import SBOutline, { DragItem, DragItem as Item } from './SBOutline';
import { Droppable } from './Droppable'
import { DraggableKey } from './DraggableKey';

const SchemaCreatorDnd = memo(function SchemaCreator(props: any) {
    const { selectedFile, generatedSchema, setGeneratedSchema,
        cardsState, setCardsState, getItemSize, listRef, setRowHeight,
        setIsValidJADN, setIsValidating, isLoading,
        activeOpt, setActiveOpt, activeView, configOpt, setConfigOpt,
        fieldCollapseState, setFieldCollapseState, metaCollapse, setMetaCollapse,
        typesCollapse, setTypesCollapse,
        allFieldsCollapse, collapseAllFields, fieldCollapseStateRef } = props;

    const [visibleType, setVisibleType] = useState<number | null>(null);

    const onSchemaDrop = (item: Item) => {
        let key = item.text;
        if (Object.keys(Meta).includes(key)) {
            const edit = key == 'config' ? Meta[key].edit(configInitialState) : Meta[key].edit();
            const updatedSchema = generatedSchema.types ? {
                meta: {
                    ...generatedSchema.meta || {},
                    ...edit
                },
                types: [...generatedSchema.types]
            } :
                {
                    meta: {
                        ...generatedSchema.meta || {},
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
                    setFieldCollapseState((prev: any) => ([...prev, false]));
                } else {
                    setFieldCollapseState((prev: any) => ([...prev, undefined]));
                }
            });

            setIsValidJADN(false);
            setIsValidating(false);
            onScrollToCard(dataIndex);
        }
    }

    const onOutlineDrop = (updatedCards: DragItem[], index: number, originalIndex: number) => {
        const updatedTypes = updatedCards.map(item => item.value);
        setGeneratedSchema((prev: any) => ({ ...prev, types: updatedTypes }));
        setCardsState(updatedCards);
        let updatedFieldCollapseState: Boolean[] = fieldCollapseStateRef.current;
        const originalIndexBool = updatedFieldCollapseState[originalIndex];
        updatedFieldCollapseState = updatedFieldCollapseState.filter((_bool: Boolean, i: number) =>
            i !== originalIndex
        );
        updatedFieldCollapseState = [
            ...updatedFieldCollapseState.slice(0, index),
            originalIndexBool,
            ...updatedFieldCollapseState.slice(index)
        ];

        setFieldCollapseState(updatedFieldCollapseState)
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

        let updatedFieldCollapseState: Boolean[];
        if (Types[key].type == 'structure') {
            updatedFieldCollapseState = [
                ...fieldCollapseState.slice(0, insertAt),
                false,
                ...fieldCollapseState.slice(insertAt)
            ];
        } else {
            updatedFieldCollapseState = [
                ...fieldCollapseState.slice(0, insertAt),
                undefined,
                ...fieldCollapseState.slice(insertAt)
            ];
        }

        flushSync(() => {
            setGeneratedSchema((prev: any) => ({ ...prev, types: updatedTypes }));
            setCardsState(updatedCards);
            setFieldCollapseState(updatedFieldCollapseState);
        });

        setIsValidating(false);
        onScrollToCard(insertAt);
    }

    let metaKeys;
    if (generatedSchema.meta) {
        const unusedMetaKeys = Object.keys(Meta).filter(k =>
            !(Object.keys(generatedSchema.meta).includes(k)));

        const unusedMeta = Object.fromEntries(Object.entries(Meta).filter(([key]) => unusedMetaKeys.includes(key)));

        metaKeys = Object.keys(unusedMeta).map(k => (
            <DraggableKey item={Meta[k].key} acceptableType={'MetaKeys'} key={uuid4()}
                id={uuid4()} index={-1} text={k}
                isDraggable={selectedFile?.value == 'file' ? false : true} />
        ));
    } else {
        metaKeys = Object.keys(Meta).map(k => (
            <DraggableKey item={Meta[k].key} acceptableType={'MetaKeys'} key={uuid4()}
                id={uuid4()} index={-1} text={k}
                isDraggable={selectedFile?.value == 'file' ? false : true} />
        ));
    }

    const typesKeys = Object.keys(Types).map(k => (
        <DraggableKey item={Types[k].key} acceptableType={'TypesKeys'} key={uuid4()}
            id={uuid4()} index={-1} text={k}
            isDraggable={selectedFile?.value == 'file' ? false : true}
            onTypesDrop={onTypesToOutlineDrop}
        />
    ));

    const metaEditors = Object.keys(Meta).map((k, i) => {
        const key = k as keyof typeof Meta;
        if (generatedSchema.meta && k in generatedSchema.meta) {
            return Meta[key].editor({
                key: self.crypto.randomUUID(),
                value: generatedSchema.meta[key],
                dataIndex: i,
                placeholder: k,
                change: (val: any) => {
                    if (key == 'config') {
                        setConfigOpt(val);
                    }

                    setGeneratedSchema((prev: any) => ({
                        ...prev,
                         meta: {
                            ...prev.meta,
                            ...Meta[key].edit(val)
                        }
                    }));

                    setIsValidJADN(false);
                    setIsValidating(false);

                },
                addTypeChange: (val: any) => {
                    const idx = generatedSchema.types?.length || 0;
                    const tmpTypes = generatedSchema.types ? [...generatedSchema.types] : [];
                    tmpTypes[idx] = Types[val.type.toLowerCase()].edit(val);

                    const valArray: TypeArray = Object.values(val);
                    const updatedCards = [...cardsState,
                    {
                        id: self.crypto.randomUUID(),
                        index: idx,
                        isStarred: false,
                        text: val.name,
                        value: valArray
                    }
                    ]

                    if (tmpTypes.length != 0) {
                        setGeneratedSchema((prev: any) => ({ ...prev, types: tmpTypes }));
                    } else {
                        if (generatedSchema.meta) {
                            setGeneratedSchema((prev: any) => ({ meta: { ...prev.meta } }));
                        } else {
                            setGeneratedSchema({});
                        }
                    }

                    setCardsState(updatedCards);
                    sbToastSuccess(`Successfully added Root ${val.name} to Types`);
                    onScrollToCard(idx);
                },
                remove: (id: string) => {
                    if (generatedSchema.meta && id in generatedSchema.meta) {
                        if (id == 'config') {
                            setConfigOpt(configInitialState);
                        }
                        const tmpMeta = { ...generatedSchema.meta };
                        delete tmpMeta[id];
                        let updatedSchema;
                        //remove meta if empty
                        if (Object.keys(tmpMeta).length == 0) {
                            const tmpData = { ...generatedSchema };
                            delete tmpData['meta'];
                            updatedSchema = tmpData;
                        } else {
                            updatedSchema = {
                                ...generatedSchema,
                                meta: tmpMeta
                            };
                        }
                        setGeneratedSchema(updatedSchema);
                        setIsValidJADN(false);
                        setIsValidating(false);
                    }
                },
                config: configOpt
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
            fieldCollapse: fieldCollapseState[index],
            setFieldCollapse: (bool: boolean, idx: number) => {
                const updatedFieldCollapseState = fieldCollapseState.map((fieldBool: boolean, i: number) => {
                    if (i === idx) {
                        return bool;
                    } else {
                        return fieldBool;
                    }
                });

                setFieldCollapseState(updatedFieldCollapseState);
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
                    if (generatedSchema.meta) {
                        setGeneratedSchema((prev: any) => ({ meta: { ...prev.meta } }));
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
                const removedType = generatedSchema.types[idx];
                const tmpTypes = generatedSchema.types.filter((_type: StandardTypeArray, i: number) => i != idx);
                const tmpCards = cardsState.filter((_card: DragItem, index: number) => index != idx);
                if (tmpTypes.length != 0) {
                    setGeneratedSchema((prev: any) => ({ ...prev, types: tmpTypes }));
                } else {
                    if (generatedSchema.meta) {
                        setGeneratedSchema((prev: any) => ({ meta: { ...prev.meta } }));
                    } else {
                        setGeneratedSchema({});
                    }
                }

                if (generatedSchema?.meta?.roots?.includes(removedType[0])) {
                    const tmpMeta = generatedSchema.meta.roots.filter((typeName: string) => typeName != removedType[0]);
                    setGeneratedSchema((prev: any) => ({ ...prev, meta: { ...prev.meta, roots: tmpMeta } }));
                }

                setCardsState(tmpCards);
                setFieldCollapseState(
                    fieldCollapseState.filter((_bool: Boolean, i: number) =>
                        i !== idx
                    ));
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
                                                    ${activeOpt == 'meta' && (selectedFile?.value == 'file' && !generatedSchema ? false : true) ? ' active bg-primary' : ''}
                                                    ${selectedFile?.value == 'file' && !generatedSchema ? 'disabled' : ''}`}
                                                onClick={() => setActiveOpt('meta')}
                                                title="meta data (about a schema package)"
                                                data-bs-toggle="pill"
                                            >
                                                Meta
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
                                        <div className={`tab-pane fade ${activeOpt == 'meta' ? 'show active' : ''}`} id="meta" role="tabpanel" aria-labelledby="meta-tab" tabIndex={0}>
                                            <ul className="list-group">
                                                {metaKeys.length != 0 ? metaKeys : <div className='col'>No Meta to add</div>}
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
                                                            <h5 id="meta" className="card-title text-light">Meta <small style={{ fontSize: '10px' }}> metadata </small></h5>
                                                        </div>
                                                        <div className='col'>
                                                            <span>
                                                                <FontAwesomeIcon icon={metaCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                    className='float-end btn btn-sm text-light'
                                                                    onClick={() => setMetaCollapse(!metaCollapse)}
                                                                    title={metaCollapse ? ' Show Meta' : ' Hide Meta'} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='card-body'>
                                                    {!metaCollapse &&
                                                        <Droppable onDrop={onSchemaDrop} acceptableType={'MetaKeys'} >
                                                            {generatedSchema.meta ?
                                                                <>{metaEditors}</>
                                                                :
                                                                <><p>To add metadata click and drag items from Meta</p></>
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
                                                                        <button type="button" className="btn btn-secondary" onClick={collapseAllFields}>
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
                            <SBEditor data={generatedSchema} isReadOnly={false}></SBEditor>
                        </div>
                    </div>
                </div>
                <SBScrollToTop divID='schema-editor' />
            </div >
        </>
    )
});
export const SchemaCreatorDndStyle = withSchemaCreator(SchemaCreatorDnd);