import React, { memo, useState } from 'react';
//import equal from 'fast-deep-equal';
import {
  Button, FormGroup, Input, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import {
  FieldObject, EnumeratedFieldObject, EnumeratedFieldKeys, StandardFieldKeys, StandardFieldObject
} from '../consts';
import OptionsModal from '../options/OptionsModal';
import { EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray } from '../../../interface';
import { objectValues, zip } from '../../../../../utils';
import { useAppSelector } from '../../../../../../reducers';
import { sbToastError } from 'components/common/SBToast';
import SBCreatableSelect from 'components/common/SBCreatableSelect';
import { Option } from 'components/common/SBSelect';
import { ModalSize } from '../options/ModalSize';


interface FieldEditorProps {
  enumerated?: boolean;
  dataIndex: number;
  value: EnumeratedFieldArray | StandardFieldArray;
  change: (_v: EnumeratedFieldArray | StandardFieldArray, _i: number) => void;
  remove: (_i: number) => void;
  config: InfoConfig;
  changeIndex: (_v: FieldArray, _i: number, _j: number) => void;
}


const FieldEditor = memo(function FieldEditor(props: FieldEditorProps) {
  const { enumerated, value, dataIndex, change, config } = props;
  const types = useAppSelector((state) => ({
    base: state.Util.types.base,
    schema: Object.keys(state.Util.types.schema) || {}
  }));

  const [modal, setModal] = useState(false);
  const fieldKeys = enumerated ? EnumeratedFieldKeys : StandardFieldKeys;
  const valueObjInit = zip(fieldKeys, value) as FieldObject;
  const [valueObj, setValueObj] = useState(valueObjInit);
  const val = valueObj as StandardFieldObject;
  const [valType, setValType] = useState({ value: val.type, label: val.type });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { placeholder, value } = e.target;
    if (enumerated) {
      if (!value) {
        sbToastError('Value required for Enum');
      }
    }
    const key = placeholder.toLowerCase();
    setValueObj({ ...valueObj, [key]: value });
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { placeholder, value } = e.target;

    if (placeholder == "Name") {
      if (value.includes('/')) {
        sbToastError('Error: FieldNames MUST NOT contain the JSON Pointer field separator "/", which is reserved for use in the Pointers extension.');
        return;
      }
      if (value.length >= 64) {
        sbToastError('Error: Max length reached');
        return;
      }
      const regex = new RegExp(config.$FieldName, "g");
      if (!regex.test(value)) {
        sbToastError('Error: FieldName format is not permitted');
      }
    }

    const key = placeholder.toLowerCase();
    const updatevalue = { ...valueObj, [key]: value }
    if (JSON.stringify(valueObjInit) == JSON.stringify(updatevalue)) {
      return;
    }
    setValueObj(updatevalue);
    change(objectValues(updatevalue as Record<string, any>) as FieldArray, dataIndex);
  }

  const onSelectChange = (e: Option) => {
    var updatevalue
    //clear type options 
    if (e == null) {
      //default field type is String
      setValType({ value: 'String', label: 'String' });
      updatevalue = { ...valueObj, options: [], ['type']: 'String' };

    } else {
      setValType(e);
      updatevalue = { ...valueObj, options: [], ['type']: e.value };
    }

    setValueObj(updatevalue);
    change(objectValues(updatevalue as Record<string, any>) as FieldArray, dataIndex);
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
    // change(updatevalue, dataIndex);
    change(objectValues(updatevalue as Record<string, any>) as FieldArray, dataIndex);
  }

  const toggleModal = () => {
    setModal(modal => !modal);
  }

  const makeOptions = () => {
    if (enumerated) {
      const val = valueObj as EnumeratedFieldObject;
      return (
        <div className="row m-0">
          <FormGroup className='col-md-2'>
            <Label>ID</Label>
            <Input type="number" placeholder="ID" value={valueObj.id} onChange={onChange} onBlur={onBlur} />
          </FormGroup>        
          <div className="col-md-4">
            <Label>Value</Label>
            <Input type="text" placeholder="Value" value={val.value} onChange={onChange} onBlur={onBlur} />
          </div>
          <FormGroup className='col-md-6'>
            <Label>Comment</Label>
            <Input
              type="textarea"
              placeholder="Comment"
              rows={1}
              value={valueObj.comment}
              onChange={onChange}
              onBlur={onBlur}
            />
          </FormGroup>  
        </div>        
      );
    }

    return (
      <>
        <div className="row">
          <div className="col-md-6">
            <Label className='mb-0'>Name</Label>
          </div>
          <div className="col-md-4">
            <Label className='mb-0'>Type</Label>
          </div>
        </div>      
        <div className="row">
          <div className="col-md-6">
            <Input type="text" placeholder="Name" maxLength={64} value={val.name} onChange={onChange} onBlur={onBlur} />
          </div>
          <div className="col-md-4">
            <SBCreatableSelect id="Type" name="Type" value={valType} onChange={onSelectChange} data={types} isGrouped />
          </div>
          <div className="col-md-2">
            <Button color="primary" className='btn-sm p-2' onClick={toggleModal}>Field Options</Button>
            <OptionsModal
              optionValues={val.options}
              isOpen={modal}
              saveModal={saveModal}
              toggleModal={toggleModal}
              optionType={val.type}
              modalSize={ModalSize.lg}
              fieldOptions={true}
            />
          </div>
        </div>
        <div className="row">
          <FormGroup className='col-md-12'>
            <Label>Comment</Label>
            <Input
              type="textarea"
              placeholder="Comment"
              rows={1}
              value={valueObj.comment}
              onChange={onChange}
              onBlur={onBlur}
            />
          </FormGroup>           
        </div>
      </>
    );
  }

  return (
    <>
      <div className="card border-secondary mb-2">
        <div className="card-header px-2 py-2">
          <div className='row'>
            <div className='col'>
              <span className="card-title">{enumerated ? (valueObj as EnumeratedFieldObject).value : (valueObj as StandardFieldObject).name}</span>
            </div>
            <div className='col'>
              <Button color="danger" className="float-right btn-sm" onClick={removeAll}  title={`Delete Field`}>
                <FontAwesomeIcon icon={faMinusCircle} />
              </Button>
            </div>
          </div>      
        </div>
        <div className="card-body px-2 py-2">
            {makeOptions()}
        </div>
      </div>    
    </>
  );
});

FieldEditor.defaultProps = {
  enumerated: false
};

export default FieldEditor;