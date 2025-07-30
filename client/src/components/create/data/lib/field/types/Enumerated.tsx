import { ArrayFieldArray, EnumeratedFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import SBSelect, { Option } from 'components/common/SBSelect';

interface FieldProps {
    field: ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children?: EnumeratedFieldArray | EnumeratedFieldArray[];
    parent?: string;
    value?: any;
}

const Enumerated = (props: FieldProps) => {
    const { field, fieldChange, parent, value } = props;
    const [name, type, options, _comment, children] = field;
    const [toggle, setToggle] = useState(true);
    const [selectedValue, setSelectedValue] = useState<Option | string>(value != '' ? { 'label': value, 'value': value } : '');

    const handleChange = (e: Option) => {
        if (e == null) {
            setSelectedValue('');
            fieldChange(name, '');
        } else {
            setSelectedValue(e);
            fieldChange(name, e.value);
        }
    }

    const getOptions = children.map((child) => {
        return child[1];
    });

    return (
        <div className='form-group ml-1 my-1'>
            <div className='card'>
                <div className='card-header p-2 d-flex align-items-center justify-content-between'>
                    <label><strong>{name}</strong></label>
                    {_comment ? <small className = "card-subtitle form-text text-muted test-wrap mr-3">{_comment}</small> : ""}
                    <SBToggleBtn toggle={toggle} setToggle={setToggle} />
                </div>
                <div className={`card-body ml-1 my-1 ${toggle ? '' : 'collapse'}`}>
                    <SBSelect id={name} name = {name} data = {getOptions}
                    onChange={handleChange}
                    placeholder={`${name} options`}
                    value={selectedValue}
                    isClearable />
                </div>
            </div>
        </div>
    );
};

export default Enumerated;