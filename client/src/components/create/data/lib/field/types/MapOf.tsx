import { FieldOfArray, AllFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import Field from "../Field";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { getSelectedSchema } from "reducers/util";
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
    const schemaObj = useSelector(getSelectedSchema);

    // Keep track of cards
    const [idNumber, setIdNumber] = useState(1);

    // Extract ktype and vtype
    const keyType = options.find(opt => opt.startsWith("+") || opt.startsWith(">"))?.slice(1);
    const valueType = options.find(opt => opt.startsWith("*"))?.slice(1);
    const [cards, setCards] = useState([{ id: 1, key: keyType, value: valueType }]);
    const [keyList, setKeyList] = useState<Array<{name: any , key: any}>>([]);
    const [valueList, setValueList] = useState<Array<{name: any , value: any}>>([]);
    const [output, setOutput] = useState<any>();

    const onChange = (nextKeyList?: typeof keyList, nextValueList?: typeof valueList) => {
        const keys = nextKeyList ?? keyList;
        const values = nextValueList ?? valueList;

        const types = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === keyType) : [];
        let trueTypeDef: string = types.find((t:any) => t[0] === keyType || t[1] === keyType);
        let trueTypeVal = typeof trueTypeDef[0] === 'string' ? trueTypeDef[1] : trueTypeDef[2];

        const isRecord = trueTypeVal === "String" || trueTypeVal === "Enumerated" ? true : false;

        if (isRecord) {
            if (output === undefined) {
                setOutput({});
            }
        } else {
            if (output === undefined) {
                setOutput([])
            }
        }
        let newOutput: any = isRecord ? {} : [];
        for (let i = 0; i < keys.length; i++) {
            const keyVal = keys[i]?.key;
            const valVal = values[i]?.value;
            if (isRecord) {
                if (newOutput[keyVal] === undefined) {
                    newOutput[keyVal] = valVal;
                } else {
                    newOutput[keyVal] = {...newOutput[keyVal], valVal};
                }
            } else {
                newOutput.push(keyVal, valVal);
            }
        }
        setOutput(newOutput);
        fieldChange(name, newOutput);
    };

    React.useEffect(() => {
        onChange();
    }, [keyList, valueList]);

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
            return updated;
        });
    };

    const addCard = () => {
        setIdNumber(prevId => {
            const newId = prevId + 1;
            setCards(prevCards => [
                ...prevCards,
                { id: newId, key: keyType, value: valueType }
            ]);
            return newId;
        });
    };

    // Return MapOf-Name : {k:v, k:v} or MapOf-Name : [k,v,k,v]
    const fields = cards.map((item, i) => {
        const key = item?.key ?? "";
        const value = item?.value ?? "";
        const id = item?.id ?? i;

        const keyEntry = keyList.find(entry => entry.name === `${name} ${id} ${key}`);
        const valueEntry = valueList.find(entry => entry.name === `${name} ${id} ${value}`);

        const handleKeyChange = (_: string, v: any) => addKey(`${name} ${id} ${key}`, v);
        const handleValueChange = (_: string, v: any) => addValue(`${name} ${id} ${value}`, v);

        const types = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === key) : [];
        let trueTypeDef: string = types.find((t:any) => t[0] === key || t[1] === key);
        let trueTypeVal = typeof trueTypeDef[0] === 'string' ? trueTypeDef[1] : trueTypeDef[2];

        let keyField: AllFieldArray;
        if (trueTypeVal === "Array" || trueTypeVal === "Record" || trueTypeVal === "Map" || trueTypeVal === "Enumerated" || trueTypeVal === "Choice") {
            keyField = [`${name} ${id} ${key}`, key, options, "", []];
        } else {
            keyField = [id, `${name} ${id} ${key}`, key, options, ""];
        }

        const valtypes = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === value) : [];
        trueTypeDef = valtypes.find((t:any) => t[0] === value || t[1] === value);
        trueTypeVal = typeof trueTypeDef[0] === 'string' ? trueTypeDef[1] : trueTypeDef[2];

        let valField: AllFieldArray;
        if (trueTypeVal === "Array" || trueTypeVal === "Record" || trueTypeVal === "Map" || trueTypeVal === "Enumerated" || trueTypeVal === "Choice") {
            valField = [`${name} ${id} ${value}`, value, options, "", []];
        } else {
            valField = [id, `${name} ${id} ${value}`, value, options, ""];
        }

        return (
            <div className='form-group' key={typeof valField[0] === "string" ? valField[0] : valField[1]}>
                <div className='card'>
                    <div className='card-header p-2'>
                        <SBToggleBtn toggle={toggleField} setToggle={setToggleField} index={i} >
                            <div className='card-title m-1'>
                                {name} {id}
                            </div>
                        </SBToggleBtn>
                    </div>
                    <div className={`card-body m-1 ${toggleField[i] == true ? '' : 'collapse'}`} id={`${id}`}>
                        <Field key={`${name} ${id} ${key}`} field={keyField} parent={name} fieldChange={handleKeyChange} value={keyEntry?.key ?? ""} />
                        <Field key={`${name} ${id} ${value}`} field={valField} parent={name} fieldChange={handleValueChange} value={valueEntry?.value ?? ""} />
                    </div>
                </div>
            </div >
        )
    });

    // Remove mapping button

    return (
        <div className='form-group m-1'>
            <label><strong>{name}</strong></label>
            <p className = "card-subtitle form-text text-muted text-wrap">{_comment}</p>
            <hr />
            <div className={`card-body m-1 ${toggle ? '' : 'collapse'}`}>
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
    );
};

export default MapOf;