import { FieldOfArray, AllFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import Field from "../Field";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import SBInfoBtn from "components/common/SBInfoBtn";

interface FieldProps {
    field: AllFieldArray | FieldOfArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const ArrayOf = (props: FieldProps) => {
    const { field, fieldChange, parent, value } = props;

    let _idx, name, type, optionsRaw, options: string[], _comment;
    if (field.length == 5) {
        [_idx, name, type, optionsRaw, _comment] = field;
    } else {
        [name, type, optionsRaw, _comment] = field;
    }
    options = Array.isArray(optionsRaw) ? optionsRaw : [optionsRaw];
        
    const [toggle, setToggle] = useState(true);
    const [toggleField, setToggleField] = useState<{ [key: string]: Boolean }>({ [0]: true });
    const keyType = options.find(opt => opt.startsWith("*"))?.slice(1);
    const [keyList, setKeyList] = useState<Array<{name: any , key: any}>>([]);
    const [cards, setCards] = useState([keyType]);

    const onChange = (nextKeyList?: typeof keyList) => {
        const keys = nextKeyList ?? keyList;
        let output = [];

        for (let i = 0; i < keys.length; i++) {
            output.push(keys[i].key);
        }
        fieldChange(String(name), output);
    };

    const addKey = (name:any, key: any) => {
        setKeyList(prev => {
            const existingIndex = prev.findIndex(item => item.name === name);
            let updated = [...prev];
            if (key === undefined || key === null || key === "") {
                if (existingIndex !== -1) updated.splice(existingIndex, 1);
            } else if (existingIndex !== -1) {
                updated[existingIndex].key = key;
            } else {
                updated.push({ name, key });
            }
            onChange(updated);
            return updated;
        });
    };

    const addCard = () => {
        setCards(prevCards => [
            ...prevCards,
            keyType
        ]);
    };

   const fields = cards.map((item, i) => {
        const key = item? item : "";
        
        let keyField: AllFieldArray;
        if (key === "Array" || key === "Record" || key === "Map" || key === "Enumerated" || key === "Choice") {
            keyField = [`${name} ${key} ${i+1}`, key, options, "", []];
        } else {
            keyField = [i, `${name} ${key} ${i+1}`, key, options, ""];
        }

        const keyEntry = keyList.find(entry => entry.name === `${name} ${i+1} ${key}`);

        return (
            <div className="card" style={{ border: '0px solid #ffffff' }}>
                <div className='card-header p-1 border-secondary bg-primary text-white'>
                    <SBToggleBtn toggle={toggleField} setToggle={setToggleField} index={i} >
                        <div className='card-title'>
                            {`${key} ${i+1}`}
                            <SBInfoBtn comment={typeof _comment === 'string' ? _comment : undefined} />
                        </div>
                    </SBToggleBtn>
                </div>
                <div className={`card-body ${toggleField[i] == true ? '' : 'collapse'}`} id={`${i}`}>
                    <Field key={keyField[1]} field={keyField} parent={String(name)} fieldChange={addKey} value={keyEntry?.key ?? ""} />
                </div>
            </div>
        )
    });

    return (
       <div className='form-group'>
            <div className = "card" style={{ border: '0px solid #ffffff' }}>
                <div className='card-header p-1 border-secondary bg-primary text-white'>
                    <SBToggleBtn toggle={toggle} setToggle={setToggle} >
                        <strong>{name}</strong>
                        <SBInfoBtn comment={typeof _comment === 'string' ? _comment : undefined} />
                    </SBToggleBtn>
                </div>
                <div className={`card-body ${toggle ? '' : 'collapse'}`}>
                    {fields}
                    <div className="p-1">
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

export default ArrayOf;