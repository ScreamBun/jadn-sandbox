import { FieldOfArray, AllFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import Field from "../Field";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons";
interface FieldProps {
    field: FieldOfArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const MapOf = (props: FieldProps) => {
    const { field, fieldChange, parent, value } = props;
    const [name, type, options, _comment] = field;
    const [toggle, setToggle] = useState(true);
    const [toggleField, setToggleField] = useState<{ [key: string]: Boolean }>({ [0]: true });

    // Extract ktype and vtype
    const keyType = options.find(opt => opt.startsWith("+") || opt.startsWith(">"))?.slice(1);
    const valueType = options.find(opt => opt.startsWith("*"))?.slice(1);
    const [cards, setCards] = useState([{ key: keyType, value: valueType }]);
    const [keyList, setKeyList] = useState<Array<{name: any , key: any}>>([]);
    const [valueList, setValueList] = useState<Array<{name: any , value: any}>>([]);

    const onChange = (nextKeyList?: typeof keyList, nextValueList?: typeof valueList) => {
        const keys = nextKeyList ?? keyList;
        const values = nextValueList ?? valueList;

        const isRecord = keyType === "String" || keyType === "Enumerated" ? true : false;

        let output: any;
        if (isRecord) {
            output = {};
        } else {
            output = [];
        }
        for (let i = 0; i < keys.length; i++) {
            if (isRecord) {
                output[keys[i].key] = values[i]?.value;
            } else {
                output.push(keys[i].key, values[i]?.value);
            }
        }
        fieldChange(name, output);
    };


    const addKey = (entryName: any, key: any) => {
        setKeyList(prev => {
            const existingIndex = prev.findIndex(item => item.name === entryName);
            let updated = [...prev];
            if (key === undefined || key === null || key === "") {
                if (existingIndex !== -1) updated.splice(existingIndex, 1);
            } else if (existingIndex !== -1) {
                updated[existingIndex].key = key;
            } else {
                updated.push({ name: entryName, key });
            }
            onChange(updated, valueList);
            return updated;
        });
    };

    const addValue = (entryName: any, value: any) => {
        setValueList(prev => {
            const existingIndex = prev.findIndex(item => item.name === entryName);
            let updated = [...prev];
            if (value === undefined || value === null || value === "") {
                if (existingIndex !== -1) updated.splice(existingIndex, 1);
            } else if (existingIndex !== -1) {
                updated[existingIndex].value = value;
            } else {
                updated.push({ name: entryName, value });
            }
            onChange(keyList, updated);
            return updated;
        });
    };

    const addCard = () => {
        setCards(prevCards => [
            ...prevCards,
            { key: keyType, value: valueType }
        ]);
    };

    // Return MapOf-Name : {k:v, k:v} or MapOf-Name : [k,v,k,v]
    const fields = cards.map((item, i) => {
        const key = item?.key ?? "";
        const value = item?.value ?? "";
        
        let keyField: AllFieldArray;
        if (key === "Array" || key === "Record" || key === "Map" || key === "Enumerated" || key === "Choice") {
            keyField = [`${name} ${i+1} ${key}`, key, options, "", []];
        } else {
            keyField = [i, `${name} ${i+1} ${key}`, key, options, ""];
        }

        let valField: AllFieldArray;
        if (value === "Array" || value === "Record" || value === "Map" || value === "Enumerated" || value === "Choice") {
            valField = [`${name} ${i+1} ${value}`, value, options, "", []];
        } else {
            valField = [i, `${name} ${i+1} ${value}`, value, options, ""];
        }

        const keyEntry = keyList.find(entry => entry.name === `${name} ${i+1} ${key}`);
        const valueEntry = valueList.find(entry => entry.name === `${name} ${i+1} ${value}`);

        return (
            <div className='form-group' key={self.crypto.randomUUID()}>
                <div className='card'>
                    <div className='card-header p-2'>
                        <SBToggleBtn toggle={toggleField} setToggle={setToggleField} index={i} >
                            <div className='card-title m-2'>
                                {name} {i + 1}
                            </div>
                        </SBToggleBtn>
                    </div>
                    <div className={`card-body mx-2 ${toggleField[i] == true ? '' : 'collapse'}`} id={`${i}`}>
                        <Field key={keyField[1]} field={keyField} parent={name} fieldChange={addKey} value={keyEntry?.key ?? ""} />
                        <Field key={valField[1]} field={valField} parent={name} fieldChange={addValue} value={valueEntry?.value ?? ""} />
                    </div>
                </div>
            </div >
        )
    });
    
    // Add mapping button

    // Remove mapping button

    return (
        <div className='form-group m-3'>
            <div className = 'card'>
                <div className='card-header p-4 d-flex align-items-center justify-content-between'>
                    <label><strong>{name}</strong></label>
                    {_comment ? <small className = "card-subtitle form-text text-muted test-wrap mr-3">{_comment}</small> : ""}
                    <SBToggleBtn toggle={toggle} setToggle={setToggle} />
                </div>
                <div className={`card-body mx-2 ${toggle ? '' : 'collapse'}`}>
                    {fields}
                    <div className="p-2">
                        {<button
                            type="button"
                            className={`btn btn-sm btn-block btn-primary`}
                            title={`Add Field to ${name}`}
                            onClick={addCard}>
                            <FontAwesomeIcon icon={faPlusSquare} />
                        </button>}                    
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapOf;