import { ArrayFieldArray } from "components/create/schema/interface";
import React, { useEffect, useMemo, useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import Field from "../Field";
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, isOptional } from "../../utils";
import SBClearDataBtn from "components/common/SBClearDataBtn";

interface FieldProps {
    field: ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
    toClear: boolean;
}

const Map = (props: FieldProps) => {
    const { field, fieldChange, parent, value, toClear } = props;
    let [_idx, name, _type, options, _comment, children] = destructureField(field);
    const [toggle, setToggle] = useState(false);
     
    const [clear, setClear] = useState(toClear);
    useEffect(() => {
        setClear(toClear);
        if (toClear) {
            setData("");
            setToggle(true);
            setTimeout(() => setToggle(false), 0); // make sure toggled off fields are still reset
        }
    }, [toClear]);
    
    const [data, setData] = useState(value);

    const isID = options.some(opt => String(opt) === '=');
    const _ordered = options.some(opt => opt.startsWith("q"));

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
                if (_ordered) {
                    updated[key] = undefined; // if ordered, preserve order
                } else {
                    delete updated[key];
                }
            } else {
                updated[key] = childValue;
            }
            if (Object.keys(updated).length === 0) {
                fieldChange(name, "");
            } else {    
                fieldChange(name, updated);
            }
            return updated;
        });
    };
    
    // Initialize/maintain ordered keys once when opened
    useEffect(() => {
        if (!toggle || !_ordered) return;
        if (!children || children.length === 0) return;

        setData((prev: any) => {
            const next: Record<string, any> = { ...(prev ?? {}) };
            let changed = false;

            children.forEach(ch => {
                const [_ci, childName] = destructureField(ch);
                if (!(childName in next)) {
                    next[childName] = undefined; // preserve key order by inserting in schema order
                    changed = true;
                }
            });

            if (changed) {
                fieldChange(name, next);
            }
            return next;
        });
    }, [toggle, _ordered, children, name, fieldChange]);

    const childrenCards = useMemo(() => {
        if (!toggle) return null;
        
        return children.map((child, idx) => {
            let [_childIdx, childName, _childType, _childOptions, _childComment] = destructureField(child);
            const key = isID ? (nameToIdMap[childName] ?? childName) : childName;
            let childValue = data?.[key];

            return (
                <div className="ms-3 mt-2" key={idx}>
                    <Field
                        key = {idx}
                        field={child}
                        fieldChange={handleChange}
                        parent={name}
                        value={childValue}
                        toClear={clear}
                    />
                </div>
            );
        });
    }, [toggle, children, name, clear]);

    const _optional = isOptional(options);

    return (
        <>
            <div className="p-1 form-group d-flex">
                <div className="d-flex align-items-center w-100">
                    <label style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                    <SBInfoBtn comment={_comment} />
                    <SBClearDataBtn onClick={() => {
                        setClear(true);
                        setTimeout(() => setClear(false), 0);
                    }} />
                    <SBToggleBtn toggle={toggle} setToggle={setToggle} />
                </div>
            </div>
            <div className={`ms-5 ${toggle ? '' : 'collapse'}`}>
                {childrenCards}
            </div>
        </>
    );
};

export default Map;