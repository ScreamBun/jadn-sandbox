import React, { memo, useState } from 'react';
//import equal from 'fast-deep-equal';
import {
  Button, ButtonGroup, FormGroup, Input, InputGroup, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faSquareCaretDown, faSquareCaretUp } from '@fortawesome/free-solid-svg-icons';

import { StandardFieldKeys, StandardFieldObject, PrimitiveTypeObject, TypeKeys } from './consts';
import OptionsModal from './options/OptionsModal';
import { zip } from '../../../../utils';
import { sbToastError } from 'components/common/SBToast';
import { InfoConfig } from '../../interface';

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
  const { value, change, changeIndex, dataIndex, config } = props;
  let valueObj: StandardFieldObject | PrimitiveTypeObject;
  if (Number.isInteger(value[0])) {
    valueObj = zip(StandardFieldKeys, value) as StandardFieldObject;
  } else {
    valueObj = zip(TypeKeys, value) as PrimitiveTypeObject;
  }

  const [modal, setModal] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { placeholder, value } = e.target;
    const key = placeholder.toLowerCase();
    const updatevalue = { ...valueObj, [key]: value }
    change(updatevalue, dataIndex);
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
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

  const removeAll = () => {
    const { dataIndex, remove } = props;
    remove(dataIndex);
  }

  const saveModal = (modalData: Array<string>) => {
    toggleModal();
    const updatevalue = { ...valueObj, options: modalData }
    change(updatevalue, dataIndex);
  }

  const toggleModal = () => {
    setModal(modal => !modal);
  }

  return (
    <div className="border m-1 p-1">
      <ButtonGroup size="sm" className="float-right">
        <Button color="danger" onClick={removeAll} >
          <FontAwesomeIcon icon={faMinusCircle} />
        </Button>
      </ButtonGroup>
      <ButtonGroup size="sm" className="float-right mr-1">
        <Button color="info" onClick={() => changeIndex(valueObj, dataIndex, dataIndex - 1)} >
          <FontAwesomeIcon icon={faSquareCaretUp} />
        </Button>
        <Button color="info" onClick={() => changeIndex(valueObj, dataIndex, dataIndex + 1)} >
          <FontAwesomeIcon icon={faSquareCaretDown} />
        </Button>
      </ButtonGroup>

      <div className="border-bottom mb-2">
        <h5 className="col-sm-10 px-1 my-1">{`${valueObj.name}(${valueObj.type})`}</h5>
      </div>

      <div className="row m-0">
        <FormGroup className="col-md-4">
          <Label>Name
            <Input type="text" placeholder="Name" maxLength={64} value={valueObj.name} onChange={onChange} onBlur={onBlur} />
          </Label>
        </FormGroup>

        <FormGroup className="col-md-2">
          <Label>&nbsp;
            <InputGroup>
              <Button outline color="info" onClick={toggleModal}>Type Options</Button>
              <OptionsModal
                optionValues={valueObj.options}
                isOpen={modal}
                optionType={valueObj.type}
                toggleModal={toggleModal}
                saveModal={saveModal}
              />
            </InputGroup>
          </Label>
        </FormGroup>

        <FormGroup className="col-md-6">
          <Label>Comment
            <Input
              type="textarea"
              placeholder="Comment"
              rows={1}
              value={valueObj.comment}
              onChange={onChange}
            />
          </Label>
        </FormGroup>
      </div>
    </div>
  );
});

export default PrimitiveEditor;
