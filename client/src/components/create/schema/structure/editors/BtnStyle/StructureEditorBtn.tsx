import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown19, faCircleChevronDown, faCircleChevronUp, faMinusCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import {
    FieldArray, InfoConfig
} from '../../../interface';
import { StandardTypeObject } from '../consts';
import OptionsModal from '../options/OptionsModal';
import { sbToastError } from 'components/common/SBToast';
import withStructureEditor from '../ParentEditor/withStructureEditor';
import { FieldEditorBtnStyle } from './FieldEditorBtn';

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

const StructureEditorBtn = memo(function StructureEditorBtn(props: StructureEditorProps) {
    const { dataIndex, config, customStyle, change, valueObj, setValueObj, isEditableID, fieldChange, onFieldRemoval, onAddField,
        rowRef, inViewRef, saveModal, toggleModal, modal, onRemoveItemClick, onChange, onBlur, fieldCollapse, setFieldCollapse, sortFields } = props;
    const moveField = (val: FieldArray, oldIndex: number, newIndex: number) => {
        let tmpFieldValues = [...valueObj.fields];

        if (newIndex < 0) {
            sbToastError('Error: Cannot move Type up anymore')
            return;
        } else if (newIndex >= tmpFieldValues.length) {
            sbToastError('Error: Cannot move Type down anymore')
            return;
        }
        //get other field to be moved
        const prevField = tmpFieldValues[newIndex];

        //If BaseType is Array or Record, FieldID MUST be the ordinal position of the field within the type, numbered consecutively starting at 1.
        if (!isEditableID) {
            //switch IDs
            const valID = val[0];
            const prevID = prevField[0];
            prevField[0] = valID;
            val[0] = prevID;
        }

        //switch fields
        tmpFieldValues[oldIndex] = prevField;
        tmpFieldValues[newIndex] = val;

        const updatevalue = { ...valueObj, fields: tmpFieldValues };
        setValueObj(updatevalue);
        change(updatevalue, dataIndex);
    }

    const fields: any[] = [];
    if (valueObj.fields) {
        for (let i = 0; i < valueObj.fields.length; ++i) {
            fields.push(<FieldEditorBtnStyle
                key={valueObj.fields[i][0]}
                enumerated={valueObj.type.toLowerCase() === 'enumerated'}
                parentIndex={dataIndex}
                dataIndex={i}
                value={valueObj.fields[i]}
                change={fieldChange}
                remove={onFieldRemoval}
                config={config}
                editableID={isEditableID}

                changeIndex={moveField}
                isFirst={i == 0}
                isLast={i == valueObj.fields.length - 1}
            />);
        }
    }

    return (
        <div className="card mb-3" id={`${dataIndex}`} ref={rowRef} style={customStyle}>
            <div className="card-header px-2 py-2" ref={inViewRef} >
                <div className='row'>
                    <div className='col'>
                        <span className="badge rounded-pill text-bg-secondary me-2" title='index'>
                            {dataIndex}
                        </span>
                        <span id={valueObj.name} className="card-title pt-1">{`${valueObj.name} (${valueObj.type})`}</span>
                    </div>
                    <div className='col'>
                        <button type='button' className="btn btn-danger btn-sm float-end" onClick={onRemoveItemClick}
                            title={`Delete ${valueObj.type}`}>
                            <FontAwesomeIcon icon={faMinusCircle} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body px-2 py-2">
                <div className="row">
                    <div className="col-md-4">
                        <label htmlFor={`name-${dataIndex}`} className='mb-0'>Name</label>
                        <input id={`name-${dataIndex}`} name="name" type="text" placeholder="Name" maxLength={64} className='form-control' value={valueObj.name} onChange={onChange} onBlur={onBlur} />
                    </div>
                    <div className="col-md-2 mt-4 text-center">
                        <button type='button' className='btn btn-primary btn-sm p-2' data-bs-toggle="modal" data-bs-target="#optionsModal" onClick={toggleModal}>Type Options</button>
                        <OptionsModal
                            id={`${dataIndex}`}
                            optionValues={valueObj.options}
                            isOpen={modal}
                            optionType={valueObj.type}
                            toggleModal={toggleModal}
                            saveModal={saveModal}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor={`comment-${dataIndex}`} className='mb-0'>Comment</label>
                        <input id={`comment-${dataIndex}`} name="comment" type="textarea" placeholder="Comment" className='form-control' value={valueObj.comment} onChange={onChange} onBlur={onBlur} />
                    </div>
                </div>
                <div className="row pt-2">
                    <div className="col-12">
                        <span>
                            {valueObj.type == 'Enumerated' ? 'Items' : 'Fields'} <span className="badge rounded-pill text-bg-secondary">{fields.length}</span>

                            <span
                                className="badge rounded-pill text-bg-primary cursor-pointer"
                                title='Add Field'
                                onClick={onAddField}>
                                <FontAwesomeIcon icon={faPlusSquare} />
                            </span>

                            <a href="#" role="button"
                                onClick={() => setFieldCollapse(!fieldCollapse, dataIndex)}>
                                <FontAwesomeIcon icon={fieldCollapse ? faCircleChevronDown : faCircleChevronUp}
                                    className='float-end btn btn-sm'
                                    title={fieldCollapse ? ' Show Fields' : ' Hide Fields'} />
                            </a>

                            {isEditableID ? <a href="#" role="button" onClick={sortFields}>
                                <FontAwesomeIcon icon={faArrowDown19}
                                    className='float-end btn btn-sm'
                                    title={'Sort Fields by ID'} />
                            </a> : ''}

                        </span>

                        <div>
                            {!fieldCollapse && fields}
                        </div>

                        {!fieldCollapse && fields.length == 0 ? <p className='mb-2'> No fields to show</p> : ''}

                        {!fieldCollapse &&
                            <button type='button' onClick={onAddField} className='btn btn-sm btn-primary btn-block rounded-pill'
                                title='Add Field'>
                                <FontAwesomeIcon icon={faPlusSquare} />
                            </button>}

                    </div>
                </div>
            </div>
        </div>
    );
});

export const StructureEditorBtnStyle = withStructureEditor(StructureEditorBtn);