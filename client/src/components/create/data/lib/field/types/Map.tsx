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

const Map = (props: FieldProps) => {
    const { field, fieldChange, parent, value } = props;
    let [_idx, name, _type, options, _comment, children] = destructureField(field);
    const [toggle, setToggle] = useState(false);
    const [data, setData] = useState(value);

    const isID = options.some(opt => String(opt) === '=');

    // If isID, map child field name to child ID
    const nameToIdMap = useMemo(() => {
        if (!Array.isArray(children)) return {};

        const newChildren: Record<string | number, string | number> = {};
        children.forEach(child => {
            if (Array.isArray(child)) {
                const childID = child[0]; 
                const childName = child[1];
                newChildren[childName] = childID;
            }
        });
        return newChildren;
    }, [children]);

    const handleChange = (childKey: string, childValue: any) => {
        setData((prev: any) => {
            const updated = { ...prev };
            const key = isID ? (nameToIdMap[childKey] ?? childKey) : childKey;

            if (childValue === "" || childValue === undefined || childValue === null) {
                delete updated[key];
            } else {
                updated[key] = childValue;
            }
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
        <div className="p-1 form-group">
            <div className="card" style={{ border: '0px solid #ffffff' }}>
                <div className='card p-1 border-secondary bg-primary text-white'>
                    <SBToggleBtn toggle={toggle} setToggle={setToggle} >
                        <label>{name}{ _optional ? "" : "*"}</label>
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

export default Map;