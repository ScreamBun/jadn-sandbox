import React, { memo, useState } from 'react';
import {
    Button, ButtonGroup, FormGroup, Input, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faSquareCaretDown, faSquareCaretUp } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../../../../reducers';
import { objectValues, zip } from '../../../../../utils';
import { EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray } from '../../../interface';
import {
    FieldObject, EnumeratedFieldObject, EnumeratedFieldKeys, StandardFieldKeys, StandardFieldObject
} from '../consts';
import { ModalSize } from '../options/ModalSize';
import OptionsModal from '../options/OptionsModal';
import { sbToastError } from 'components/common/SBToast';
import { Option } from 'components/common/SBSelect';
import { SBConfirmModal } from 'components/common/SBConfirmModal';
import SBCreatableSelect from 'components/common/SBCreatableSelect';

// Interface
interface FieldEditorProps {
    enumerated?: boolean;
    dataIndex: number;
    value: EnumeratedFieldArray | StandardFieldArray;
    change: (_v: EnumeratedFieldArray | StandardFieldArray, _i: number) => void;
    remove: (_i: number) => void;
    config: InfoConfig;
    changeIndex: (_v: FieldArray, _i: number, _j: number) => void;
    editableID: boolean;
}


const FieldEditorBtnStyle = memo(function FieldEditorBtnStyle(props: FieldEditorProps) {
    const { enumerated, value, dataIndex, change, config, changeIndex, remove, editableID } = props;

    const types = useAppSelector((state) => ({
        base: state.Util.types.base,
        schema: Object.keys(state.Util.types.schema) || {}
    }));

    const [modal, setModal] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const fieldKeys = enumerated ? EnumeratedFieldKeys : StandardFieldKeys;
    const valueObjInit = zip(fieldKeys, value) as FieldObject;
    const [valueObj, setValueObj] = useState(valueObjInit);
    const val = valueObj as StandardFieldObject;
    const [valType, setValType] = useState({ value: val.type, label: val.type });

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
                <div className="row m-0">
                    <FormGroup className='col-md-2'>
                        <Label>ID</Label>
                        <Input name="FieldEditorID" type="number" placeholder="ID" className='form-control' value={valueObj.id} onChange={onChange} onBlur={onBlur} />
                    </FormGroup>
                    <div className="col-md-4">
                        <Label>Value</Label>
                        <Input name="FieldEditorValue" type="text" placeholder="Value" className='form-control' value={val.value} onChange={onChange} onBlur={onBlur} />
                    </div>
                    <FormGroup className='col-md-6'>
                        <Label>Comment</Label>
                        <Input
                            name="FieldEditorComment"
                            type="textarea"
                            className='form-control'
                            placeholder="Comment"
                            rows={1}
                            value={valueObj.comment}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    </FormGroup>
                </div>
            );
        }

        return (
            <>
                <div className="row">
                    <div className="col-md-2">
                        <Label className='mb-0'>ID</Label>
                    </div>
                    <div className="col-md-4">
                        <Label className='mb-0'>Name</Label>
                    </div>
                    <div className="col-md-4">
                        <Label className='mb-0'>Type</Label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-2">
                        <Input name="FieldEditorID" type="number" placeholder="ID" className='form-control' value={valueObj.id} onChange={onChange} onBlur={onBlur} readOnly={!editableID}
                            title={`${editableID ? '' : 'If BaseType is Array or Record, FieldID MUST be the ordinal position of the field within the type, numbered consecutively starting at 1.'}`} />
                    </div>
                    <div className="col-md-4">
                        <Input name="FieldEditorName" type="text" placeholder="Name" className='form-control' maxLength={64} value={val.name} onChange={onChange} onBlur={onBlur} />
                    </div>
                    <div className="col-md-4">
                        <SBCreatableSelect id="Type" name="Type" value={valType} onChange={onSelectChange} data={types} isGrouped />
                    </div>
                    <div className="col-md-2">
                        <Button color="primary" className='btn-sm p-2' onClick={toggleModal}>Field Options</Button>
                        <OptionsModal
                            optionValues={val.options}
                            isOpen={modal}
                            saveModal={saveModal}
                            toggleModal={toggleModal}
                            optionType={val.type}
                            modalSize={ModalSize.lg}
                            fieldOptions={true}
                        />
                    </div>
                </div>
                <div className="row">
                    <FormGroup className='col-md-12'>
                        <Label>Comment</Label>
                        <Input
                            name="FieldEditorComment"
                            type="textarea"
                            placeholder="Comment"
                            rows={1}
                            className='form-control'
                            value={valueObj.comment}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    </FormGroup>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="card border-secondary mb-2">
                <div className="card-body px-2 py-2">
                    <ButtonGroup size="sm" className="float-right">
                        <Button color="primary" onClick={() => changeIndex(value, dataIndex, dataIndex - 1)}
                            title={`Move Field Up`}>
                            <FontAwesomeIcon icon={faSquareCaretUp} />
                        </Button>
                        <Button color="primary" onClick={() => changeIndex(value, dataIndex, dataIndex + 1)}
                            title={`Move Field Down`} >
                            <FontAwesomeIcon icon={faSquareCaretDown} />
                        </Button>
                    </ButtonGroup>
                    <ButtonGroup size="sm" className="float-right mr-1">
                        <Button color="danger" className="rounded-circle"
                            onClick={onRemoveItemClick}
                            title={`Delete Field`}>
                            <FontAwesomeIcon icon={faMinusCircle} />
                        </Button>
                    </ButtonGroup>

                    {makeOptions()}
                </div>
            </div>
            <SBConfirmModal
                isOpen={isConfirmModalOpen}
                title={`Remove ${val.name}`}
                message={`Are you sure you want to remove ${val.name}?`}
                confirm_value={dataIndex}
                onResponse={removeAll}></SBConfirmModal>
        </>
    );
});

export default FieldEditorBtnStyle;