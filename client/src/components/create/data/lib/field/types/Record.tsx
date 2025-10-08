import { ArrayFieldArray } from "components/create/schema/interface";
import React, { useEffect, useMemo, useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import Field from "../Field";
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, destructureOptions } from "../../utils";
import SBClearDataBtn from "components/common/SBClearDataBtn";
import SBHierarchyBtn from "components/common/SBHierarchyBtn";

interface FieldProps {
    field: ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
    toClear: boolean;
    ancestor?: string;
}

const Record = (props: FieldProps) => {
    const { field, fieldChange, value, toClear, ancestor } = props;
    const [_idx, name, _type, options, _comment, children] = destructureField(field);
    const optionsObj = destructureOptions(options);

    const [toggle, setToggle] = useState(false);
    const [data, setData] = useState(value);
    const [clear, setClear] = useState(toClear);

    const _ordered = optionsObj.ordered;
    const _optional = optionsObj.isOptional;
    
    useEffect(() => {
        setClear(toClear);
        if (toClear) {
            setData("");
            setToggle(true);
            setTimeout(() => setToggle(false), 0); // make sure toggled off fields are still reset
        }
    }, [toClear]);

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

    const handleChange = (childKey: string, childValue: any) => {
         setData((prev: any) => {
            const updated = { ...prev };
            if (childValue === "" || childValue === undefined || childValue === null) {
                if (_ordered) {
                    updated[childKey] = undefined; // if ordered, preserve order
                } else {
                    delete updated[childKey];
                }
            } else {
                updated[childKey] = childValue;
            }
            // Update the overarching generatedMessage under this array field's key (name)
            if (Object.keys(updated).length === 0) {
                fieldChange(name, "");
            } else {    
                fieldChange(name, updated);
            }
            return updated;
        });
    };

    const childrenCards = useMemo(() => {
        if (!toggle) return null;
        
        return children.map((child, idx) => {
            let [_childIdx, childName, _childType, _childOptions, _childComment] = destructureField(child);
            let childValue = data?.[childName];

            return (
                <div key={idx}>
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

    return (
        <>
            <div className='form-group d-flex'>
                <div className="d-flex align-items-center w-100">
                    <label style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                    {ancestor ? <SBHierarchyBtn ancestor={ancestor || ""} current={field} /> : null}
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

export default Record;