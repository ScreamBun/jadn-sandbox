import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { zip } from '../../../../../utils';
import { InfoConfig } from '../../../interface';
import { StandardFieldKeys, StandardFieldObject, PrimitiveTypeObject, TypeKeys } from '../consts';
import { dismissAllToast, sbToastError } from 'components/common/SBToast';
import { SBConfirmModal } from 'components/common/SBConfirmModal';

interface PrimitiveEditorProps {
    dataIndex: number;
    value: Array<any>;
    customStyle: any;
    setRowHeight: (i: number, height: number) => void;
    change: (v: PrimitiveTypeObject, i: number) => void;
    remove: (i: number) => void;
    setIsVisible: (i: number) => void;
    config: InfoConfig;
}

export default function withPrimitiveEditor(PrimitiveWrapper: React.ComponentType<any>) {
    function WithPrimitiveEditor(props: PrimitiveEditorProps) {

        const { value, dataIndex, config, setRowHeight, change, setIsVisible } = props;

        //TODO: may need to add polyfill -- support for Safari
        const { ref: inViewRef, inView, entry } = useInView({
            fallbackInView: true,
            threshold: 1
        });

        const [modal, setModal] = useState(false);
        const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

        let valueObjInit: StandardFieldObject | PrimitiveTypeObject;
        if (Number.isInteger(value[0])) {
            valueObjInit = zip(StandardFieldKeys, value) as StandardFieldObject;
        } else {
            valueObjInit = zip(TypeKeys, value) as PrimitiveTypeObject;
        }
        const [valueObj, setValueObj] = useState(valueObjInit);
        let SBConfirmModalValName = valueObjInit.name;

        const rowRef = useRef<any>();

        useEffect(() => {
            if (rowRef.current && rowRef.current.getBoundingClientRect().height != 0) {
                setRowHeight(dataIndex, rowRef.current.getBoundingClientRect().height + 5)
            }
        }, []);

        useEffect(() => {
            if (inView) {
                setIsVisible(dataIndex);
            }
        }, [entry])

        const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { placeholder, value } = e.target;
            const key = placeholder.toLowerCase();
            setValueObj({ ...valueObj, [key]: value });
        }

        const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            const { placeholder, value } = e.target;

            if (placeholder == "Name") {
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

        const removeAll = (response: boolean) => {
            setIsConfirmModalOpen(false);
            if (response == true) {
                const { dataIndex, remove } = props;
                remove(dataIndex);
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
            change(updatevalue, dataIndex);
        }

        const toggleModal = () => {
            setModal(modal => !modal);
        }

        return (
            <>
                <PrimitiveWrapper
                    valueObj={valueObj}
                    rowRef={rowRef}
                    inViewRef={inViewRef}
                    onChange={onChange}
                    onBlur={onBlur}
                    modal={modal}
                    saveModal={saveModal}
                    toggleModal={toggleModal}
                    onRemoveItemClick={onRemoveItemClick}
                    {...props}
                    primitiveEditor
                />
                <SBConfirmModal
                    isOpen={isConfirmModalOpen}
                    title={`Remove ${SBConfirmModalValName}`}
                    message={`Are you sure you want to remove ${SBConfirmModalValName}?`}
                    confirm_value={dataIndex}
                    onResponse={removeAll}>
                </SBConfirmModal>
            </>
        );
    };
    const wrappedComponentName = PrimitiveWrapper.displayName
        || PrimitiveWrapper.name
        || 'Component';

    WithPrimitiveEditor.displayName = `withPrimitiveEditor(${wrappedComponentName})`;
    return WithPrimitiveEditor;
};
