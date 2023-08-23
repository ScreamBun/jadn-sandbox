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
    <div className="border m-0 p-1">
      <ButtonGroup size="sm" className="float-right">
        <Button color="danger" onClick={removeAll}
          title={`Delete ${valueObj.type}`}
        >
          <FontAwesomeIcon icon={faMinusCircle} />
        </Button>
      </ButtonGroup>
      <ButtonGroup size="sm" className="float-right mr-1">
        <Button color="info" onClick={() => changeIndex(valueObj, dataIndex, dataIndex - 1)}
          title={`Move ${valueObj.type} Up`}
        >
          <FontAwesomeIcon icon={faSquareCaretUp} />
        </Button>
        <Button color="info" onClick={() => changeIndex(valueObj, dataIndex, dataIndex + 1)}
          title={`Move ${valueObj.type} Down`}
        >
          <FontAwesomeIcon icon={faSquareCaretDown} />
        </Button>
      </ButtonGroup>

      <div className="border-bottom mb-2">
        <h5 id={valueObj.name} className="col-sm-10 px-1 my-1">{`${valueObj.name}(${valueObj.type})`}</h5>
      </div>

      <div className="row m-0">
        <FormGroup className="col-md-4">
          <Label className='mb-0'>Name</Label>
          <Input type="text" placeholder="Name" maxLength={64} value={valueObj.name} onChange={onChange} onBlur={onBlur} />
        </FormGroup>

        <FormGroup className="col-md-2">
          <Label className='mb-0'>&nbsp;</Label>
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
        </FormGroup>

        <FormGroup className="col-md-6">
          <Label className='mb-0'>Comment</Label>
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

export default PrimitiveEditor;
