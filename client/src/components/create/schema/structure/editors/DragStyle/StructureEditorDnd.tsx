import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown19, faCircleChevronDown, faCircleChevronUp, faMinusCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import {
    FieldArray,
    InfoConfig
} from '../../../interface';
import { StandardTypeObject } from '../consts';
import OptionsModal from '../options/OptionsModal';
import { ModalSize } from '../options/ModalSize';
import withStructureEditor from '../ParentEditor/withStructureEditor';
import SBOutlineFields, { DragItem } from './SBOutlineFields';

interface StructureEditorProps {
    dataIndex: number; //index changes based on obj in arr (tracks the parent index)
    customStyle: any;
    change: (v: StandardTypeObject, i: number) => void;
    config: InfoConfig;
    isEditableID: boolean;
    rowRef: any;
    inViewRef: any;
    valueObj: StandardTypeObject;
    setValueObj: (value: StandardTypeObject) => void;
    onRemoveItemClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    modal: boolean;
    toggleModal: () => void;
    saveModal: (modalData: Array<string>) => void;
    fieldCollapse: boolean;
    setFieldCollapse: (fieldCollapse: boolean, idx: number) => void;
    sortFields: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    fieldChange: (val: FieldArray, idx: number) => void;
    onAddField: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onFieldRemoval: (idx: number) => void;
}

const StructureEditorDnd = memo(function StructureEditorDnd(props: StructureEditorProps) {
    const { dataIndex, config, customStyle, change, valueObj, setValueObj, isEditableID,
        fieldChange, onFieldRemoval, onAddField, rowRef, inViewRef,
        saveModal, toggleModal, modal, onRemoveItemClick, onChange, onBlur,
        fieldCollapse, setFieldCollapse, sortFields } = props;

    const onOutlineDrop = (item: DragItem) => {
        let reordered_types: any[] = [...valueObj.fields];
        reordered_types.splice(item.originalIndex, 1);
        reordered_types.splice(item.dataIndex, 0, item.value);

        //If BaseType is Array or Record, FieldID MUST be the ordinal position of the field within the type, numbered consecutively starting at 1.
        if (!isEditableID) {
            reordered_types = reordered_types.map((item, index) => {
                item[0] = index + 1;
                return item;
            });
        }

        let updatedData = {
            ...valueObj,
            fields: reordered_types
        };
        setValueObj(updatedData);
        change(updatedData, dataIndex);
    };

    return (
        <div className={`card mb-2`} id={`${dataIndex}`} ref={rowRef} style={customStyle} >
            <div className="card-header px-2 py-2" ref={inViewRef} >
                <div className='row' >
                    <div className='col' >
                        <span id={valueObj.name} className="card-title" > {`${valueObj.name} (${valueObj.type})`}</span>
                    </div>
                    < div className='col' >
                        <button type='button' className="float-end btn btn-danger btn-sm" onClick={onRemoveItemClick} title={`Delete ${valueObj.type}`}>
                            <FontAwesomeIcon icon={faMinusCircle} />
                        </button>
                    </div>
                </div>
            </div>
            < div className="card-body px-2 pt-2 pb-3" >
                <div className="row" >
                    <div className="col-md-12" >
                        <div className='row' >
                            <div className='col-md-4' >
                                <label htmlFor={`name-${dataIndex}`} className='mb-0' > Name </label>
                            </div>
                            < div className='col-md-6 offset-md-2' >
                                <label htmlFor={`comment-${dataIndex}`} className='mb-0' > Comment </label>
                            </div>
                        </div>
                        < div className="row" >
                            <div className="col-md-4" >
                                <input id={`name-${dataIndex}`} name="name" type="text" className='form-control' placeholder="Name" maxLength={64} value={valueObj.name}
                                    onChange={onChange} onBlur={onBlur} />
                            </div>
                            < div className="col-md-2 text-center px-0" >
                                <button type='button' className='btn btn-primary btn-sm p-2' data-bs-toggle="modal" data-bs-target="#optionsModal" onClick={toggleModal} > Type Options </button>
                                < OptionsModal
                                    id={`${dataIndex}`}
                                    optionValues={valueObj.options}
                                    isOpen={modal}
                                    optionType={valueObj.type}
                                    toggleModal={toggleModal}
                                    saveModal={saveModal}
                                    modalSize={ModalSize.lg}
                                />
                            </div>
                            < div className="col-md-6" >
                                <input id={`comment-${dataIndex}`} name="comment" type="textarea" placeholder="Comment" className='form-control' value={valueObj.comment}
                                    onChange={onChange} onBlur={onBlur} />
                            </div>
                        </div>
                    </div>
                </div>
                < div className="row pt-2" >
                    <div className="col-12" >
                        <span>
                            {valueObj.type == 'Enumerated' ? 'Items' : 'Fields'} < span className="badge rounded-pill text-bg-secondary" > {valueObj.fields?.length} </span>

                            < span
                                className="badge rounded-pill text-bg-primary ms-1 cursor-pointer"
                                title='Add Field'
                                onClick={onAddField} >
                                <FontAwesomeIcon icon={faPlusSquare} />
                            </span>

                            < a href="#" role="button"
                                onClick={() => setFieldCollapse(!fieldCollapse, dataIndex)}>
                                <FontAwesomeIcon icon={fieldCollapse ? faCircleChevronDown : faCircleChevronUp}
                                    className='float-end btn btn-sm'
                                    title={fieldCollapse ? ' Show Fields' : ' Hide Fields'} />
                            </a>

                            {
                                isEditableID ? <a href="#" role="button" onClick={sortFields} >
                                    <FontAwesomeIcon icon={faArrowDown19}
                                        className='float-end btn btn-sm'
                                        title={'Sort Fields by ID'} />
                                </a> : <></>}

                        </span>

                        {
                            !fieldCollapse ? valueObj.fields?.length == 0 ? <p>No fields to show </p> :
                                <div>
                                    <SBOutlineFields
                                        id={'fields-outline'}
                                        items={valueObj.fields}
                                        onDrop={onOutlineDrop}
                                        isEnumerated={valueObj.type.toLowerCase() === 'enumerated'}
                                        fieldChange={fieldChange}
                                        fieldRemove={onFieldRemoval}
                                        editableID={isEditableID}
                                        config={config}
                                        acceptableType={`${dataIndex}`}
                                        parentIndex={dataIndex}
                                    />
                                </div>
                                : <></>
                        }

                        {
                            !fieldCollapse ?
                                <button type='button' onClick={onAddField} className='btn btn-sm btn-primary btn-block rounded-pill'
                                    title='Add Field' >
                                    <FontAwesomeIcon icon={faPlusSquare} />
                                </button>
                                : <></>
                        }

                    </div>
                </div>
            </div>
        </div>
    );
});

export const StructureEditorDndStyle = withStructureEditor(StructureEditorDnd);