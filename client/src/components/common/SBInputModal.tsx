import React, { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { ModalSize } from "components/create/schema/structure/editors/options/ModalSize";
import { sbToastError } from "./SBToast";

interface SBInputModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    title?: string;
    message?: string;
    modalSize?: ModalSize;
    initVal: string;
    setInputInitVal: (val: string) => void;
    onValidate: (value: string | null) => void;
}

export const SBInputModal = (props: SBInputModalProps) => {
    const {
        isOpen,
        setIsOpen,
        title = 'Input Required',
        message = 'Please provide the required input.',
        modalSize = ModalSize.sm,
        initVal = '',
        setInputInitVal,
        onValidate } = props;

    const [inputValue, setInputValue] = useState(initVal);

    useEffect(() => {
        if (isOpen) {
            setInputValue(initVal);
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleClose = () => {
        setIsOpen(false);
        onValidate(null);
    };

    const handleSubmit = () => {
        const intValue = String(inputValue);
        if (!isNaN(Number(intValue)) && Number(intValue) > 0) {
            onValidate(intValue);
            setInputInitVal(intValue);
        } else {
            sbToastError("Please enter a valid positive integer value.");
            onValidate(null);
            return;
        }
        setIsOpen(false);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <>
            {createPortal(
                <>
                    <div className={`modal-backdrop fade show`} style={{ zIndex: 1050 }}></div>
                    <div id="confirmationModal" className={`modal fade show d-block`} tabIndex={-1} role='dialog' style={{ zIndex: 1055 }}>
                        <div className={`modal-dialog modal-dialog-centered ${modalSize}`} role='document'>
                            <div className='modal-content'>
                                <div className="modal-header">
                                    <h5 className='modal-title'>
                                        {title}
                                    </h5>
                                    <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' title='Close' onClick={handleClose} />
                                </div>
                                <div className="modal-body">
                                    <label htmlFor="sb-input-modal" className="form-label">{message}</label>
                                    <input
                                        id="sb-input-modal"
                                        type="number"
                                        className="form-control"
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        autoFocus
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type='button' className='btn btn-sm btn-primary' onClick={handleSubmit}>Submit</button>
                                    <button type='button' className='btn btn-sm btn-secondary' onClick={handleClose}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>,
                document.body)}
        </>
    )
};