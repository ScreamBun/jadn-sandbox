import React, { useState } from 'react';
import { shallowEqual } from 'react-redux';
import {
    FieldObject, EnumeratedFieldKeys, StandardFieldKeys
} from '../consts';
import { useAppSelector } from '../../../../../../reducers';
import { objectValues, zip } from '../../../../../utils';
import { EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray } from '../../../interface';
import { dismissAllToast, sbToastError } from 'components/common/SBToast';
import { Option } from 'components/common/SBSelect';
import { SBConfirmModal } from 'components/common/SBConfirmModal';
import { DragItem } from '../DragStyle/SBOutlineFields';
import { Types } from '../../structure';

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


export default function withFieldEditor(FieldWrapper: React.ComponentType<any>) {
    function WithFieldEditor(props: FieldEditorProps) {
        const { enumerated, value, dataIndex, change, config, remove } = props;

        const schemaTypes = useAppSelector((state) => (Object.keys(state.Util.types.schema)), shallowEqual);
        //FieldType MUST be a Primitive type, ArrayOf, MapOf, or a model-defined type.
        const baseTypes = useAppSelector((state) => state.Util.types.base).filter((type) => {
            if (Types[type.toLowerCase()].type == "primitive" || Types[type.toLowerCase()].key == "ArrayOf" || Types[type.toLowerCase()].key == "MapOf") {
                return true;
            } else {
                return false;
            }
        });
        const types = {
            base: baseTypes,
            schema: schemaTypes
        };

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
            dismissAllToast();
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
                    enumerated={enumerated}
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
    const wrappedComponentName = FieldWrapper.displayName
        || FieldWrapper.name
        || 'Component';

    WithFieldEditor.displayName = `withFieldEditor(${wrappedComponentName})`;
    return WithFieldEditor;
};
