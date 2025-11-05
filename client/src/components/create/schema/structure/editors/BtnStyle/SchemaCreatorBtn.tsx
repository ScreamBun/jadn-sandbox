import React, { useEffect, memo, useState } from 'react'
import { flushSync } from 'react-dom';
import { faCircleChevronDown, faCircleChevronUp, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { VariableSizeList as List } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import { Meta, Types } from '../../structure';
import { StandardTypeObject, TypeKeys } from '../consts';
import { TypeArray, StandardTypeArray } from 'components/create/schema/interface';
import withSchemaCreator, { configInitialState } from '../ParentEditor/withSchemaCreator';
import { getTypeName, zip } from 'components/utils/general';
import { sbToastError, sbToastSuccess } from 'components/common/SBToast';
import { Option } from 'components/common/SBSelect';
import SBEditor from 'components/common/SBEditor';
import SBSpinner from 'components/common/SBSpinner';
import SBScrollToTop from 'components/common/SBScrollToTop';
import { DragItem } from '../DragStyle/SBOutline';
import SBOutlineBtnStyle from './SBOutlineBtn';
import { AddToIndexDropDown } from './AddToIndexDropDown';
import SBTreeView from 'components/common/SBTreeView';

const defaultInsertIdx = { label: "end", value: "end" };

const SchemaCreatorBtn = memo(function SchemaCreatorBtn(props: any) {
    const { selectedFile, generatedSchema, setGeneratedSchema, cardsState, setCardsState,
        getItemSize, listRef, setRowHeight,
        setIsValidJADN, setIsValidating, isLoading,
        activeOpt, setActiveOpt, activeView, configOpt, setConfigOpt,
        fieldCollapseState, setFieldCollapseState, metaCollapse, setMetaCollapse,
        typesCollapse, setTypesCollapse,
        allFieldsCollapse, collapseAllFields, fieldCollapseStateRef } = props;

    const [visibleType, setVisibleType] = useState<number | null>(null);
    const [localActiveOpt, setLocalActiveOpt] = useState<string>('tree');

    const [insertAt, setInsertAt] = useState(defaultInsertIdx);
    let indexOpts = generatedSchema.types ?
        (generatedSchema.types.length == 1) ?
            [{ value: "0", label: `${generatedSchema.types[0][0]} (beginning)` }, { value: "end", label: "end" }] :
            generatedSchema.types.map((item: any, i: number) => {
                if (i == 0) {
                    return { value: "0", label: `${item[0]} (beginning)` };
                } else if (i == (generatedSchema.types.length - 1)) {
                    return { value: "end", label: `${item[0]} (end)` }
                } else {
                    return { value: `${i}`, label: `${item[0]} (index: ${i})` };
                }
            }) :
        [defaultInsertIdx];

    useEffect(() => {
        indexOpts = generatedSchema.types ?
            (generatedSchema.types.length == 1) ?
                [{ value: "0", label: `${generatedSchema.types[0][0]} (beginning)` }, { value: "end", label: "end" }] :
                generatedSchema.types.map((item: any, i: number) => {
                    if (i == 0) {
                        return { value: "0", label: `${item[0]} (beginning)` };
                    } else if (i == (generatedSchema.types.length - 1)) {
                        return { value: "end", label: `${item[0]} (end)` }
                    } else {
                        return { value: `${i}`, label: `${item[0]} (index: ${i})` };
                    }
                }) :
            [defaultInsertIdx];
        const optionValue = generatedSchema.types && insertAt ? insertAt.value : defaultInsertIdx.value;
        const selectedOption = indexOpts.filter((option: Option) => option.value == optionValue);
        setInsertAt(selectedOption ? selectedOption[0] : defaultInsertIdx);
    }, [generatedSchema])

    let metaKeys;
    if (generatedSchema.meta) {
        const unusedMetaKeys = Object.keys(Meta).filter(k =>
            !(Object.keys(generatedSchema.meta).includes(k)));

        const unusedMeta = Object.fromEntries(Object.entries(Meta).filter(([key]) => unusedMetaKeys.includes(key)));

        metaKeys = Object.keys(unusedMeta).map(k => (
            <div className='list-group-item  d-flex justify-content-between align-items-center p-2' key={k}>
                {Meta[k].key}

                <button type='button' onClick={() => onDrop(k)} className='btn btn-sm btn-outline-primary'
                    disabled={selectedFile?.value == 'file' ? true : false}
                    title='Add to Schema'>
                    <FontAwesomeIcon icon={faPlusSquare} />
                </button>
            </div>
        ));
    } else {
        metaKeys = Object.keys(Meta).map(k => (
            <div className='list-group-item d-flex justify-content-between align-items-center p-2' key={k}>
                {Meta[k].key}

                <button type='button' onClick={() => onDrop(k)} className='btn btn-sm btn-outline-primary'
                    disabled={selectedFile?.value == 'file' ? true : false}
                    title='Add to Schema'>
                    <FontAwesomeIcon icon={faPlusSquare} />
                </button>
            </div>
        ));
    }

    const typesKeys = Object.keys(Types).map(k => (
        <div className='list-group-item d-flex justify-content-between align-items-center p-2' key={k}>
            {Types[k].key}

            <button type='button' onClick={() => onDrop(k)} className='btn btn-sm btn-outline-primary'
                disabled={selectedFile?.value == 'file' ? true : false}
                title='Add to Schema'>
                <FontAwesomeIcon icon={faPlusSquare} />
            </button>
        </div>
    ));

    const onSelectChange = (e: Option) => {
        if (e == null || parseInt(e.value) < 0 || parseInt(e.value) > generatedSchema.types.length) {
            sbToastError("Invalid Index. Setting index to default: end.")
            e = defaultInsertIdx;
        }
        setInsertAt(e);
    }

    const onDrop = (key: string) => {
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
            let tmpTypes = generatedSchema.types ? [...generatedSchema.types] : [];
            let tmpCards = [...cardsState];
            let updatedFieldCollapseState = [...fieldCollapseState]
            const type_name = getTypeName(tmpTypes, `${Types[key].key}-Name`);
            const tmpDef = Types[key].edit({ name: type_name });
            const dataIndex = generatedSchema.types?.length || 0;
            const new_card = {
                id: self.crypto.randomUUID(),
                index: dataIndex,
                text: type_name,
                value: tmpDef,
                isStarred: false
            }
            if (!insertAt || (insertAt && insertAt.value == "end")) {
                tmpTypes.push(tmpDef);
                tmpCards.push(new_card);
                if (Types[key].type == 'structure') {
                    updatedFieldCollapseState = [...fieldCollapseState, false]
                } else {
                    updatedFieldCollapseState = [...fieldCollapseState, undefined]
                }
            } else {
                if (insertAt.value == "0") {
                    new_card.index = 0;
                    tmpTypes.unshift(tmpDef);
                    tmpCards.unshift(new_card);

                    if (Types[key].type == 'structure') {
                        updatedFieldCollapseState = [false, ...fieldCollapseState]
                    } else {
                        updatedFieldCollapseState = [undefined, ...fieldCollapseState]
                    }

                } else {
                    const idx = parseInt(insertAt.value);
                    new_card.index = idx;

                    tmpTypes = [
                        ...tmpTypes.slice(0, idx),
                        tmpDef,
                        ...tmpTypes.slice(idx)
                    ];
                    tmpCards = [
                        ...tmpCards.slice(0, idx),
                        new_card,
                        ...tmpCards.slice(idx)
                    ];
                    if (Types[key].type == 'structure') {
                        updatedFieldCollapseState = [
                            ...fieldCollapseState.slice(0, idx),
                            false,
                            ...fieldCollapseState.slice(idx)
                        ];
                    } else {
                        updatedFieldCollapseState = [
                            ...fieldCollapseState.slice(0, idx),
                            undefined,
                            ...fieldCollapseState.slice(idx)
                        ];
                    }
                }
            }

            let updatedSchema = {
                ...generatedSchema,
                types: tmpTypes
            };

            flushSync(() => {
                setGeneratedSchema(updatedSchema);
                setCardsState(tmpCards);
                setFieldCollapseState(updatedFieldCollapseState);
            });
            setIsValidJADN(false);
            setIsValidating(false);

            onScrollToCard(new_card.index);

        } else {
            console.log('Error: OnDrop() in client/src/components/generate/schema/SchemaCreator.tsx');
        }
    }

    const onStarClick = (idx: number) => {
        const updatedCards = cardsState.map((item: DragItem, i: number) => {
            if (i === idx) {
                return ({ ...item, isStarred: !item.isStarred });
            } else {
                return item;
            }
        });

        setCardsState(updatedCards);
    };

    const onScrollToCard = (idx: number) => {
        listRef.current.scrollToItem(idx);
    }

    const changeIndex = (arrVal: TypeArray, dataIndex: number, idx: number) => {
        const val = zip(TypeKeys, arrVal) as StandardTypeObject;
        const type = val.type.toLowerCase() as keyof typeof Types;
        if (idx < 0) {
            sbToastError('Error: Cannot move Type up anymore');
            return;
        } else if (idx >= generatedSchema.types.length) {
            sbToastError('Error: Cannot move Type down anymore');
            return;
        }

        let tmpTypes = [...generatedSchema.types];
        tmpTypes = tmpTypes.filter((_t, i) => i !== dataIndex);

        tmpTypes = [
            ...tmpTypes.slice(0, idx),
            Types[type].edit(val),
            ...tmpTypes.slice(idx)
        ];

        let updatedSchema = {
            ...generatedSchema,
            types: tmpTypes
        };

        let tmpCards = [...cardsState];
        const moved_card = tmpCards[dataIndex];
        tmpCards = tmpCards.filter((_t, i) => i !== dataIndex);

        tmpCards = [
            ...tmpCards.slice(0, idx),
            moved_card,
            ...tmpCards.slice(idx)
        ];

        let updatedFieldCollapseState: Boolean[] = fieldCollapseStateRef.current;
        const originalIndexBool = updatedFieldCollapseState[dataIndex];
        updatedFieldCollapseState = updatedFieldCollapseState.filter((_bool: Boolean, i: number) =>
            i !== dataIndex
        );
        updatedFieldCollapseState = [
            ...updatedFieldCollapseState.slice(0, idx),
            originalIndexBool,
            ...updatedFieldCollapseState.slice(idx)
        ];
        setFieldCollapseState(updatedFieldCollapseState)

        setGeneratedSchema(updatedSchema);
        setCardsState(tmpCards);

        setIsValidJADN(false);
        setIsValidating(false);
        onScrollToCard(dataIndex);
    }

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
                    let updatedSchema = {
                        ...generatedSchema,
                        meta: {
                            ...generatedSchema.meta,
                            ...Meta[key].edit(val)
                        }
                    };

                    setGeneratedSchema(updatedSchema);
                    setIsValidJADN(false);
                    setIsValidating(false);

                },
                addTypeChange: (val: any) => {
                    const idx = generatedSchema.types.length;
                    const tmpTypes = [...generatedSchema.types];
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

        return (Types[type].btneditor({
            key: self.crypto.randomUUID(),
            value: def,
            dataIndex: index,
            customStyle: { ...style, height: 'auto' },
            setRowHeight: setRowHeight,
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
            setIsVisible: setVisibleType,
            change: (val, idx: number) => {
                const tmpTypes = [...generatedSchema.types];
                tmpTypes[idx] = Types[val.type.toLowerCase()].edit(val);

                const valArray: TypeArray = Object.values(val);
                const updatedCards = cardsState.map((card: DragItem, i: number) => {
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
                <div className={`tab-pane fade ${activeView == 'creator' ? 'show active' : ''}`} id="creator" role="tabpanel" aria-labelledby="creator-tab" tabIndex={0}>
                    <div className='row'>
                        <div id="schema-options" className='col-sm-3 pr-1 card-body-scroller'>
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
                            <div className='row mt-2'>
                                <AddToIndexDropDown insertAt={insertAt} indexOpts={indexOpts} onSelectChange={onSelectChange} />
                            </div>
                            <div className='row mt-2'>
                                <div className='col'>
                                    <ul className="nav nav-pills pb-2" id="viewKeys" role="tablist">
                                        <li className='nav-item'>
                                            <a
                                                className={`nav-link 
                                                    ${localActiveOpt == 'tree' && (selectedFile?.value == 'file' && !generatedSchema ? false : true) ? ' active bg-primary' : ''}
                                                    ${selectedFile?.value == 'file' && !generatedSchema ? 'disabled' : ''}`}
                                                onClick={() => setLocalActiveOpt('tree')}
                                                title="schema tree"
                                                data-bs-toggle="pill"
                                            >
                                                Schema Tree
                                            </a>
                                        </li>
                                        <li className='nav-item me-2'>
                                            <a
                                                className={`nav-link 
                                                    ${localActiveOpt == 'outline' && (selectedFile?.value == 'file' && !generatedSchema ? false : true) ? ' active bg-primary' : ''}
                                                    ${selectedFile?.value == 'file' && !generatedSchema ? 'disabled' : ''}`}
                                                onClick={() => setLocalActiveOpt('outline')}
                                                title="schema outline"
                                                data-bs-toggle="pill"
                                            >
                                                Outline
                                            </a>
                                        </li>
                                    </ul>
                                    <div className='tab-content mb-2'>
                                        <div className={`tab-pane fade ${localActiveOpt == 'outline' ? 'show active' : ''}`} id="outline" role="tabpanel" aria-labelledby="outline-tab" tabIndex={0}>
                                            <ul className="list-group">
                                                <SBOutlineBtnStyle
                                                    id={'schema-outline'}
                                                    cards={cardsState}
                                                    title={'Outline'}
                                                    visibleCard={visibleType}
                                                    changeIndex={changeIndex}
                                                    onStarClick={onStarClick}
                                                    onScrollToCard={onScrollToCard}
                                                />
                                            </ul>
                                        </div>
                                        <div className={`tab-pane fade ${localActiveOpt == 'tree' ? 'show active' : ''}`} id="tree" role="tabpanel" aria-labelledby="tree-tab" tabIndex={0}>
                                            <ul className="list-group">
                                                <SBTreeView schema={cardsState || {}} currType={cardsState.find(card => card.index === visibleType)?.text || ""} />
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="schema-editor" className='col-md-9 px-2 card-body-scroller'>
                            {isLoading ? <SBSpinner action={'Loading'} isDiv /> :
                                <>
                                    <div className='row'>
                                        <div className="col pt-2">
                                            <div className='card'>
                                                <div className='card-header bg-primary'>
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
                                                        <div>
                                                            {generatedSchema.meta ?
                                                                <>{metaEditors}</>
                                                                :
                                                                <><p>To add metadata make a selection from Meta</p></>
                                                            }
                                                        </div>
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
                                                            <h6 id="types" className='mb-0 pt-1 text-light'>Types* <small style={{ fontSize: '10px' }}> schema content </small></h6>
                                                        </div>
                                                        <div className='col'>
                                                            {generatedSchema.types &&
                                                                <>
                                                                    <div className="btn-group btn-group-sm float-end" role="group" aria-label="Basic example">
                                                                        <button type="button" className="btn btn-secondary" onClick={() => setTypesCollapse(!typesCollapse)}>
                                                                            {typesCollapse ? 'Show Types' : ' Hide Types'}
                                                                            <FontAwesomeIcon icon={typesCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                                className='float-end btn btn-sm'
                                                                                title={typesCollapse ? 'Show Types' : 'Hide Types'} />
                                                                        </button>
                                                                        <button type="button" className="btn btn-secondary" onClick={collapseAllFields}>
                                                                            {allFieldsCollapse ? 'Show Fields' : 'Hide Fields'}
                                                                            <FontAwesomeIcon icon={allFieldsCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                                className='float-end btn btn-sm'
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
                                                        <div>
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
                                                                            >
                                                                                {typesEditors}
                                                                            </List>
                                                                        )}
                                                                    </AutoSizer>
                                                                </div>
                                                                :
                                                                <><p>To add schema content make a selection from Types</p></>
                                                            }
                                                        </div>
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
export const SchemaCreatorBtnStyle = withSchemaCreator(SchemaCreatorBtn); 