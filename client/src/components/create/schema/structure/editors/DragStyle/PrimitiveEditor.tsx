import React, { memo, useEffect, useState } from 'react';
//import equal from 'fast-deep-equal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { useInView } from 'react-intersection-observer';
import { zip } from '../../../../../utils';
import { InfoConfig } from '../../../interface';
import { StandardFieldKeys, StandardFieldObject, PrimitiveTypeObject, TypeKeys } from '../consts';
import OptionsModal from '../options/OptionsModal';
import { sbToastError } from 'components/common/SBToast';
import { SBConfirmModal } from 'components/common/SBConfirmModal';

// Interface
interface PrimitiveEditorProps {
  dataIndex: number;
  value: Array<any>;
  change: (v: PrimitiveTypeObject, i: number) => void;
  remove: (i: number) => void;
  setIsVisible: (i: number) => void;
  config: InfoConfig;
}

// Primitive Editor
const PrimitiveEditor = memo(function PrimitiveEditor(props: PrimitiveEditorProps) {
  const { value, dataIndex, config, change, setIsVisible } = props;

  //TODO: may need to add polyfill -- support for Safari
  const { ref, inView, entry } = useInView({
    fallbackInView: true,
    threshold: .25
  });

  const [modal, setModal] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  let valueObjInit: StandardFieldObject | PrimitiveTypeObject;
  if (Number.isInteger(value[0])) {
    valueObjInit = zip(StandardFieldKeys, value) as StandardFieldObject;
  } else {
    valueObjInit = zip(TypeKeys, value) as PrimitiveTypeObject;
  }
  const [valueObj, setValueObj] = useState(valueObjInit);
  let SBConfirmModalValName = valueObjInit.name;

  useEffect(() => {
    if (inView) {
      setIsVisible(dataIndex);
    }
  }, [entry])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { placeholder, value } = e.target;
    const key = placeholder.toLowerCase();
    setValueObj({ ...valueObj, [key]: value });
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { placeholder, value } = e.target;

    if (placeholder == "Name") {
      if (value.length >= 64) {
        sbToastError('Error: Max length reached');
        return;
      }
      if (value.includes(config.$Sys)) {
        sbToastError('Error: TypeNames SHOULD NOT contain the System character');
      }
      const regex = new RegExp(config.$TypeName, "g");
      if (!regex.test(value)) {
        sbToastError('Error: TypeName format is not permitted');
      }
    }

    const key = placeholder.toLowerCase();
    const updatevalue = { ...valueObj, [key]: value };
    if (JSON.stringify(valueObjInit) == JSON.stringify(updatevalue)) {
      return;
    }
    setValueObj(updatevalue);
    change(updatevalue, dataIndex);
  }

  const onRemoveItemClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const removeAll = (response: boolean) => {
    setIsConfirmModalOpen(false);
    if (response == true) {
      const { dataIndex, remove } = props;
      remove(dataIndex);
    }
  }

  const saveModal = (modalData: Array<string>) => {
    toggleModal();
    const prevState = [...valueObj.options];
    if (JSON.stringify(prevState) === JSON.stringify(modalData)) {
      return;
    }
    const updatevalue = { ...valueObj, options: modalData }
    setValueObj(updatevalue);
    change(updatevalue, dataIndex);
  }

  const toggleModal = () => {
    setModal(modal => !modal);
  }

  return (
    <>
      <div className={`card mb-3`} id={`${dataIndex}`} ref={ref}>
        <div className="card-header px-2 py-2">
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
      <SBConfirmModal
        isOpen={isConfirmModalOpen}
        title={`Remove ${SBConfirmModalValName}`}
        message={`Are you sure you want to remove ${SBConfirmModalValName}?`}
        confirm_value={dataIndex}
        onResponse={removeAll}>
      </SBConfirmModal>
    </>
  );
});

export default PrimitiveEditor;
