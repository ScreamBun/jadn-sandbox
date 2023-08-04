import React, { useRef, useState } from 'react';
//import equal from 'fast-deep-equal';
import {
  Button, ButtonGroup, FormGroup, Input, InputGroup, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle, faPlusSquare, faSquareCaretDown, faSquareCaretUp } from '@fortawesome/free-solid-svg-icons';

import { PrimitiveTypeObject, StandardTypeObject, TypeKeys } from './consts';
import OptionsModal from './options/OptionsModal';
import FieldEditor from './FieldEditor';
import {
  EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray, TypeArray
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
  changeIndex: (v: PrimitiveTypeObject, dataIndex: number, i: number) => void;
  config: InfoConfig;
}

// Structure Editor
const StructureEditor = (props: StructureEditorProps) => {
  const { value, change, changeIndex, dataIndex, config } = props;
  const predefinedTypes = useAppSelector((state) => [...state.Util.types.base]);
  const scrollToFieldRef = useRef<HTMLInputElement | null>(null);

  const [fieldCollapse, setFieldCollapse] = useState(false);
  const [modal, setModal] = useState(false);
  let valueObj = zip(TypeKeys, value) as StandardTypeObject;
  let fieldCount = 1;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { placeholder, value } = e.target;
    const key = placeholder.toLowerCase();
    const updatevalue = { ...valueObj, [key]: value };
    change(updatevalue, dataIndex);
  }

  const onBlur = (e: any) => {
    const value = e.target.value;
    if (predefinedTypes.includes(value.toLowerCase())) {
      sbToastError('Error: TypeName MUST NOT be a JADN predefined type');
    }
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

  const addField = () => {
    let field: EnumeratedFieldArray | StandardFieldArray;
    //check field count
    if (config.$MaxElements && fields.length > config.$MaxElements) {
      sbToastError(`Error: Field count exceeds $MaxElements. Please remove ${fields.length - config.$MaxElements} field(s).`);
      return;
    } else if (config.$MaxElements && fields.length == config.$MaxElements) {
      sbToastError('Error: Field count meets $MaxElements. Cannot add more fields.');
      return;
    }

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
    setFieldCollapse(false);
    scrollToFieldRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: "center" });
    fieldCount = fieldCount + 1;
  }

  const moveField = (val: FieldArray, oldIndex: number, newIndex: number) => {
    let tmpFieldValues = [...valueObj.fields];
    if (newIndex < 0) {
      sbToastError('Error: Cannot move Type up anymore')
      return;
    } else if (newIndex >= tmpFieldValues.length) {
      sbToastError('Error: Cannot move Type down anymore')
      return;
    }
    //get other field to be moved
    const prevField = tmpFieldValues[newIndex];

    //switch IDs
    const valID = val[0];
    const prevID = prevField[0];
    prevField[0] = valID;
    val[0] = prevID;

    //switch fields
    tmpFieldValues[oldIndex] = prevField;
    tmpFieldValues[newIndex] = val;
    const updatevalue = { ...valueObj, fields: tmpFieldValues };
    change(updatevalue, dataIndex);
  }

  const fieldChange = (val: FieldArray, idx: number) => {
    //check field ID and field name
    if (listID.includes(val[0])) {
      sbToastError('Error: FieldID must be unique');
      return;
    }

    const filterName = fields.filter(field => field.props.value[1] == val[1]);
    if (filterName.length > 1) {
      sbToastError('Error: FieldName must be unique');
      return;
    }

    if (typeof val[0] != 'number') {
      val[0] = parseInt(val[0]); //force index to type number
    }

    const tmpFieldValues = [...valueObj.fields];
    tmpFieldValues[idx] = val;

    //sort fields
    tmpFieldValues.sort(function (a, b) {
      return a[0] - b[0];
    });

    const updatevalue = { ...valueObj, fields: tmpFieldValues };
    change(updatevalue, dataIndex);
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
    var updatevalue = { ...valueObj, options: modalData }
    // if EnumeratedField && enum || pointer, remove fields 
    if (updatevalue.type == "Enumerated" && (updatevalue.options.find(str => str.startsWith('#'))) || (updatevalue.options.find(str => str.startsWith('>')))) {
      updatevalue = { ...updatevalue, fields: [] }
    }
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
            <Input type="text" placeholder="Name" maxLength={64} value={valueObj.name} onChange={onChange} onBlur={onBlur} />
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
        changeIndex={moveField}
        config={config}
      />);
    }
  }
  //sort fields
  fields.sort(function (a, b) {
    return a.key - b.key;
  });
  const listID = fields.map(field => field.key);

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
            <Input type="textarea" placeholder="Comment" rows={1} value={valueObj.comment} onChange={onChange} />
          </Label>
        </FormGroup>

        <FormGroup tag="fieldset" className="col-12 border">
          <legend>
            {valueObj.type == 'Enumerated' ? 'Items' : 'Fields'} <span className="badge badge-pill badge-secondary">{fields.length}</span>
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

          <div ref={scrollToFieldRef}>
            {!fieldCollapse && fields}
          </div>

          {!fieldCollapse && fields.length == 0 ? <p> No fields to show</p> : ''}

        </FormGroup>
      </div>
    </div>
  );
}

export default StructureEditor;