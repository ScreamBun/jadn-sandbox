import React, { useState } from 'react';
//import equal from 'fast-deep-equal';
import {
  Button, ButtonGroup, FormGroup, Input, InputGroup, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import { PrimitiveTypeObject, StandardTypeObject, TypeKeys } from './consts';
import OptionsModal from './options/OptionsModal';
import FieldEditor from './FieldEditor';
import {
  EnumeratedFieldArray, FieldArray, StandardFieldArray, TypeArray
} from '../../interface';
import { zip } from '../../../../utils';


// Interface
interface StructureEditorProps {
  dataIndex: number; //index changes based on obj in arr (tracks the parent index)
  value: TypeArray;
  change: (v: PrimitiveTypeObject, i: number) => void;
  remove: (i: number) => void;
}

// Structure Editor
const StructureEditor = (props: StructureEditorProps) => {
  const { value, change, dataIndex } = props;

  const [fieldCollapse, setFieldCollapse] = useState(false);
  const [fieldCount, setFieldCount] = useState(1);
  const [modal, setModal] = useState(false);
  let valueObj = zip(TypeKeys, value) as StandardTypeObject;


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
          this.setState(prevState => ({
            fields: prevState.value.fields.map((f, i) => this.makeField(f, i))
          }));
        }
      }
    } */

  const removeAll = () => {
    const { dataIndex, remove } = props;
    remove(dataIndex);
  }

  const addField = () => {
    let field: EnumeratedFieldArray | StandardFieldArray;
    //const uid = new Date().getTime();
    if (valueObj.type.toLowerCase() === 'enumerated') {
      field = [fieldCount, '', ''] as EnumeratedFieldArray;
    } else {
      //TODO: default field type is String ? Fix line in field.tsx too.
      field = [fieldCount, 'field name', 'String', [], ''] as StandardFieldArray;
    }

    const updatevalue = { ...valueObj, fields: [...valueObj.fields, field] };
    change(updatevalue, dataIndex);
    setFieldCount(fieldCount => fieldCount + 1);
  }

  const fieldChange = (val: FieldArray, idx: number) => {
    const tmpFieldValues = [...valueObj.fields];
    tmpFieldValues[idx] = val;

    const updatevalue = { ...valueObj, fields: tmpFieldValues };
    change(updatevalue, dataIndex)
  };

  const fieldRemove = (idx: number) => {
    const tmpFieldValues = [...valueObj.fields];

    if (idx + 1 == valueObj.fields.length) {
      tmpFieldValues.pop();
    } else {
      tmpFieldValues.splice(idx, 1);
    }

    const updatevalue = { ...valueObj, fields: tmpFieldValues };
    change(updatevalue, dataIndex);
  };

  const saveModal = (modalData: Array<string>) => {
    setModal(!modal);
    const updatevalue = { ...valueObj, options: modalData }
    change(updatevalue, dataIndex);
  }

  //If the Derived Enumerations or Pointers extensions are present in type options, the Fields array MUST be empty.
  if ((valueObj.options.find(str => str.startsWith('#'))) || (valueObj.options.find(str => str.startsWith('>')))) {
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
            <Input type="text" placeholder="Name" value={valueObj.name} onChange={onChange} />
          </FormGroup>

          <FormGroup className="col-md-2">
            <Label>&nbsp;</Label>
            <InputGroup>
              <Button outline color="info" onClick={() => setModal(!modal)}>Type Options</Button>
              <OptionsModal
                optionValues={valueObj.options}
                isOpen={modal}
                optionType={valueObj.type}
                toggleModal={() => setModal(!modal)}
                saveModal={saveModal}
              />
            </InputGroup>
          </FormGroup>

          <FormGroup className="col-md-6">
            <Label>Comment</Label>
            <Input type="textarea" placeholder="Comment" rows={1} value={valueObj.comment} onChange={onChange} />
          </FormGroup>
        </div>
      </div>
    );
  }

  const fields: any[] = [];
  for (let i = 0; i < valueObj.fields.length; ++i) {
    fields.push(<FieldEditor
      key={valueObj.fields[i][0]}
      dataIndex={i}
      enumerated={valueObj.type.toLowerCase() === 'enumerated'}
      value={valueObj.fields[i]}
      change={fieldChange}
      remove={fieldRemove}
    />);
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
          <Input type="text" placeholder="Name" value={valueObj.name} onChange={onChange} />
        </FormGroup>

        <FormGroup className="col-md-2">
          <Label>&nbsp;</Label>
          <InputGroup>
            <Button outline color="info" onClick={() => setModal(!modal)}>Type Options</Button>
            <OptionsModal
              optionValues={valueObj.options}
              isOpen={modal}
              optionType={valueObj.type}
              toggleModal={() => setModal(!modal)}
              saveModal={saveModal}
            />
          </InputGroup>
        </FormGroup>

        <FormGroup className="col-md-6">
          <Label>Comment</Label>
          <Input type="textarea" placeholder="Comment" rows={1} value={valueObj.comment} onChange={onChange} />
        </FormGroup>

        <FormGroup tag="fieldset" className="col-12 border">
          <legend>
            {valueObj.type == 'Enumerated' ? 'Items' : 'Fields'}
            <ButtonGroup className="float-right">
              <Button color={fieldCollapse ? 'warning' : 'success'} onClick={() => setFieldCollapse(!fieldCollapse)}>
                <FontAwesomeIcon icon={fieldCollapse ? faMinusCircle : faPlusCircle} />
                &nbsp;
                {fieldCollapse ? ' Hide' : ' Show'}
              </Button>
              <Button color="primary" onClick={addField} >
                <FontAwesomeIcon icon={faPlusSquare} />
                &nbsp;
                Add
              </Button>
            </ButtonGroup>
          </legend>

          {fieldCollapse && fields}

          {!fieldCollapse && fields.length > 0 ? <p>Expand to view/edit fields</p> :
            fieldCollapse && fields.length == 0 ? <p> No fields to show</p> : ''}
        </FormGroup>
      </div>
    </div>
  );
}

export default StructureEditor;