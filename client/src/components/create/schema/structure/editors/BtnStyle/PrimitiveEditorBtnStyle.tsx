import React, { memo, useEffect, useRef, useState } from 'react';
//import equal from 'fast-deep-equal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { useInView } from 'react-intersection-observer';
import { zip } from '../../../../../utils';
import { InfoConfig } from '../../../interface';
import { StandardFieldKeys, StandardFieldObject, PrimitiveTypeObject, TypeKeys } from '../consts';
import OptionsModal from '../options/OptionsModal';
import { sbToastError } from 'components/common/SBToast';
import { SBConfirmModal } from 'components/common/SBConfirmModal';

// Interface
interface PrimitiveEditorProps {
    dataIndex: number;
    value: Array<any>;
    customStyle: any;
    setRowHeight: (i: number, height: number) => void;
    change: (v: any, i: number) => void;
    remove: (i: number) => void;
    setIsVisible: (i: number) => void;
    config: InfoConfig;
}

// Primitive Editor
const PrimitiveEditorBtnStyle = memo(function PrimitiveEditorBtnStyle(props: PrimitiveEditorProps) {
    const { value, dataIndex, config, customStyle, setRowHeight, change, setIsVisible } = props;

    //TODO: may need to add polyfill -- support for Safari
    const { ref: inViewRef, inView, entry } = useInView({
        fallbackInView: true,
        threshold: .25
    });

    const rowRef = useRef<any>();
    useEffect(() => {
        if (rowRef.current) {
            setRowHeight(dataIndex, rowRef.current.getBoundingClientRect().height + 5)
        }
    }, [rowRef]);

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
                        <button type='button' className='btn btn-sm btn-danger float-end' onClick={onRemoveItemClick} title={`Delete ${valueObj.type}`}>
                            <FontAwesomeIcon icon={faMinusCircle} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body px-2 py-2">
                <div className="row m-0">
                    <div className="col-md-4">
                        <label htmlFor={`name-${dataIndex}`} className='mb-0'>Name</label>
                        <input
                            id={`name-${dataIndex}`}
                            name="name"
                            type="text"
                            placeholder="Name"
                            maxLength={64}
                            className='form-control'
                            value={valueObj.name}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
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
                        <input
                            id={`comment-${dataIndex}`}
                            name="comment"
                            type="textarea"
                            placeholder="Comment"
                            className='form-control'
                            value={valueObj.comment}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
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
        </div>

    );
});

export default PrimitiveEditorBtnStyle;
