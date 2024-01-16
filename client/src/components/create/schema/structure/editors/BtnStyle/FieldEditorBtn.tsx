import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faSquareCaretDown, faSquareCaretUp } from '@fortawesome/free-solid-svg-icons';
import { EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray } from '../../../interface';
import SBSelect, { Option } from 'components/common/SBSelect';
import { EnumeratedFieldObject, StandardFieldObject } from '../consts';
import { ModalSize } from '../options/ModalSize';
import OptionsModal from '../options/OptionsModal';
import withFieldEditor from '../ParentEditor/withFieldEditor';

interface FieldEditorProps {
    id: any;
    enumerated?: boolean;
    parentIndex: number;
    dataIndex: number;
    value: EnumeratedFieldArray | StandardFieldArray;
    change: (_v: EnumeratedFieldArray | StandardFieldArray, _i: number) => void;
    remove: (_i: number) => void;
    config: InfoConfig;
    changeIndex: (_v: FieldArray, _i: number, _j: number) => void;
    editableID: boolean;
    isFirst: boolean;
    isLast: boolean;
    valueObj: EnumeratedFieldObject | StandardFieldObject;
    valType: Option;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    onSelectChange: (e: Option) => void;
    modal: boolean;
    saveModal: (modalData: Array<string>) => void;
    toggleModal: () => void;
    onRemoveItemClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    types: { base: string[]; schema: string[]; };
}


const FieldEditorBtn = memo(function FieldEditorBtn(props: FieldEditorProps) {
    const { enumerated, valueObj, valType, value, parentIndex, dataIndex, isFirst, isLast,
        changeIndex, onChange, onBlur, onSelectChange, editableID, types,
        modal, saveModal, toggleModal, onRemoveItemClick } = props;

    const makeOptions = () => {
        if (enumerated) {
            return (
                <div className="row m-0">
                    <div className='col-md-2'>
                        <label htmlFor={`id-${parentIndex}-${dataIndex}`}>ID</label>
                        <input id={`id-${parentIndex}-${dataIndex}`} name="id" type="number" placeholder="ID" className='form-control' value={valueObj.id}
                            onChange={onChange} onBlur={onBlur} />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor={`value-${parentIndex}-${dataIndex}`} >Value</label>
                        <input id={`value-${parentIndex}-${dataIndex}`} name="value" type="text" placeholder="Value" className='form-control' value={valueObj.value}
                            onChange={onChange} onBlur={onBlur} />
                    </div>
                    <div className='col-md-6'>
                        <label htmlFor={`comment-${parentIndex}-${dataIndex}`}>Comment</label>
                        <input
                            id={`comment-${parentIndex}-${dataIndex}`}
                            name="comment"
                            type="textarea"
                            className='form-control'
                            placeholder="Comment"
                            value={valueObj.comment}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    </div>
                </div>
            );
        }

        return (
            <>
                <div className="row">
                    <div className="col-md-2">
                        <label htmlFor={`id-${parentIndex}-${dataIndex}`} className='mb-0'>ID</label>
                        <input id={`id-${parentIndex}-${dataIndex}`}
                            name="id"
                            type="number"
                            placeholder="ID"
                            className={editableID ? 'form-control' : 'form-control-plaintext'}
                            value={valueObj.id}
                            onChange={onChange}
                            onBlur={onBlur}
                            readOnly={!editableID}
                            title={`${editableID ? '' : 'If BaseType is Array or Record, FieldID MUST be the ordinal position of the field within the type, numbered consecutively starting at 1.'}`} />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor={`name-${parentIndex}-${dataIndex}`} className='mb-0'>Name</label>
                        <input id={`name-${parentIndex}-${dataIndex}`}
                            name="name"
                            type="text"
                            placeholder="Name"
                            className='form-control'
                            maxLength={64}
                            value={valueObj.name}
                            onChange={onChange}
                            onBlur={onBlur} />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor={`type-${parentIndex}-${dataIndex}`} className='mb-0'>Type</label>
                        <SBSelect id={`type-${parentIndex}-${dataIndex}`}
                            name="type"
                            value={valType}
                            onChange={onSelectChange}
                            data={types}
                            isGrouped
                            isCreatable
                            isClearable />
                    </div>
                    <div className="col-md-2 d-flex">
                        <button type='button' className='btn btn-primary btn-sm p-2 mt-auto' data-bs-toggle="modal" data-bs-target="#optionsModal" onClick={toggleModal}>Field Options</button>
                        <OptionsModal
                            id={`${parentIndex}-${dataIndex}`}
                            optionValues={valueObj.options || []}
                            isOpen={modal}
                            saveModal={saveModal}
                            toggleModal={toggleModal}
                            optionType={valueObj.type}
                            modalSize={ModalSize.lg}
                            fieldOptions={true}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className='col-md-12'>
                        <label htmlFor={`comment-${parentIndex}-${dataIndex}`} className='mb-0'>Comment</label>
                        <input
                            id={`comment-${parentIndex}-${dataIndex}`}
                            name="comment"
                            type="textarea"
                            placeholder="Comment"
                            className='form-control'
                            value={valueObj.comment}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="card mb-2">
                <div className="card-body px-2 py-2">
                    <div className="btn-group float-end" role="group" aria-label="first button group">
                        {!isFirst &&
                            <button type='button' className='btn btn-sm btn-primary' onClick={() => changeIndex(value, dataIndex, dataIndex - 1)}
                                title={`Move Field Up`}>
                                <FontAwesomeIcon icon={faSquareCaretUp} />
                            </button>}
                        {!isLast && <button type='button' className='btn btn-sm btn-primary' onClick={() => changeIndex(value, dataIndex, dataIndex + 1)}
                            title={`Move Field Down`} >
                            <FontAwesomeIcon icon={faSquareCaretDown} />
                        </button>}
                    </div>
                    <button type='button' className='btn btn-danger btn-sm float-end'
                        onClick={onRemoveItemClick}
                        title={`Delete Field`}>
                        <FontAwesomeIcon icon={faMinusCircle} />
                    </button>

                    {makeOptions()}
                </div>
            </div>
        </>
    );
});

export const FieldEditorBtnStyle = withFieldEditor(FieldEditorBtn);
