import React, { memo, useState } from 'react';
//import equal from 'fast-deep-equal';
import {
    Button, ButtonGroup, Input, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { zip } from '../../../../../utils';
import { InfoConfig } from '../../../interface';
import { StandardFieldKeys, StandardFieldObject, PrimitiveTypeObject, TypeKeys } from '../consts';
import OptionsModal from '../options/OptionsModal';
import { sbToastError } from 'components/common/SBToast';

// Interface
interface PrimitiveEditorProps {
    dataIndex: number;
    value: Array<any>;
    change: (v: any, i: number) => void;
    remove: (i: number) => void;
    config: InfoConfig;
}

// Primitive Editor
const PrimitiveEditorBtnStyle = memo(function PrimitiveEditorBtnStyle(props: PrimitiveEditorProps) {
    const { value, dataIndex, config, change } = props;
    const [modal, setModal] = useState(false);

    let valueObjInit: StandardFieldObject | PrimitiveTypeObject;
    if (Number.isInteger(value[0])) {
        valueObjInit = zip(StandardFieldKeys, value) as StandardFieldObject;
    } else {
        valueObjInit = zip(TypeKeys, value) as PrimitiveTypeObject;
    }
    const [valueObj, setValueObj] = useState(valueObjInit);

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

    const removeAll = () => {
        const { dataIndex, remove } = props;
        remove(dataIndex);
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
        <>
            <div className="card border-secondary mb-3">
                <div className="card-header px-2 py-2">
                    <div className='row'>
                        <div className='col'>
                            <a role="button" className="btn btn-sm btn-outline-primary mr-2 disabled" title='index'>
                                {dataIndex}
                            </a>
                            <span id={valueObj.name} className="card-title">{`${valueObj.name} (${valueObj.type})`}</span>
                        </div>
                        <div className='col'>
                            <ButtonGroup size="sm" className="float-right">
                                <Button color="danger" onClick={removeAll} title={`Delete ${valueObj.type}`}>
                                    <FontAwesomeIcon icon={faMinusCircle} />
                                </Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </div>
                <div className="card-body px-2 py-2">
                    <div className="row m-0">
                        <div className="col-md-4">
                            <Label className='mb-0'>Name</Label>
                            <Input
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
                            <Label className='mb-0'>&nbsp;</Label>
                            <ButtonGroup>
                                <Button color="primary" className='p-2 btn-sm' onClick={toggleModal}>Type Options</Button>
                                <OptionsModal
                                    optionValues={valueObj.options}
                                    isOpen={modal}
                                    optionType={valueObj.type}
                                    toggleModal={toggleModal}
                                    saveModal={saveModal}
                                />
                            </ButtonGroup>
                        </div>
                        <div className="col-md-6">
                            <Label className='mb-0'>Comment</Label>
                            <Input
                                name="PrimitveEditorCcommentomment"
                                type="textarea"
                                placeholder="Comment"
                                className='form-control'
                                rows={1}
                                value={valueObj.comment}
                                onChange={onChange}
                                onBlur={onBlur}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});

export default PrimitiveEditorBtnStyle;
