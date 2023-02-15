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
import OptionsModal from './options';
import { EnumeratedFieldArray, FieldArray, StandardFieldArray } from '../../interface';
import { objectValues, splitCamel, zip } from '../../../../utils';
import { useAppSelector } from '../../../../../reducers';

// Interface
interface FieldEditorProps {
  enumerated?: boolean;
  dataIndex: number;
  value: EnumeratedFieldArray | StandardFieldArray;
  change: (_v: EnumeratedFieldArray | StandardFieldArray, _i: number) => void;
  remove: (_i: number) => void;
}

// Field Editor
const FieldEditor = (props: FieldEditorProps) => {
  const { enumerated, value, dataIndex, change } = props;
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
    const key = placeholder.toLowerCase();
    const updatevalue = { ...valueObj, [key]: value }
    change(objectValues(updatevalue as Record<string, any>) as FieldArray, dataIndex);
  }

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name.toLowerCase();
    const updatevalue = { ...valueObj, [key]: value }
    change(objectValues(updatevalue as Record<string, any>) as FieldArray, dataIndex);
  }

  /* initState() {
    const { value } = this.props;
    if (value && Array.isArray(value)) {
      const updatevalue = zip(this.fieldKeys, value);

      // eslint-disable-next-line react/destructuring-assignment
      if (!equal(updatevalue, this.state.value)) {
        this.setState(prevState => ({
          value: {
            ...prevState.value,
            ...updatevalue
          }
        }));
      }
    }
  }
 */

  const removeAll = () => {
    const { dataIndex, remove } = props;
    remove(dataIndex);
  }

  const saveModal = (modalData: Array<string>) => {
    setModal(modal => !modal);
    const updatevalue = { ...valueObj, options: modalData }
    change(objectValues(updatevalue as Record<string, any>) as FieldArray, dataIndex);
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
        {types[optGroup as 'base' | 'schema'].map((opt: any) => <option key={opt} value={opt} >{opt}</option>)}
      </optgroup>
    ));

    const val = valueObj as StandardFieldObject;
    //TODO: default field type is String ? 
    const v = allTypes.includes(val.type) ? val.type : 'String';

    return (
      <div className="col-md-10 p-0 m-0">
        <FormGroup className="col-md-4 d-inline-block">
          <Label>Name</Label>
          <Input type="text" placeholder="Name" value={val.name} onChange={onChange} />
        </FormGroup>

        <FormGroup className="col-md-4 d-inline-block">
          <Label>Type</Label>
          <select id="Type" name="Type" className="form-control form-control-sm" value={v} onChange={onSelectChange}>
            {options}
          </select>
        </FormGroup>

        <FormGroup className="col-md-4 d-inline-block">
          <Button outline color="info" onClick={() => setModal(!modal)}>Field Options</Button>
          <OptionsModal
            optionValues={val.options}
            isOpen={modal}
            saveModal={saveModal}
            toggleModal={() => setModal(!modal)}
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