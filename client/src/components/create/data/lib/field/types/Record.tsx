import { ArrayFieldArray } from "components/create/schema/interface";
import React, { useMemo, useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import Field from "../Field";
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, isOptional } from "../../utils";

interface FieldProps {
    field: ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const Record = (props: FieldProps) => {
    const { field, fieldChange, parent, value } = props;
    const [_idx, name, _type, options, _comment, children] = destructureField(field);
    const [toggle, setToggle] = useState(false);
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

    const childrenCards = useMemo(() => {
        if (!toggle) return null;
        
        return children.map((child, idx) => {
            return (
                <div className="ms-3 mt-2" key={idx}>
                    <Field
                        key = {idx}
                        field={child}
                        fieldChange={handleChange}
                        parent={name}
                    />
                </div>
            );
        });
    }, [toggle, children, name]);

    const _optional = isOptional(options);

    return (
        <div className='form-group'>
            <div className = "card" style={{ border: '0px' }}>
                <div className='card p-1 border-secondary bg-primary text-white'>
                    <SBToggleBtn toggle={toggle} setToggle={setToggle} >
                        <label><strong>{name}{ _optional ? "" : "*"}</strong></label>
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