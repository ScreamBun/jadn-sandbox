import React, { memo, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown19, faCircleChevronDown, faCircleChevronUp, faMinusCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { useInView } from 'react-intersection-observer';
import { useAppSelector } from 'reducers';
import { zip } from '../../../../../utils';
import {
    EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray, TypeArray
} from '../../../interface';
import { StandardTypeObject, TypeKeys } from '../consts';
import OptionsModal from '../options/OptionsModal';
import { sbToastError } from 'components/common/SBToast';
import FieldEditorBtnStyle from './FieldEditorBtnStyle';
import { SBConfirmModal } from 'components/common/SBConfirmModal';
import { shallowEqual } from 'react-redux';

// Interface
interface StructureEditorProps {
    dataIndex: number; //index changes based on obj in arr (tracks the parent index)
    value: TypeArray;
    customStyle: any;
    setRowHeight: (i: number, height: number) => void;
    change: (v: StandardTypeObject, i: number) => void;
    remove: (i: number) => void;
    setIsVisible: (i: number) => void;
    config: InfoConfig;
    collapseAllFields: boolean;
}

// Structure Editor
const StructureEditorBtnStyle = memo(function StructureEditorBtnStyle(props: StructureEditorProps) {
    const { value, dataIndex, config, collapseAllFields, customStyle, setRowHeight, change, remove, setIsVisible } = props;
    const predefinedTypes = useAppSelector((state) => [...state.Util.types.base], shallowEqual);

    const rowRef = useRef<any>();

    useEffect(() => {
        if (rowRef.current) {
            setRowHeight(dataIndex, rowRef.current.getBoundingClientRect().height + 5);
        }
    }, [rowRef]);

    //TODO: may need to add polyfill -- support for Safari
    const { ref: inViewRef, inView, entry } = useInView({
        fallbackInView: true,
        threshold: .25
    });

    const [fieldCollapse, setFieldCollapse] = useState(false);
    const [modal, setModal] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const valueObjInit = zip(TypeKeys, value) as StandardTypeObject;
    const [valueObj, setValueObj] = useState(valueObjInit);
    const isEditableID = valueObj.type == 'Record' || valueObj.type == 'Array' ? false : true;
    let SBConfirmModalValName = valueObj.name;

    useEffect(() => {
        setFieldCollapse(collapseAllFields)
    }, [collapseAllFields]);

    useEffect(() => {
        if (inView) {
            setIsVisible(dataIndex);
        }
    }, [entry])

    const getFieldPropValue = (field: JSX.Element, propPos: number) => {
        let propValue: any = null;
        if (field.props &&
            field.props.item &&
            field.props.item.props &&
            field.props.item.props.value &&
            field.props.item.props.value[propPos]) {
            propValue = field.props.item.props.value[propPos];
        }
        return propValue;
    }

    const sortFields = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        let tmpFields = [...valueObj.fields];
        //sort fields
        tmpFields.sort(function (a, b) {
            return a[0] - b[0];
        });

        const updatevalue = { ...valueObj, fields: tmpFields };
        setValueObj(updatevalue);
        change(updatevalue, dataIndex);
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { placeholder, value } = e.target;
        const key = placeholder.toLowerCase();
        setValueObj({ ...valueObj, [key]: value });
    }

    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.preventDefault();
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

    const onRemoveItemClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsConfirmModalOpen(true);
    };

    const removeAll = (response: boolean, confirm_value: number) => {
        setIsConfirmModalOpen(false);
        if (response == true) {
            remove(confirm_value);
        }
    }

    const onAddField = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let field: EnumeratedFieldArray | StandardFieldArray;
        //check field count
        if (config.$MaxElements && fields.length > config.$MaxElements) {
            sbToastError(`Error: Field count exceeds $MaxElements. Please remove ${fields.length - config.$MaxElements} field(s).`);
            return;
        } else if (config.$MaxElements && fields.length == config.$MaxElements) {
            sbToastError('Error: Field count meets $MaxElements. Cannot add more fields.');
            return;
        }

        let f_count = valueObj.fields?.length + 1;
        const listOfIDs = valueObj.fields.map((field) => { return field[0]; })
        if (listOfIDs.includes(f_count)) {
            //Create Unique ID
            const currMaxID = Math.max(...listOfIDs);
            f_count = currMaxID + 1;
        }

        const fieldName = 'field_value_' + f_count;
        if (valueObj.type.toLowerCase() === 'enumerated') {
            field = [f_count, fieldName, ''] as EnumeratedFieldArray;
        } else {
            //default field type is String
            field = [f_count, fieldName, 'String', [], ''] as StandardFieldArray;
        }

        const tmpFieldValues = [...valueObj.fields, field];
        const updatevalue = { ...valueObj, fields: tmpFieldValues };
        flushSync(() => {
            setValueObj(updatevalue);
        });
        change(updatevalue, dataIndex);
        setFieldCollapse(false);
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

        //If BaseType is Array or Record, FieldID MUST be the ordinal position of the field within the type, numbered consecutively starting at 1.
        if (!isEditableID) {
            //switch IDs
            const valID = val[0];
            const prevID = prevField[0];
            prevField[0] = valID;
            val[0] = prevID;
        }

        //switch fields
        tmpFieldValues[oldIndex] = prevField;
        tmpFieldValues[newIndex] = val;

        const updatevalue = { ...valueObj, fields: tmpFieldValues };
        setValueObj(updatevalue);
        change(updatevalue, dataIndex);
    }

    const fieldChange = (val: FieldArray, idx: number) => {
        //check field ID and field name
        const fieldIDsFound = valueObj.fields.filter(field => {
            const fieldPropValID = getFieldPropValue(field, 0);
            if (fieldPropValID) {
                return fieldPropValID == val[0]
            } else {
                return null;
            }
        });

        if (fieldIDsFound.length > 1) {
            sbToastError('Error: FieldID must be unique');
            return;
        }

        const fieldNamesFound = valueObj.fields.filter(field => {
            const fieldPropValName = getFieldPropValue(field, 1);
            if (fieldPropValName) {
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

        const tmpFieldValues = [...valueObj.fields];
        tmpFieldValues[idx] = val;

        const updatevalue = { ...valueObj, fields: tmpFieldValues };
        setValueObj(updatevalue);
        change(updatevalue, dataIndex);
    };

    const onFieldRemoval = (idx: number) => {
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
                <div className="card mb-3" ref={rowRef} style={customStyle}>
                    <div className="card-header px-2 py-2">
                        <div className='row'>
                            <div className='col'>
                                <span id={valueObj.name} className="card-title">{`${valueObj.name} (${valueObj.type})`}</span>
                            </div>
                            <div className='col'>
                                <button type='button' className="float-end btn btn-danger btn-sm" onClick={onRemoveItemClick} title={`Delete ${valueObj.type}`}>
                                    <FontAwesomeIcon icon={faMinusCircle} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body px-2 py-2">
                        <div className="row m-0">
                            <div className="col-md-4">
                                <label htmlFor={`name-${dataIndex}`} >Name</label>
                                <input id={`name-${dataIndex}`} name="name" type="text" placeholder="Name" className='form-control' maxLength={64} value={valueObj.name} onChange={onChange} onBlur={onBlur} />
                            </div>
                            <div className="col-md-2">
                                <button type='button' className='btn btn-primary btn-sm p-2' data-bs-toggle="modal" data-bs-target="#optionsModal" onClick={toggleModal}>Type Options</button>
                                <OptionsModal
                                    id={`${dataIndex}`}
                                    optionValues={valueObj.options}
                                    isOpen={modal}
                                    optionType={valueObj.type}
                                    toggleModal={toggleModal}
                                    saveModal={saveModal}
                                />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor={`comment-${dataIndex}`} >Comment</label>
                                <input id={`comment-${dataIndex}`} name="comment" type="textarea" placeholder="Comment" className='text-area-w100 form-control' value={valueObj.comment} onChange={onChange} onBlur={onBlur} />
                            </div>
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
                parentIndex={dataIndex}
                dataIndex={i}
                enumerated={valueObj.type.toLowerCase() === 'enumerated'}
                value={valueObj.fields[i]}
                change={fieldChange}
                remove={onFieldRemoval}
                changeIndex={moveField}
                config={config}
                editableID={isEditableID}
                isFirst={i == 0}
                isLast={i == valueObj.fields.length - 1}
            />);
        }
    }

    return (
        <>
            <div className="card mb-3" id={`${dataIndex}`} ref={rowRef} style={customStyle}>
                <div className="card-header px-2 py-2" ref={inViewRef} >
                    <div className='row'>
                        <div className='col'>
                            <span className="badge rounded-pill text-bg-secondary me-2" title='index'>
                                {dataIndex}
                            </span>
                            <span id={valueObj.name} className="card-title pt-1">{`${valueObj.name} (${valueObj.type})`}</span>
                        </div>
                        <div className='col'>
                            <button type='button' className="btn btn-danger btn-sm float-end" onClick={onRemoveItemClick}
                                title={`Delete ${valueObj.type}`}>
                                <FontAwesomeIcon icon={faMinusCircle} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card-body px-2 py-2">
                    <div className="row">
                        <div className="col-md-4">
                            <label htmlFor={`name-${dataIndex}`} className='mb-0'>Name</label>
                            <input id={`name-${dataIndex}`} name="name" type="text" placeholder="Name" maxLength={64} className='form-control' value={valueObj.name} onChange={onChange} onBlur={onBlur} />
                        </div>
                        <div className="col-md-2 mt-4 text-center">
                            <button type='button' className='btn btn-primary btn-sm p-2' data-bs-toggle="modal" data-bs-target="#optionsModal" onClick={toggleModal}>Type Options</button>
                            <OptionsModal
                                id={`${dataIndex}`}
                                optionValues={valueObj.options}
                                isOpen={modal}
                                optionType={valueObj.type}
                                toggleModal={toggleModal}
                                saveModal={saveModal}
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor={`comment-${dataIndex}`} className='mb-0'>Comment</label>
                            <input id={`comment-${dataIndex}`} name="comment" type="textarea" placeholder="Comment" className='form-control' value={valueObj.comment} onChange={onChange} onBlur={onBlur} />
                        </div>
                    </div>
                    <div className="row pt-2">
                        <div className="col-12">
                            <span>
                                {valueObj.type == 'Enumerated' ? 'Items' : 'Fields'} <span className="badge rounded-pill text-bg-secondary">{fields.length}</span>

                                <span
                                    className="badge rounded-pill text-bg-primary cursor-pointer"
                                    title='Add Field'
                                    onClick={onAddField}>
                                    <FontAwesomeIcon icon={faPlusSquare} />
                                </span>

                                <a href="#" role="button"
                                    onClick={() => setFieldCollapse(!fieldCollapse)}>
                                    <FontAwesomeIcon icon={fieldCollapse ? faCircleChevronDown : faCircleChevronUp}
                                        className='float-end btn btn-sm'
                                        title={fieldCollapse ? ' Show Fields' : ' Hide Fields'} />
                                </a>

                                {isEditableID ? <a href="#" role="button" onClick={sortFields}>
                                    <FontAwesomeIcon icon={faArrowDown19}
                                        className='float-end btn btn-sm'
                                        title={'Sort Fields by ID'} />
                                </a> : ''}

                            </span>

                            <div>
                                {!fieldCollapse && fields}
                            </div>

                            {!fieldCollapse && fields.length == 0 ? <p className='mb-2'> No fields to show</p> : ''}

                            {!fieldCollapse &&
                                <button type='button' onClick={onAddField} className='btn btn-sm btn-primary btn-block rounded-pill'
                                    title='Add Field'>
                                    <FontAwesomeIcon icon={faPlusSquare} />
                                </button>}

                        </div>
                    </div>
                </div>
            </div>
            <SBConfirmModal
                isOpen={isConfirmModalOpen}
                title={`Remove ${SBConfirmModalValName}`}
                message={`Are you sure you want to remove ${SBConfirmModalValName}?`}
                confirm_value={dataIndex}
                onResponse={removeAll}>
            </SBConfirmModal>
        </>
    );
});

export default StructureEditorBtnStyle;