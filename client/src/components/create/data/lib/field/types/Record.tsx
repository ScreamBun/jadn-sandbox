import { ArrayFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import Field from "../Field";
import SBInfoBtn from "components/common/SBInfoBtn";
import { isOptional } from "../../utils";

interface FieldProps {
    field: ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const Record = (props: FieldProps) => {
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

    const _optional = isOptional(options);

    return (
        <div className='form-group'>
            <div className = "card" style={{ border: '0px solid #ffffff' }}>
                <div className='card-header p-1 border-secondary bg-primary text-white'>
                    <SBToggleBtn toggle={toggle} setToggle={setToggle} >
                        <label><strong>{name} { _optional ? "(Optional)" : ""}</strong></label>
                        <SBInfoBtn comment={_comment} />
                    </SBToggleBtn>
                </div>
                <div className={`card-body ${toggle ? '' : 'collapse'}`}>
                    {childrenCards}
                </div>
            </div>
        </div>
    );
};

export default Record;