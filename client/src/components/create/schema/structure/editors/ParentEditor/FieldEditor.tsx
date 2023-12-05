import React, { useState } from 'react';
import { shallowEqual } from 'react-redux';
import {
    FieldObject, EnumeratedFieldKeys, StandardFieldKeys
} from '../consts';
import { useAppSelector } from '../../../../../../reducers';
import { objectValues, zip } from '../../../../../utils';
import { EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray } from '../../../interface';
import { sbToastError } from 'components/common/SBToast';
import { Option } from 'components/common/SBSelect';
import { SBConfirmModal } from 'components/common/SBConfirmModal';
import { DragItem } from '../DragStyle/SBOutlineFields';

interface FieldEditorProps {
    id: any;
    enumerated?: boolean;
    parentIndex: number;
    dataIndex: number;
    value: EnumeratedFieldArray | StandardFieldArray;
    change: (_v: EnumeratedFieldArray | StandardFieldArray, _i: number) => void;
    remove: (_i: number) => void;
    config: InfoConfig;
    editableID: boolean;

    isDragging?: boolean;
    moveCard?: (dragCardValue: EnumeratedFieldArray | StandardFieldArray, newIndex: number) => void;
    dropCard?: (arg: DragItem) => void;
    acceptableType?: string;

    changeIndex?: (_v: FieldArray, _i: number, _j: number) => void;
    isFirst?: boolean;
    isLast?: boolean;
}


const FieldEditor = (FieldWrapper: React.JSX.IntrinsicAttributes) => {
    return (props: FieldEditorProps) => {
        const { enumerated = false, value, dataIndex, change, config, remove } = props;

        const schemaTypes = useAppSelector((state) => (Object.keys(state.Util.types.schema)), shallowEqual);
        const types = useAppSelector((state) => ({
            base: (state.Util.types.base),
            schema: schemaTypes
        }), shallowEqual);

        const [modal, setModal] = useState(false);
        const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

        const fieldKeys = enumerated ? EnumeratedFieldKeys : StandardFieldKeys;
        const valueObjInit = zip(fieldKeys, value) as FieldObject;
        const [valueObj, setValueObj] = useState<FieldObject>(valueObjInit);
        const [valType, setValType] = useState({ value: valueObj.type, label: valueObj.type });
        const SBConfirmModalValName = enumerated ? valueObj.value : valueObj.name;

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

        const onRemoveItemClick = (e: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>) => {
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
            // change(updatevalue, dataIndex);
            change(objectValues(updatevalue as Record<string, any>) as FieldArray, dataIndex);
        }

        const toggleModal = () => {
            setModal(!modal);
        }

        return (
            <>
                <FieldWrapper
                    onBlur={onBlur}
                    onSelectChange={onSelectChange}
                    onChange={onChange}
                    onRemoveItemClick={onRemoveItemClick}
                    modal={modal}
                    saveModal={saveModal}
                    toggleModal={toggleModal}
                    valueObj={valueObj}
                    valType={valType}
                    types={types}
                    {...props}
                />
                <SBConfirmModal
                    isOpen={isConfirmModalOpen}
                    title={`Remove ${SBConfirmModalValName}`}
                    message={`Are you sure you want to remove ${SBConfirmModalValName}?`}
                    confirm_value={dataIndex}
                    onResponse={removeAll}></SBConfirmModal>
            </>
        );
    };
};

export default FieldEditor;