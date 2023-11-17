import React from "react";
import { createPortal } from 'react-dom';
import { ModalSize } from "components/create/schema/structure/editors/options/ModalSize";

export const SBConfirmModal = (props: any) => {
    const {
        isOpen,
        title = 'Confirm',
        message = 'Are you sure?',
        modalSize = ModalSize.sm,
        confirm_value,
        onResponse } = props;

    const onCloseClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onResponse(false, confirm_value);
    };

    const onYesClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onResponse(true, confirm_value);
    };

    const onNoClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onResponse(false, confirm_value);
    };

    return (
        <>
            {createPortal(
                <div id="confirmationModal" className={`modal fade ${isOpen ? 'show d-block' : 'd-none'}`} tabIndex={-1} role='dialog'>
                    <div className={`modal-dialog modal-dialog-centered ${modalSize}`} role='document'>
                        <div className='modal-content'>
                            <div className="modal-header">
                                <h5 className='modal-title'>
                                    {title}
                                </h5>
                                <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' title='Close' onClick={onCloseClick} />
                            </div>
                            <div className="modal-body">
                                <p>{message}</p>
                            </div>
                            <div className="modal-footer">
                                <button type='button' className='btn btn-sm btn-success' onClick={onYesClick}>Yes</button>
                                <button type='button' className='btn btn-sm btn-secondary' onClick={onNoClick}>No</button>
                            </div>
                        </div>
                    </div>
                    <div className={`modal-backdrop fade ${isOpen ? 'show' : ''}`} style={{
                        zIndex: -1
                    }}></div>
                </div>,
                document.body)}
        </>
    )
};

