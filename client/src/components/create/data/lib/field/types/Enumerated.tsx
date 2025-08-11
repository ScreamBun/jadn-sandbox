import { ArrayFieldArray, EnumeratedFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBSelect, { Option } from 'components/common/SBSelect';
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, isOptional } from "../../utils";

interface FieldProps {
    field: ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children?: EnumeratedFieldArray | EnumeratedFieldArray[];
    parent?: string;
    value?: any;
}

const Enumerated = (props: FieldProps) => {
    const { field, fieldChange, parent, value } = props;
    let [_idx, name, _type, options, _comment, children] = destructureField(field);
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

    const isID = options.some(opt => String(opt) === '=');

    const enumChildren = Array.isArray(children) ? children.filter(c => Array.isArray(c)) : [];

    const getOptions: Option[] = enumChildren.map(child => {
        const id = child[0];
        const fname = child[1];
        if (isID) {
            return { label: String(fname), value: id };
        }
        return { label: String(fname), value: String(fname) };
    });

    const _optional = isOptional(options);

    return (

        <div className="p-1 form-group">
            <div className="card jadn-type">
                <div className='card-header d-flex align-items-center justify-content-between'>
                    <div className="d-flex align-items-center">
                        <label>{name}{ _optional ? "" : "*"}</label>
                        <SBInfoBtn comment={_comment} />
                    </div>
                    <SBSelect id={name} name = {name} data = {getOptions}
                        onChange={handleChange}
                        placeholder={`${name} options`}
                        value={selectedValue}
                        isClearable 
                        isSmStyle
                    />
                </div>
            </div>
        </div>
    );
};

export default Enumerated;