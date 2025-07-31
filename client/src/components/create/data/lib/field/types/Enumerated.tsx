import { ArrayFieldArray, EnumeratedFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import SBSelect, { Option } from 'components/common/SBSelect';
import SBInfoBtn from "components/common/SBInfoBtn";
import { isOptional } from "../../utils";

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

    const _optional = isOptional(options);

    return (
        <div className='form-group'>
            <label><strong>{name}{ _optional ? "" : "*"}</strong></label>
            <SBInfoBtn comment={_comment} />
            <div className={`card-body ${toggle ? '' : 'collapse'}`}>
                <SBSelect id={name} name = {name} data = {getOptions}
                onChange={handleChange}
                placeholder={`${name} options`}
                value={selectedValue}
                isClearable />
            </div>
        </div>
    );
};

export default Enumerated;