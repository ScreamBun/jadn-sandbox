import React, { memo, useState } from 'react';
//import equal from 'fast-deep-equal';
import {
  Button, ButtonGroup, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, FormGroup, Input, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faMinusCircle, faSquareCaretDown, faSquareCaretUp } from '@fortawesome/free-solid-svg-icons';
import {
  FieldObject, EnumeratedFieldObject, EnumeratedFieldKeys, StandardFieldKeys, StandardFieldObject
} from './consts';
import OptionsModal from './options/OptionsModal';
import { EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray } from '../../interface';
import { objectValues, zip } from '../../../../utils';
import { useAppSelector } from '../../../../../reducers';
import { sbToastError } from 'components/common/SBToast';
import SBCreatableSelect from 'components/common/SBCreatableSelect';
import { Option } from 'components/common/SBSelect';

// Interface
interface FieldEditorProps {
  enumerated?: boolean;
  dataIndex: number;
  value: EnumeratedFieldArray | StandardFieldArray;
  change: (_v: EnumeratedFieldArray | StandardFieldArray, _i: number) => void;
  remove: (_i: number) => void;
  config: InfoConfig;
  changeIndex: (_v: FieldArray, _i: number, _j: number) => void;
}

// Field Editor
const FieldEditor = memo(function FieldEditor(props: FieldEditorProps) {
  const { enumerated, value, dataIndex, change, config, changeIndex } = props;
  //const allTypes = useAppSelector((state) => [...state.Util.types.base, ...Object.keys(state.Util.types.schema)]);
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
          <Input type="text" placeholder="Value" value={val.value} onChange={onChange} onBlur={onBlur} />
        </FormGroup>
      );
    }

    return (
      <div className="col-md-10 p-0 m-0">
        <FormGroup className="col-md-4 d-inline-block">
          <Label>Name</Label>
          <Input type="text" placeholder="Name" maxLength={64} value={val.name} onChange={onChange} onBlur={onBlur} />
        </FormGroup>

        <FormGroup className="col-md-4 d-inline-block">
          <Label>Type</Label>
          <SBCreatableSelect id="Type" name="Type" value={valType} onChange={onSelectChange} data={types} isGrouped />
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
      <Dropdown className='float-right' isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(prevState => !prevState)}>
        <DropdownToggle size='sm' title='More Options...'>
          <FontAwesomeIcon icon={faEllipsisV} />
        </DropdownToggle>
        <DropdownMenu >
          <DropdownItem color="info" onClick={() => changeIndex(value, dataIndex, dataIndex - 1)}>
            <FontAwesomeIcon icon={faSquareCaretUp} /> {`Move Field Up`}
          </DropdownItem>
          <DropdownItem color="info" onClick={() => changeIndex(value, dataIndex, dataIndex + 1)} >
            <FontAwesomeIcon icon={faSquareCaretDown} /> {`Move Field Down`}
          </DropdownItem>
          <DropdownItem onClick={removeAll} style={{ color: 'red' }} >
            <FontAwesomeIcon icon={faMinusCircle} /> {`Delete Field`}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

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
          <Input type="number" placeholder="ID" value={valueObj.id} onChange={onChange} onBlur={onBlur} />
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
            onBlur={onBlur}
          />
        </FormGroup>
      </div>
    </div>
  );
});

FieldEditor.defaultProps = {
  enumerated: false
};

export default FieldEditor;