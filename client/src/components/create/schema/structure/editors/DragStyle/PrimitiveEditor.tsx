import React, { memo, useState } from 'react';
//import equal from 'fast-deep-equal';
import {
  Button, ButtonGroup, FormGroup, Input, InputGroup, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

import { StandardFieldKeys, StandardFieldObject, PrimitiveTypeObject, TypeKeys } from '../consts';
import OptionsModal from '../options/OptionsModal';
import { zip } from '../../../../../utils';
import { sbToastError } from 'components/common/SBToast';
import { InfoConfig } from '../../../interface';

// Interface
interface PrimitiveEditorProps {
  dataIndex: number;
  value: Array<any>;
  change: (v: any, i: number) => void;
  remove: (i: number) => void;
  changeIndex: (v: PrimitiveTypeObject, dataIndex: number, i: number) => void;
  config: InfoConfig;
}

// Primitive Editor
const PrimitiveEditor = memo(function PrimitiveEditor(props: PrimitiveEditorProps) {
  const { value, change, dataIndex, config } = props;
  const [modal, setModal] = useState(false);

  let valueObjInit: StandardFieldObject | PrimitiveTypeObject;
  if (Number.isInteger(value[0])) {
    valueObjInit = zip(StandardFieldKeys, value) as StandardFieldObject;
  } else {
    valueObjInit = zip(TypeKeys, value) as PrimitiveTypeObject;
  }
  const [valueObj, setValueObj] = useState(valueObjInit);

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

  const removeAll = () => {
    const { dataIndex, remove } = props;
    remove(dataIndex);
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
      <div className="card border-secondary mb-3"> 
          <div className="card-header px-2 py-2">
            <div className='row'>
              <div className='col'>
                <span id={valueObj.name} className="card-title">{`${valueObj.name} (${valueObj.type})`}</span>
              </div>
              <div className='col'>
                <Button color="danger" className="float-right btn-sm" onClick={removeAll} title={`Delete ${valueObj.type}`}>
                  <FontAwesomeIcon icon={faMinusCircle} />
                </Button>
              </div>
            </div>
          </div>
          <div className="card-body px-2 pt-2 pb-3">
            <div className="row">
              <div className="col-md-12">
                <div className='row'>
                  <div className='col-md-4'>
                    <label htmlFor="name" className='mb-0'>Name</label>
                  </div>             
                  <div className='col-md-6 offset-md-2'>
                    <label htmlFor="name" className='mb-0'>Comment</label>
                  </div>                                
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <Input type="text" placeholder="Name" maxLength={64} value={valueObj.name} onChange={onChange} onBlur={onBlur} />
                  </div>
                  <div className="col-md-2 text-center px-0">
                    <Button color="primary" className='px-2 py-1 btn-sm' onClick={toggleModal}>Type Options</Button>
                      <OptionsModal
                        optionValues={valueObj.options}
                        isOpen={modal}
                        optionType={valueObj.type}
                        toggleModal={toggleModal}
                        saveModal={saveModal}
                      />
                  </div>
                  <div className="col-md-6">
                    <Input type="textarea" placeholder="Comment" className='form-control form-control-sm' rows={1} value={valueObj.comment} onChange={onChange} onBlur={onBlur} />
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>    
    </>
  );
});

export default PrimitiveEditor;
