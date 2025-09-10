import { ArrayFieldArray } from "components/create/schema/interface";
import React, { useEffect, useMemo, useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import Field from "../Field";
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, getUniqueOrSet, isOptional } from "../../utils";
import SBClearDataBtn from "components/common/SBClearDataBtn";
import SBHighlightButton from "components/common/SBHighlightButton";
import { clearHighlight } from "actions/highlight";
import { useDispatch } from "react-redux";

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
    const dispatch = useDispatch();

    const [clear, setClear] = useState(toClear);
    useEffect(() => {
        setClear(toClear);
        if (toClear) {
            setData("");
            setToggle(true);
            dispatch<any>(clearHighlight());
            setTimeout(() => setToggle(false), 0); // make sure toggled off fields are still reset
        }
    }, [toClear]);

    const handleChange = (childKey: string, childValue: any) => {
        setData((prev: any[] = []) => {
            const idx = children.findIndex((child: any) => child[0] === childKey || child[1] === childKey);
            const updated = [...prev];
            updated[idx] = childValue;
            while (updated.length && (updated[updated.length - 1] === undefined || updated[updated.length - 1] === "" || updated[updated.length - 1] === null)) {
                updated.pop();
            }
            if (Object.keys(updated).length === 0) {
                fieldChange(name, "");
            } else {    
                fieldChange(name, updated);
            }
            setErrMsg(getUniqueOrSet(updated, options, "Array"));
            return updated;
        });
    };

    let highlightWords: any = useMemo(() => {
        const words: string[] = [`${name}`];

        if (data && typeof data === "object") {
            Object.entries(data).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== "") {
                    words.push(`${JSON.stringify(v)}`);
                }
            });
        }

        return words;
    }, [name, data]);

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

    const _optional = isOptional(options);

    return (
        <>
            <div className='form-group d-flex'>
                <div className="d-flex align-items-center w-100">
                    <label style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                    <SBInfoBtn comment={_comment} />
                    <SBHighlightButton highlightWords={highlightWords} />
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