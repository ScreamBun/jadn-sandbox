import { FieldOfArray, ArrayFieldArray, StandardFieldArray, AllFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import Field from "../Field";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { getSelectedSchema } from "reducers/util";
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, getMaxv, getMinv, getTrueType, isOptional } from "../../utils";
interface FieldProps {
    field: FieldOfArray | ArrayFieldArray | StandardFieldArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const MapOf = (props: FieldProps) => {
    const { field, fieldChange, parent, value } = props;
    let [_idx, name, _type, options, _comment, _children] = destructureField(field);

    const [toggle, setToggle] = useState(true);
    const [toggleField, setToggleField] = useState<{ [key: string]: Boolean }>({ [0]: true });
    const schemaObj = useSelector(getSelectedSchema);

    // Keep track of cards
    const [idNumber, setIdNumber] = useState(0);

    // Check if there are enough / too many items
    const [numberOfItems, setNumberOfItems] = useState(0);
    const minv = getMinv(options);
    const maxv = getMaxv(options);

    const _optional = isOptional(options);

    // Extract ktype and vtype
    const keyType = options.find((opt: string) => opt.startsWith("+") || opt.startsWith(">"))?.slice(1);
    const valueType = options.find((opt: string) => opt.startsWith("*"))?.slice(1);
    const [cards, setCards] = useState<Array<{id: number, key: string | undefined, value: string | undefined}>>([]); // Start empty
    const [keyList, setKeyList] = useState<Array<{name: any , key: any}>>([]);
    const [valueList, setValueList] = useState<Array<{name: any , value: any}>>([]);
    const [output, setOutput] = useState<any>();

    const onChange = (nextKeyList?: typeof keyList, nextValueList?: typeof valueList) => {
        const keys = nextKeyList ?? keyList;
        const values = nextValueList ?? valueList;

        const types = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === keyType) : [];
        let trueTypeDef: any = types.find((t:any) => t[0] === keyType || t[1] === keyType);
        let trueTypeVal = trueTypeDef ? (typeof trueTypeDef[0] === 'string' ? trueTypeDef[1] : trueTypeDef[2]) : keyType;

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

        // Find keyEntry and valueEntry corresponding to each other
        cards.forEach(card => {
            const keyEntry = keys.find(k => k.name === `${name} ${card.id} ${card.key}`);
            const valueEntry = values.find(v => v.name === `${name} ${card.id} ${card.value}`);
            
            const keyVal = keyEntry?.key;
            const valVal = valueEntry?.value;
            
            // Only add to output if both key and value exist
            if (keyVal !== undefined && valVal !== undefined) {
                if (isRecord) {
                    newOutput[keyVal] = valVal;
                } else {
                    newOutput.push(keyVal, valVal);
                }
            }
        });
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
            setToggleField(prev => ({
                ...prev,
                [newId]: true
            }));
            return newId;
        });
        setNumberOfItems(prev => prev + 1);
    };

    const removeCard = (index: number, keyKey: string, valueKey: string) => {
        setCards(prev => prev.filter((item) => item.id !== index));
        setKeyList(prev => prev.filter(item => item.name !== keyKey));
        setValueList(prev => prev.filter(item => item.name !== valueKey));
        setToggleField(prev => {
            const newToggle = { ...prev };
            delete newToggle[index];
            return newToggle;
        });
        setNumberOfItems(prev => prev - 1);
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

        const types = schemaObj.types;
        let [ trueTypeVal, trueTypeDef ] = getTrueType(types, key);

        let keyField: AllFieldArray;
        let trueTypeComment = trueTypeDef != undefined ? typeof trueTypeDef[0] === 'string' ? trueTypeDef[3] : trueTypeDef[4] : "";
        if (trueTypeVal === "Array" || trueTypeVal === "Record" || trueTypeVal === "Map" || trueTypeVal === "Enumerated" || trueTypeVal === "Choice") {
            keyField = [`${key}`, key, options, trueTypeComment, []];
        } else {
            keyField = [id, `${key}`, key, options, trueTypeComment];
        }

        const valtypes = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === value) : [];
        [ trueTypeVal, trueTypeDef ] = getTrueType(valtypes, value);

        let valField: AllFieldArray;
        trueTypeComment = trueTypeDef != undefined ? typeof trueTypeDef[0] === 'string' ? trueTypeDef[3] : trueTypeDef[4] : "";
        if (trueTypeVal === "Array" || trueTypeVal === "Record" || trueTypeVal === "Map" || trueTypeVal === "Enumerated" || trueTypeVal === "Choice") {
            valField = [`${value}`, value, options, trueTypeComment, []];
        } else {
            valField = [id, `${value}`, value, options, trueTypeComment];   
        }

    return (
        <div className='form-group' key={typeof valField[0] === "string" ? valField[0] : valField[1]}>
            <div className="d-flex align-items-start" style={{ gap: '0.25rem' }}>
                <button
                    type="button"
                    className="border-0 px-2 py-1 btn btn-sm rounded-pill me-1 mt-1"
                    title="Remove Field"
                    onClick={() => removeCard(id, keyEntry?.name ?? "", valueEntry?.name ?? "")}
                    disabled = {numberOfItems <= minv}
                >
                    <FontAwesomeIcon icon={faCircleXmark} size = "lg" />
                </button>
                <div style={{ flex: '0 1 100%' }}>
                    <div className="d-flex align-items-center w-100">
                        <label style={{ fontSize: "1.1rem" }}>{`${name} ${id}${ _optional ? "" : "*"}`}</label>
                        <SBInfoBtn comment={_comment} />
                        <SBToggleBtn toggle={toggleField} setToggle={setToggleField} index={id} />
                    </div>
                    <div className={`${toggleField[id] == true ? '' : 'collapse'}`} id={`${id}`}>
                        <Field key={`${name} ${id} ${key}`} field={keyField} parent={name} fieldChange={handleKeyChange} value={keyEntry?.key ?? ""} />
                        <Field key={`${name} ${id} ${value}`} field={valField} parent={name} fieldChange={handleValueChange} value={valueEntry?.value ?? ""} />
                    </div>
                </div>
            </div>
        </div>
    );
});

    return (
        <>
            <div className='form-group'>
                <div className="d-flex align-items-center w-100"
                    style={{ borderColor: numberOfItems < minv && !_optional ? 'red' : undefined,
                        borderWidth: numberOfItems < minv && !_optional ? '1px' : undefined,
                        borderStyle: numberOfItems < minv && !_optional ? 'dashed' : undefined }}>
                    <label style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                    <SBInfoBtn comment={_comment} />
                    <SBToggleBtn toggle={toggle} setToggle={setToggle} />
                    {<button
                            type="button"
                            className={`btn btn-sm btn-primary ms-1`}
                            title={`Add Field to ${name}`}
                            onClick={addCard}
                            disabled={maxv !== undefined && (typeof maxv === "number" && numberOfItems >= maxv)}
                        >
                            <FontAwesomeIcon icon={faPlus} size="sm" />
                            {` Add Item`}
                    </button>}    
                </div>
                <div className={`ms-5 ${toggle ? '' : 'collapse'}`}>
                    {cards.length > 0 ? fields : null}
                </div>
            </div>
        </>
    );
};

export default MapOf;