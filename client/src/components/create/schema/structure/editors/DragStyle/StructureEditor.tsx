import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Button, ButtonGroup, Input
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronDown, faCircleChevronUp, faMinusCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import { PrimitiveTypeObject, StandardTypeObject, TypeKeys } from '../consts';
import OptionsModal from '../options/OptionsModal';
import FieldEditor from './FieldEditor';
import {
  EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray, TypeArray
} from '../../../interface';
import { zip } from '../../../../../utils';
import { sbToastError } from 'components/common/SBToast';
import { useAppSelector } from 'reducers';
import { DraggableType } from './DraggableType';
import update from 'immutability-helper'
import { Droppable } from './Droppable';  // TODO: Revisit
import { ModalSize } from '../options/ModalSize';


interface StructureEditorProps {
  dataIndex: number; //index changes based on obj in arr (tracks the parent index)
  value: TypeArray;
  change: (v: PrimitiveTypeObject, i: number) => void;
  remove: (i: number) => void;
  changeIndex: (v: PrimitiveTypeObject, dataIndex: number, i: number) => void;
  config: InfoConfig;
  collapseAllFields: boolean;
}


const StructureEditor = memo(function StructureEditor(props: StructureEditorProps) {
  const { value, change, dataIndex, config, collapseAllFields } = props;
  const predefinedTypes = useAppSelector((state) => [...state.Util.types.base]);
  const scrollToFieldRef = useRef<HTMLInputElement | null>(null);

  let fieldCount = 1;
  const [fieldCollapse, setFieldCollapse] = useState(false);
  const [modal, setModal] = useState(false);
  const valueObjInit = zip(TypeKeys, value) as StandardTypeObject;
  const [valueObj, setValueObj] = useState(valueObjInit);
  const [valueObjFields, setValueObjFields] = useState(valueObjInit.fields);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { placeholder, value } = e.target;
    const key = placeholder.toLowerCase();
    setValueObj({ ...valueObj, [key]: value });
  }

  useEffect(() => {
    setFieldCollapse(collapseAllFields)
  }, [collapseAllFields]);  

  const onBlur = (e: any) => {
    const { placeholder, value } = e.target;

    //VALIDATE NAME
    if (placeholder == "Name") {
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

    const tmpFieldValues = [...valueObjFields, field];
    const updatevalue = { ...valueObj, fields: tmpFieldValues };
    setValueObj(updatevalue);
    setValueObjFields(tmpFieldValues);
    change(updatevalue, dataIndex);
    setFieldCollapse(false);
    scrollToFieldRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: "start" });
    fieldCount = fieldCount + 1;
  }

  const moveField = (val: FieldArray, oldIndex: number, newIndex: number) => {
    let tmpFieldValues = [...valueObjFields];

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
    setValueObj(updatevalue);
    setValueObjFields(tmpFieldValues);
    change(updatevalue, dataIndex);
  }

  const getFieldPropValue = (field: JSX.Element, propPos: number) => {
    let propValue: any = null;
    if(field.props && 
        field.props.item && 
        field.props.item.props && 
        field.props.item.props.value && 
        field.props.item.props.value[propPos]){
          propValue =  field.props.item.props.value[propPos];
    } 
    return propValue;
  }

  const fieldChange = (val: FieldArray, idx: number) => {
    
    const fieldIDsFound = fields.filter(field => {
      const fieldPropValID = getFieldPropValue(field, 0);
      if(fieldPropValID){
        return fieldPropValID == val[0]
      } else {
        return null;
      }
    });

    if (fieldIDsFound.length > 1) {
      sbToastError('Error: FieldID must be unique');
      return;
    }

    // TODO: May not be needed?
    // if (listID.includes(val[0])) {
    //   sbToastError('Error: FieldID must be unique');
    //   return;
    // }

    const fieldNamesFound = fields.filter(field => {
      const fieldPropValName = getFieldPropValue(field, 1);
      if(fieldPropValName){
        return fieldPropValName == val[1]
      } else {
        return null;
      }
    });    

    if (fieldNamesFound.length > 1) {
      sbToastError('Error: FieldName must be unique');
      return;
    }

    if (typeof val[0] != 'number') {
      val[0] = parseInt(val[0]); //force index to type number
    }

    const tmpFieldValues = [...valueObjFields];
    tmpFieldValues[idx] = val;

    //sort fields
    tmpFieldValues.sort(function (a, b) {
      return a[0] - b[0];
    });

    const updatevalue = { ...valueObj, fields: tmpFieldValues };
    setValueObj(updatevalue);
    setValueObjFields(tmpFieldValues);
    change(updatevalue, dataIndex);
  };

  const fieldRemove = (idx: number) => {
    const tmpFieldValues = [...valueObjFields];

    if (idx + 1 == valueObjFields.length) {
      tmpFieldValues.pop();
    } else {
      tmpFieldValues.splice(idx, 1);
    }

    const updatevalue = { ...valueObj, fields: tmpFieldValues };
    setValueObj(updatevalue);
    setValueObjFields(tmpFieldValues);
    change(updatevalue, dataIndex);
  };

  const saveModal = (modalData: Array<string>) => {
    toggleModal();
    const prevState = [...valueObj.options];
    if (JSON.stringify(prevState) === JSON.stringify(modalData)) {
      return;
    }
    var updatevalue = { ...valueObj, options: modalData }
    // if EnumeratedField && enum || pointer, remove fields 
    if (updatevalue.type == "Enumerated" && (updatevalue.options.find(str => str.startsWith('#'))) || (updatevalue.options.find(str => str.startsWith('>')))) {
      updatevalue = { ...updatevalue, fields: [] }
    }
    setValueObj(updatevalue);
    change(updatevalue, dataIndex);
  }

  const toggleModal = () => {
    setModal(modal => !modal);
  }

  // If the Derived Enumerations or Pointers extensions are present in type options, the Fields array MUST be empty.
  // TODO: Is this used?
  if ((valueObj.options.find(str => str.startsWith('#'))) || (valueObj.options.find(str => str.startsWith('>')))) {
    return (
      <>
        <div className="card border-secondary mb-3">
            <div className="card-header px-2 py-2">
                <span id={valueObj.name} className="col-sm-10 px-1 my-1">{`${valueObj.name} (${valueObj.type})`}</span>
                <ButtonGroup size="sm" className="float-right">
                  <Button color="danger" onClick={removeAll} >
                    <FontAwesomeIcon icon={faMinusCircle} />
                  </Button>
                </ButtonGroup>                
            </div>
            <div className="card-body px-2 py-2">
              <div className="row">
                <div className="col-md-12">
                  <div className='row'>
                    <div className='col-md-4'>
                      <label htmlFor="name" className='mb-0'>Name</label>
                    </div>             
                    <div className='col-md-6 offset-md-2'>
                      <label htmlFor="name" className='mb-0'>Comment</label>
                    </div>                                
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <Input type="text" placeholder="Name" maxLength={64} value={valueObj.name} onChange={onChange} onBlur={onBlur} />
                    </div>
                    <div className="col-md-2 text-center px-0">
                      <Button color="primary" className='p-2 btn-sm' onClick={toggleModal}>Type Options</Button>
                      <OptionsModal
                        optionValues={valueObj.options}
                        isOpen={modal}
                        optionType={valueObj.type}
                        toggleModal={toggleModal}
                        saveModal={saveModal}
                        modalSize={ModalSize.lg}
                        fieldOptions={false}
                      />
                    </div>
                    <div className="col-md-6">
                      <Input type="textarea" placeholder="Comment" className='text-area-w100' rows={1} value={valueObj.comment} onChange={onChange} onBlur={onBlur} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>      
      </>
    );
  }

  const onDrag = useCallback((dragIndex, hoverIndex) => {
    setValueObjFields((prevFields) =>
      update(prevFields, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevFields[dragIndex]],
        ],
      }),
    )
    setValueObj((prevObj) =>
      update(prevObj, {
        fields: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevObj.fields[dragIndex]],
          ],
        }
      }),
    )
  }, [])

  const renderField = useCallback((field, index) => {
    return (
      <DraggableType
        key={self.crypto.randomUUID()}
        id={field[0]}
        isDraggable={true}
        dataIndex={index}
        changeIndex={onDrag}
        acceptableType={`Field${dataIndex}`}
        item={< FieldEditor
          dataIndex={index}
          enumerated={valueObj.type.toLowerCase() === 'enumerated'}
          value={field}
          change={fieldChange}
          remove={fieldRemove}
          changeIndex={moveField}
          config={config}
        />}
      />
    );
  }, [])

  const fields = valueObjFields?.map((field, i) => renderField(field, i)) || [];
  const listID = fields?.map(field => field.props.id);

  return (
    <>
	    <div className="card border-secondary mb-2">
        <div className="card-header px-2 py-2">
          <div className='row'>
            <div className='col'>
              <span id={valueObj.name} className="card-title">{`${valueObj.name} (${valueObj.type})`}</span>
            </div>
            <div className='col'>
              <Button color="danger" className="float-right btn-sm" onClick={removeAll} title={`Delete ${valueObj.type}`}>
                <FontAwesomeIcon icon={faMinusCircle} />
              </Button>
            </div>
          </div>              
        </div>
        <div className="card-body px-2 pt-2 pb-3">
          <div className="row">
            <div className="col-md-12">
              <div className='row'>
                <div className='col-md-4'>
                  <label htmlFor="name" className='mb-0'>Name</label>
                </div>             
                <div className='col-md-6 offset-md-2'>
                  <label htmlFor="name" className='mb-0'>Comment</label>
                </div>                                
              </div>
              <div className="row">
                <div className="col-md-4">
                  <Input type="text" className='form-control"' placeholder="Name" maxLength={64} value={valueObj.name} onChange={onChange} onBlur={onBlur} />
                </div>
                <div className="col-md-2 text-center px-0">
                  <Button color="primary" className='p-2 btn-sm' onClick={toggleModal}>Type Options</Button>
                  <OptionsModal
                    optionValues={valueObj.options}
                    isOpen={modal}
                    optionType={valueObj.type}
                    toggleModal={toggleModal}
                    saveModal={saveModal}
                    modalSize={ModalSize.lg}
                  />
                </div>
                <div className="col-md-6">
                  <Input type="textarea" placeholder="Comment" rows={1} value={valueObj.comment} onChange={onChange} onBlur={onBlur} />                 
                </div>
              </div>
            </div>
          </div>
          <div className="row pt-2">
            <div className="col-12">
              <legend>
                  {valueObj.type == 'Enumerated' ? 'Items' : 'Fields'} <span className="badge badge-pill badge-secondary">{fields.length}</span>

                  <span 
                      className="badge badge-pill badge-primary ml-1 cursor-pointer"
                      title='Add Field'
                      onClick={addField}>
                      <FontAwesomeIcon icon={faPlusSquare} />
                  </span> 

                  <FontAwesomeIcon icon={fieldCollapse ? faCircleChevronDown : faCircleChevronUp}
                      className='float-right btn btn-sm'
                      onClick={() => setFieldCollapse(!fieldCollapse)}
                      title={fieldCollapse ? ' Show Fields' : ' Hide Fields'} />
              </legend>
              
              <div ref={scrollToFieldRef}>
                  {!fieldCollapse && fields}
              </div>              

              {!fieldCollapse && fields.length == 0 ? <p> No fields to show</p> :""}

              {!fieldCollapse &&
                  <div>
                    {/* <Droppable acceptableType={`Field${dataIndex}`}>
                      <div ref={scrollToFieldRef}>
                        {fields}
                      </div>
                    </Droppable>  */}
                    <Button color="primary" onClick={addField} className='btn btn-sm btn-block'
                      title='Add Field'>
                      <FontAwesomeIcon icon={faPlusSquare} />
                    </Button>                    
                  </div>
                }

            </div>      

          </div>
        </div>
      </div>

    </>
  );
});

export default StructureEditor;