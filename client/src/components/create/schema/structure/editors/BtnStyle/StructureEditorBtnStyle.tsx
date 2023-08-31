import React, { memo, useEffect, useRef, useState } from 'react';
//import equal from 'fast-deep-equal';
import {
    Button, ButtonGroup, FormGroup, Input, InputGroup, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronDown, faCircleChevronUp, faMinusCircle, faPlusSquare, faSquareCaretDown, faSquareCaretUp } from '@fortawesome/free-solid-svg-icons';

import { PrimitiveTypeObject, StandardTypeObject, TypeKeys } from '../consts';
import OptionsModal from '../options/OptionsModal';
import {
    EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray, TypeArray
} from '../../../interface';
import { zip } from '../../../../../utils';
import { sbToastError } from 'components/common/SBToast';
import { useAppSelector } from 'reducers';
import FieldEditorBtnStyle from './FieldEditorBtnStyle';

// Interface
interface StructureEditorProps {
    dataIndex: number; //index changes based on obj in arr (tracks the parent index)
    value: TypeArray;
    change: (v: PrimitiveTypeObject, i: number) => void;
    remove: (i: number) => void;
    changeIndex: (v: PrimitiveTypeObject, dataIndex: number, i: number) => void;
    config: InfoConfig;
    collapseAllFields: boolean;
}

// Structure Editor
const StructureEditorBtnStyle = memo(function StructureEditorBtnStyle(props: StructureEditorProps) {
    const { value, change, changeIndex, dataIndex, config, collapseAllFields } = props;
    const predefinedTypes = useAppSelector((state) => [...state.Util.types.base]);
    const scrollToFieldRef = useRef<HTMLInputElement | null>(null);

    let fieldCount = 1;
    const [fieldCollapse, setFieldCollapse] = useState(false);
    const [modal, setModal] = useState(false);
    const valueObjInit = zip(TypeKeys, value) as StandardTypeObject;
    const [valueObj, setValueObj] = useState(valueObjInit);

    useEffect(() => {
        setFieldCollapse(collapseAllFields)
    }, [collapseAllFields]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { placeholder, value } = e.target;
        const key = placeholder.toLowerCase();
        setValueObj({ ...valueObj, [key]: value });
    }

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

        const tmpFieldValues = [...valueObj.fields, field];
        const updatevalue = { ...valueObj, fields: tmpFieldValues };
        setValueObj(updatevalue);
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
        setValueObj(updatevalue);
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
        setValueObj(updatevalue);
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
        setValueObj(updatevalue);
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

    //If the Derived Enumerations or Pointers extensions are present in type options, the Fields array MUST be empty.
    // MapOf & ArrayOf
    if ((valueObj.options.find(str => str.startsWith('#'))) || (valueObj.options.find(str => str.startsWith('>')))) {
        return (
            <>
                <div className="card border-secondary mb-3">
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
                    <div className="card-body px-2 py-2">
                        <div className="row m-0">
                            <FormGroup className="col-md-4">
                                <Label>Name</Label>
                                <Input type="text" placeholder="Name" className='form-control form-control-sm' maxLength={64} value={valueObj.name} onChange={onChange} onBlur={onBlur} />
                            </FormGroup>
                            <FormGroup className="col-md-2">
                                <Label>&nbsp;</Label>
                                <ButtonGroup>
                                    <Button color="primary" className='px-2 py-1 btn-sm' onClick={toggleModal}>Type Options</Button>
                                    <OptionsModal
                                        optionValues={valueObj.options}
                                        isOpen={modal}
                                        optionType={valueObj.type}
                                        toggleModal={toggleModal}
                                        saveModal={saveModal}
                                    />
                                </ButtonGroup>
                            </FormGroup>
                            <FormGroup className="col-md-6">
                                <Label>Comment</Label>
                                <Input type="textarea" placeholder="Comment" className='text-area-w100 form-control form-control-sm' rows={1} value={valueObj.comment} onChange={onChange} onBlur={onBlur} />
                            </FormGroup>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const fields: any[] = [];
    if (valueObj.fields) {
        for (let i = 0; i < valueObj.fields.length; ++i) {
            fields.push(<FieldEditorBtnStyle
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

    const listID = fields.map(field => field.key);

    return (
        <>
            <div className="card border-secondary mb-3">
                <div className="card-header px-2 py-2">

                    <div className='row'>
                        <div className='col'>
                            <span id={valueObj.name} className="card-title">{`${valueObj.name} (${valueObj.type})`}</span>
                        </div>
                        <div className='col'>
                            <ButtonGroup size="sm" className="float-right">
                                <Button color="danger" onClick={removeAll}
                                    title={`Delete ${valueObj.type}`}>
                                    <FontAwesomeIcon icon={faMinusCircle} />
                                </Button>
                            </ButtonGroup>
                            <ButtonGroup size="sm" className="float-right mr-1">
                                <Button color="primary" onClick={() => changeIndex(valueObj, dataIndex, dataIndex - 1)}
                                    title={`Move ${valueObj.type} Up`}>
                                    <FontAwesomeIcon icon={faSquareCaretUp} />
                                </Button>
                                <Button color="primary" onClick={() => changeIndex(valueObj, dataIndex, dataIndex + 1)}
                                    title={`Move ${valueObj.type} Down`}>
                                    <FontAwesomeIcon icon={faSquareCaretDown} />
                                </Button>
                            </ButtonGroup>  
                        </div>
                    </div>
                </div>
                <div className="card-body px-2 py-2">
                    <div className="row">

                        <div className="col-md-4">
                            <Label className='mb-0'>Name</Label>
                            <Input type="text" placeholder="Name" maxLength={64} className='form-control form-control-sm' value={valueObj.name} onChange={onChange} onBlur={onBlur} />
                        </div>

                        <div className="col-md-2 mt-4 text-center">
                            <Button color="primary" className='px-2 py-1 btn-sm' onClick={toggleModal}>Type Options</Button>
                            <OptionsModal
                                optionValues={valueObj.options}
                                isOpen={modal}
                                optionType={valueObj.type}
                                toggleModal={toggleModal}
                                saveModal={saveModal}
                            />
                        </div>
                        <div className="col-md-6">
                            <Label className='mb-0'>Comment</Label>
                            <Input type="textarea" placeholder="Comment" rows={1} className='form-control form-control-sm' value={valueObj.comment} onChange={onChange} onBlur={onBlur} />
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

                            {!fieldCollapse && fields.length == 0 ? <p className='mb-2'> No fields to show</p> : ''}

                            {!fieldCollapse &&
                                <Button color="primary" onClick={addField} className='btn btn-sm btn-block'
                                    title='Add Field'>
                                    <FontAwesomeIcon icon={faPlusSquare} />
                                </Button>}

                        </div>
                    </div>
                </div>
            </div>        
        </>
    );
});

export default StructureEditorBtnStyle;