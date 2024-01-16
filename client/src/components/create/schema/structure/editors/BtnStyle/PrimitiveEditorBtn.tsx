import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import OptionsModal from '../options/OptionsModal';
import { PrimitiveTypeObject, StandardTypeObject } from '../consts';
import withPrimitiveEditor from '../ParentEditor/withPrimitiveEditor';

interface PrimitiveEditorProps {
    dataIndex: number;
    valueObj: PrimitiveTypeObject | StandardTypeObject;
    customStyle: any;
    rowRef: any;
    inViewRef: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    modal: boolean;
    saveModal: (modalData: Array<string>) => void;
    toggleModal: () => void;
    onRemoveItemClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const PrimitiveEditorBtn = memo(function PrimitiveEditorBtn(props: PrimitiveEditorProps) {
    const { valueObj, dataIndex, customStyle, rowRef, inViewRef, onChange, onBlur, modal, toggleModal, saveModal, onRemoveItemClick } = props;

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
                        <button type='button' className='btn btn-sm btn-danger float-end' onClick={onRemoveItemClick} title={`Delete ${valueObj.type}`}>
                            <FontAwesomeIcon icon={faMinusCircle} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body px-2 py-2">
                <div className="row m-0">
                    <div className="col-md-4">
                        <label htmlFor={`name-${dataIndex}`} className='mb-0'>Name</label>
                        <input
                            id={`name-${dataIndex}`}
                            name="name"
                            type="text"
                            placeholder="Name"
                            maxLength={64}
                            className='form-control'
                            value={valueObj.name}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
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
                        <input
                            id={`comment-${dataIndex}`}
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
            </div>
        </div>
    );
});

export const PrimitiveEditorBtnStyle = withPrimitiveEditor(PrimitiveEditorBtn);
