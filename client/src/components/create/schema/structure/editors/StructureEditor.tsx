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
import { sbToastError } from 'components/common/SBToast';
import { useAppSelector } from 'reducers';


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
  const predefinedTypes = useAppSelector((state) => [...state.Util.types.base]);

  const [fieldCollapse, setFieldCollapse] = useState(false);
  const [modal, setModal] = useState(false);
  let valueObj = zip(TypeKeys, value) as StandardTypeObject;
  let fieldCount = 1;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //check type name
    const { placeholder, value } = e.target;
    if (placeholder == "Name") {
      if (predefinedTypes.includes(value.toLowerCase())) {
        sbToastError('Error: TypeName MUST NOT be a JADN predefined type');
        return;
      }
      if (value.length >= 64) {
        sbToastError('Error: Max length reached');
        return;
      }
      if (value.includes('$')) {
        sbToastError('Error: TypeNames SHOULD NOT contain the System character');
        return;
      }
    }
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
    //create unique ID
    const currMaxID = Math.max(...listID);
    if (currMaxID && fieldCount <= currMaxID) {
      fieldCount = currMaxID + 1;
    }
    let fieldName;
    if (valueObj.type.toLowerCase() === 'enumerated') {
      fieldName = 'field_value_' + fieldCount;
      field = [fieldCount, fieldName, ''] as EnumeratedFieldArray;
    } else {
      //default field type is String
      fieldName = 'field_name_' + fieldCount;
      field = [fieldCount, fieldName, 'String', [], ''] as StandardFieldArray;
    }
    const updatevalue = { ...valueObj, fields: [...valueObj.fields, field] };
    change(updatevalue, dataIndex);
    fieldCount = fieldCount + 1;
  }

  const fieldChange = (val: FieldArray, idx: number) => {
    //check field ID and field name
    if (listID.includes(val[0])) {
      sbToastError('Error: FieldID must be unique');
      return;
    }

    for (let i = 0; i < fields.length; i++) {
      var name = fields[i].props.value[1];
      if (name == val[1] && i != idx) {
        sbToastError('Error: FieldName must be unique');
        return;
      }
    }

    if (typeof val[0] != 'number') {
      val[0] = parseInt(val[0]); //force index to type number
    }
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
    toggleModal();
    const updatevalue = { ...valueObj, options: modalData }
    change(updatevalue, dataIndex);
  }

  const toggleModal = () => {
    setModal(modal => !modal);
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
            <Input type="textarea" placeholder="Comment" rows={1} value={valueObj.comment} onChange={onChange} />
          </FormGroup>
        </div>
      </div>
    );
  }

  //FieldType MUST be a Primitive type, ArrayOf, MapOf, or a model-defined type. 
  //no enum, choice, map, array, record
  const fields: any[] = [];
  if (valueObj.fields) {
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
  }
  const listID = fields.map(field => field.key);

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
          <Input type="textarea" placeholder="Comment" rows={1} value={valueObj.comment} onChange={onChange} />
        </FormGroup>

        <FormGroup tag="fieldset" className="col-12 border">
          <legend>
            {valueObj.type == 'Enumerated' ? 'Items' : 'Fields'}
            <ButtonGroup className="float-right">
              <Button color={fieldCollapse ? 'success' : 'warning'} onClick={() => setFieldCollapse(!fieldCollapse)}>
                <FontAwesomeIcon icon={fieldCollapse ? faPlusCircle : faMinusCircle} />
                &nbsp;
                {fieldCollapse ? ' Show' : ' Hide'}
              </Button>
              <Button color="primary" onClick={addField} >
                <FontAwesomeIcon icon={faPlusSquare} />
                &nbsp;
                Add
              </Button>
            </ButtonGroup>
          </legend>

          {!fieldCollapse && fields}

          {fieldCollapse && fields.length > 0 ? <p>Expand to view/edit fields</p> :
            !fieldCollapse && fields.length == 0 ? <p> No fields to show</p> : ''}
        </FormGroup>
      </div>
    </div>
  );
}

export default StructureEditor;