import React, { useState } from 'react';
//import equal from 'fast-deep-equal';
import {
  Button, ButtonGroup, FormGroup, Input, InputGroup, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

import { StandardFieldKeys, StandardFieldObject, PrimitiveTypeObject, TypeKeys } from './consts';
import OptionsModal from './options/OptionsModal';
import { zip } from '../../../../utils';

// Interface
interface PrimitiveEditorProps {
  dataIndex: number;
  value: Array<any>;
  change: (v: any, i: number) => void;
  remove: (i: number) => void;
}

// Primitive Editor
const PrimitiveEditor = (props: PrimitiveEditorProps) => {
  const { value, change, dataIndex } = props;
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

  /*   initState() {
      const { value } = this.props;
      if (value && Array.isArray(value)) {
        const updatevalue = zip(TypeKeys, value);
  
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
    } */

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

      <div className="border-bottom mb-2">
        <h5 className="col-sm-10 px-1 my-1">{`${valueObj.name}(${valueObj.type})`}</h5>
      </div>

      <div className="row m-0">
        <FormGroup className="col-md-4">
          <Label>Name</Label>
          <Input type="text" placeholder="Name" maxLength={64} value={valueObj.name} onChange={onChange} />
        </FormGroup>

        <FormGroup className="col-md-2">
          <Label>&nbsp;</Label>
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

export default PrimitiveEditor;
