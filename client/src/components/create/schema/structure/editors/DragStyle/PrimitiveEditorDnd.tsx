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

const PrimitiveEditorDnd = memo(function PrimitiveEditorDnd(props: PrimitiveEditorProps) {
  const { valueObj, dataIndex, customStyle, rowRef, inViewRef, onChange, onBlur, modal, toggleModal, saveModal, onRemoveItemClick } = props;

  return (
    <>
      <div className={`card mb-3`} id={`${dataIndex}`} ref={rowRef} style={customStyle}>
        <div className="card-header px-2 py-2" ref={inViewRef}>
          <div className='row'>
            <div className='col'>
              <span id={valueObj.name} className="card-title">{`${valueObj.name} (${valueObj.type})`}</span>
            </div>
            <div className='col'>
              <button type='button' className="float-end btn btn-danger btn-sm" onClick={onRemoveItemClick} title={`Delete ${valueObj.type}`}>
                <FontAwesomeIcon icon={faMinusCircle} />
              </button>
            </div>
          </div>
        </div>
        <div className="card-body px-2 pt-2 pb-3">
          <div className="row">
            <div className="col-md-12">
              <div className='row'>
                <div className='col-md-4'>
                  <label htmlFor={`name-${dataIndex}`} className='mb-0'>Name</label>
                </div>
                <div className='col-md-6 offset-md-2'>
                  <label htmlFor={`comment-${dataIndex}`} className='mb-0'>Comment</label>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <input id={`name-${dataIndex}`} name="name" type="text" className='form-control' placeholder="Name" maxLength={64} value={valueObj.name}
                    onChange={onChange} onBlur={onBlur} />
                </div>
                <div className="col-md-2 text-center px-0">
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
                  <input id={`comment-${dataIndex}`} name="comment" type="textarea" placeholder="Comment" className='form-control'
                    value={valueObj.comment} onChange={onChange} onBlur={onBlur} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export const PrimitiveEditorDndStyle = withPrimitiveEditor(PrimitiveEditorDnd);
