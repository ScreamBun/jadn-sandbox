import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ModalSize } from "components/create/schema/structure/editors/options/ModalSize";
import React from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";


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
            <Modal className={modalSize} isOpen={isOpen} autoFocus={false} returnFocusAfterClose={false}>
                <ModalHeader>
                    <div className='float-left'>
                        {title}
                    </div>
                    <div className='float-right'>
                        <button type='button' className='btn btn-sm btn-secondary float-right' title='Close' onClick={onCloseClick}>
                            <FontAwesomeIcon icon={faClose} />
                        </button>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <p>{message}</p>
                </ModalBody>
                <ModalFooter>
                    <button type='button' className='btn btn-sm btn-success' onClick={onYesClick}>Yes</button>
                    <button type='button' className='btn btn-sm btn-secondary' onClick={onNoClick}>No</button>
                </ModalFooter>
            </Modal>
        </>
    )
};

