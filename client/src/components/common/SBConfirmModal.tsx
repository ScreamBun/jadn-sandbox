import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ModalSize } from "components/create/schema/structure/editors/options/ModalSize";
import React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";


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
                        <Button color="secondary" className='float-right btn-sm' title='Close' onClick={onCloseClick}>
                            <FontAwesomeIcon icon={faClose} />
                        </Button>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <p>{message}</p>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={onNoClick}>No</Button>
                    <Button color="success" onClick={onYesClick}>Yes</Button>
                </ModalFooter>
            </Modal>
        </>
    )
};

