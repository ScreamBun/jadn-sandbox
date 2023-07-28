import React, { useState } from 'react';
//import equal from 'fast-deep-equal';
import {
  Button, ButtonGroup, FormGroup, Input, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import {
  FieldObject, EnumeratedFieldObject, EnumeratedFieldKeys, StandardFieldKeys, StandardFieldObject
} from './consts';
import OptionsModal from './options/OptionsModal';
import { EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray } from '../../interface';
import { objectValues, splitCamel, zip } from '../../../../utils';
import { useAppSelector } from '../../../../../reducers';
import { sbToastError } from 'components/common/SBToast';

// Interface
interface FieldEditorProps {
  enumerated?: boolean;
  dataIndex: number;
  value: EnumeratedFieldArray | StandardFieldArray;
  change: (_v: EnumeratedFieldArray | StandardFieldArray, _i: number) => void;
  remove: (_i: number) => void;
  config: InfoConfig;
}

// Field Editor
const FieldEditor = (props: FieldEditorProps) => {
  const { enumerated, value, dataIndex, change, config } = props;
  const allTypes = useAppSelector((state) => [...state.Util.types.base, ...Object.keys(state.Util.types.schema)]);
  const types = useAppSelector((state) => ({
    base: state.Util.types.base,
    schema: Object.keys(state.Util.types.schema) || {}
  }));

  const [modal, setModal] = useState(false);
  const fieldKeys = enumerated ? EnumeratedFieldKeys : StandardFieldKeys;
  let valueObj = zip(fieldKeys, value) as FieldObject;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { placeholder, value } = e.target;
    if (enumerated) {
      if (!value) {
        sbToastError('Value required for Enum');
      }
    }
    const key = placeholder.toLowerCase();
    const updatevalue = { ...valueObj, [key]: value }
    change(objectValues(updatevalue as Record<string, any>) as FieldArray, dataIndex);
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
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

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name.toLowerCase();
    var updatevalue;
    if (name == 'Type') {
      //clear type options 
      updatevalue = { ...valueObj, options: [], [key]: value };
    } else {
      updatevalue = { ...valueObj, [key]: value };
    }
    change(objectValues(updatevalue as Record<string, any>) as FieldArray, dataIndex);
  }

  const removeAll = () => {
    const { dataIndex, remove } = props;
    remove(dataIndex);
  }

  const saveModal = (modalData: Array<string>) => {
    toggleModal();
    const updatevalue = { ...valueObj, options: modalData }
    change(objectValues(updatevalue as Record<string, any>) as FieldArray, dataIndex);
  }

  const toggleModal = () => {
    setModal(modal => !modal);
  }

  const makeOptions = () => {
    if (enumerated) {
      const val = valueObj as EnumeratedFieldObject;
      return (
        <FormGroup className="col-md-4">
          <Label>Value</Label>
          <Input type="text" placeholder="Value" value={val.value} onChange={onChange} />
        </FormGroup>
      );
    }

    const options = Object.keys(types).map(optGroup => (
      <optgroup key={optGroup} label={splitCamel(optGroup)} >
        {types[optGroup as 'base' | 'schema'].map((opt: any) => opt != '' ? <option key={opt} value={opt} >{opt}</option> : '')}
      </optgroup>
    ));

    const val = valueObj as StandardFieldObject;
    //default field type is String ? 
    const v = allTypes.includes(val.type) ? val.type : 'String';

    return (
      <div className="col-md-10 p-0 m-0">
        <FormGroup className="col-md-4 d-inline-block">
          <Label>Name</Label>
          <Input type="text" placeholder="Name" maxLength={64} value={val.name} onChange={onChange} onBlur={onBlur} />
        </FormGroup>

        <FormGroup className="col-md-4 d-inline-block">
          <Label>Type</Label>
          <select name="Type" className="form-control form-control-sm" value={v} onChange={onSelectChange}>
            {options}
          </select>
        </FormGroup>

        <FormGroup className="col-md-4 d-inline-block">
          <Button outline color="info" onClick={toggleModal}>Field Options</Button>
          <OptionsModal
            optionValues={val.options}
            isOpen={modal}
            saveModal={saveModal}
            toggleModal={toggleModal}
            optionType={val.type}
            fieldOptions
          />
        </FormGroup>
      </div>
    );
  }

  return (
    <div className="col-sm-12 border m-1 p-1">
      <ButtonGroup size="sm" className="float-right">
        <Button color="danger" onClick={removeAll} >
          <FontAwesomeIcon icon={faMinusCircle} />
        </Button>
      </ButtonGroup>

      <div className="border-bottom mb-2">
        <p className="col-sm-4 my-1">
          <strong>
            {enumerated ? (valueObj as EnumeratedFieldObject).value : (valueObj as StandardFieldObject).name}
          </strong>
        </p>
      </div>

      <div className="row m-0">
        <FormGroup className={enumerated ? 'col-md-3' : 'col-md-2'}>
          <Label>ID</Label>
          <Input type="number" placeholder="ID" value={valueObj.id} onChange={onChange} />
        </FormGroup>

        {makeOptions()}

        <FormGroup className={enumerated ? 'col-md-4' : 'col-md-12'}>
          <Label>Comment</Label>
          <Input
            type="textarea"
            placeholder="Comment"
            rows={1}
            value={valueObj.comment}
            onChange={onChange}
          />
        </FormGroup>
      </div>
    </div>
  );
}

FieldEditor.defaultProps = {
  enumerated: false
};

export default FieldEditor;