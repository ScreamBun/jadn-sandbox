import { ArrayFieldArray } from "components/create/schema/interface";
import React, { useEffect, useMemo, useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import Field from "../Field";
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, getUniqueOrSet, isOptional } from "../../utils";
import SBClearDataBtn from "components/common/SBClearDataBtn";

interface FieldProps {
    field: ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
    toClear: boolean;
}

const Array = (props: FieldProps) => {
    const { field, fieldChange, parent, value, toClear } = props;
    const [_idx, name, _type, options, _comment, children] = destructureField(field);
    const [toggle, setToggle] = useState(false);
    const [data, setData] = useState(value);
    const [errMsg, setErrMsg] = useState<string | undefined>(undefined);


    const _optional = isOptional(options);
    const _set = options.some(opt => opt.startsWith("s"));
    const [idNumber, setIdNumber] = useState(0);
    const [inputOrder, setInputOrder] = useState<Record<any, { order: number, value: any }>>({}); // Key, {Order, Value}

    const [clear, setClear] = useState(toClear);
    useEffect(() => {
        setClear(toClear);
        if (toClear) {
            setData("");
            setToggle(true);
            setInputOrder({});       // reset set ordering on clear
            setIdNumber(0);
            setTimeout(() => setToggle(false), 0); // make sure toggled off fields are still reset
        }
    }, [toClear]);

    const hasIPvNetOption = options.some(opt => opt.includes("ipv4-net") || opt.includes("ipv6-net"));
    const handleChange = (childKey: string, childValue: any) => {
        // Update inputOrder and use the computed value immediately
        setInputOrder(prev => {
            const hasKey = Object.keys(prev).includes(childKey);
            const nextInputOrder = {
                ...prev,
                [childKey]: {
                    order: hasKey ? prev[childKey].order : idNumber,
                    value: childValue
                }
            };
            if (!hasKey) setIdNumber(n => n + 1);

            // Now update data and call fieldChange using nextInputOrder (not stale state)
            setData((prevData: any[] = []) => {
                const idx = children.findIndex((child: any) => child[0] === childKey || child[1] === childKey);
                const updated = [...prevData];
                if (childValue === "") {
                    if (_set) {
                        delete nextInputOrder[childKey];
                    } else {
                        updated[idx] = undefined; // preserve order
                    }
                } else {
                    updated[idx] = childValue;
                }
                while (updated.length && (updated[updated.length - 1] === undefined || updated[updated.length - 1] === "" || updated[updated.length - 1] === null)) {
                    updated.pop();
                }

                if (Object.keys(updated).length === 0) {
                    fieldChange(name, "");
                } else {
                    if (_set) {
                        const orderedUpdated = Object.entries(nextInputOrder)
                            .sort((a, b) => a[1].order - b[1].order)
                            .map(([, v]) => v.value);

                        // Join array with / if ipvnet
                        if (hasIPvNetOption) {
                            fieldChange(name, orderedUpdated.join("/"));
                        } else {
                            fieldChange(name, orderedUpdated);
                        }
                    } else {
                        // Join array with / if ipvnet
                        if (hasIPvNetOption) {
                            const filteredUpdated = updated.filter(item => item !== undefined && item !== "" && item !== null);
                            fieldChange(name, filteredUpdated.join("/"));
                        } else {
                            fieldChange(name, updated);
                        }
                    }
                }

                setErrMsg(getUniqueOrSet(updated, options, "Array"));
                return updated;
            });

            return nextInputOrder;
        });
    };

    const childrenCards = useMemo(() => {
        if (!toggle) return null;
        
        return children.map((child, idx) => {
            const childValue = data?.[idx];
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

    return (
        <>
            <div className='form-group d-flex'>
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
                {errMsg && <div className="text-danger">{errMsg}</div>}
                {childrenCards}
            </div>
        </>
    );
};

export default Array;