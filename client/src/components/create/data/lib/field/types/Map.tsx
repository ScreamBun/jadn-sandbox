import { ArrayFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import Field from "../Field";

interface FieldProps {
    field: ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const Map = (props: FieldProps) => {
    const { field, fieldChange, parent, value } = props;
    const [name, type, options, _comment, children] = field;
    const [toggle, setToggle] = useState(true);
    const [data, setData] = useState(value);

    const handleChange = (childKey: string, childValue: any) => {
         setData((prev: any) => {
            const updated = { ...prev };
            if (childValue === "" || childValue === undefined || childValue === null) {
                delete updated[childKey];
            } else {
                updated[childKey] = childValue;
            }
            // Update the overarching generatedMessage under this array field's key (name)
            fieldChange(name, updated);
            return updated;
        });
    };

    const childrenCards = children.map((child, idx) => {
        return (
            <Field
                key={idx}
                field={child}
                fieldChange={handleChange}
                parent={name}
            />
        );
    });

    return (
        <div className='form-group m-1'>
            <label><strong>{name}</strong></label>
            <p className = "card-subtitle form-text text-muted text-wrap">{_comment}</p>
            <hr />
            <div className={`card-body m-1 ${toggle ? '' : 'collapse'}`}>
                {childrenCards}
            </div>
        </div>
    );
};

export default Map;