import { FieldOfArray, AllFieldArray } from "components/create/schema/interface";
import React, { useEffect, useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import Field from "../Field";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, getMaxv, getMinv, getTrueType, getUniqueOrSet, isOptional } from "../../utils";
import { useSelector } from "react-redux";
import { getSelectedSchema } from "reducers/util";
import SBClearDataBtn from "components/common/SBClearDataBtn";

interface FieldProps {
    field: AllFieldArray | FieldOfArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
    toClear: boolean;
}

const ArrayOf = (props: FieldProps) => {
    const { field, fieldChange, toClear, value } = props;

    let [_idx, name, _type, options, _comment, _children] = destructureField(field);

    const [toggle, setToggle] = useState(true);
    const [keyList, setKeyList] = useState<Array<{name: any , key: any}>>([]);
    const schemaObj = useSelector(getSelectedSchema);
    const [idNumber, setIdNumber] = useState(0);
    // Check if there are enough / too many items
    const [numberOfItems, setNumberOfItems] = useState(0);
    const minv = getMinv(options);
    const maxv = getMaxv(options);
    // Remove { and } from options so they aren't passed to child fields
    options = options.filter(opt => !opt.startsWith('{') && !opt.startsWith('}'));


    const [clear, setClear] = useState(toClear);
    useEffect(() => {
        setClear(toClear);
    }, [toClear]);

    const keyName = options.find(opt => opt.startsWith("*"))?.slice(1);
    const [trueTypeVal, trueTypeDef] = getTrueType(schemaObj.types, String(keyName));
    let keyType = trueTypeVal == undefined ? keyName : trueTypeVal;
    const [cards, setCards] = useState<Array<{idx: number, key: string}>>([]);

    const [errMsg, setErrMsg] = useState<string | undefined>(undefined);

    // Load from saved builder only on first mount when no cards yet
    React.useEffect(() => {
        if (!value) return;
        if (!Array.isArray(value)) return;
        if (value.length === 0) return;
        if (cards.length > 0) return;
        if (!keyType) return;

        const newCards: Array<{ idx: number; key: string }> = [];
        const newKeyList: Array<{ name: any; key: any }> = [];
        for (let i = 0; i < value.length; i++) {
            newCards.push({ idx: i, key: keyType });
            newKeyList.push({ name: `${keyType} ${i + 1}`, key: value[i] });
        }
        setCards(newCards);
        setKeyList(newKeyList);
        setIdNumber(value.length);
        setNumberOfItems(value.length);
    }, [value]);

    React.useEffect(() => {
        const keys = keyList;
        let output = [];
        for (let i = 0; i < keys.length; i++) {
            output.push(keys[i].key);
        }
        if (Object.keys(output).length === 0 || Object.values(output).every(k => k === undefined)) {
            fieldChange(String(name), "");
        } else {    
            fieldChange(String(name), output);
        }
        setErrMsg(getUniqueOrSet(keyList, options, "ArrayOf"));
    }, [keyList]);

    const addKey = (name:any, key: any) => {
        setKeyList(prev => {
            const existingIndex = prev.findIndex(item => item.name === name);
            let updated = [...prev];
            if (key === null || key === "") {
                //if (existingIndex !== -1) updated.splice(existingIndex, 1);
                updated[existingIndex].key = undefined;
            } else if (existingIndex !== -1) {
                updated[existingIndex].key = key;
            } else {
                updated.push({ name, key });
            }
            return updated;
        });
    };

    const addCard = () => {
        if (!keyType) return;
        setCards(prevCards => [...prevCards, { idx: idNumber, key: keyType }]);
        addKey(`${keyType} ${idNumber + 1}`, undefined); // Add new key every time new card is added to maintain order
        setIdNumber(prev => prev + 1);
        setNumberOfItems(prev => prev + 1);
    };

    const removeCard = (index: number, entryName: string) => {
        setCards(prev => prev.filter((item) => item.idx !== index));
        setKeyList(prev => prev.filter(item => item.name !== entryName));
        setNumberOfItems(prev => prev - 1);
    };

    const _optional = isOptional(options);

   const fields = cards.map((item) => {
        const key = item.key ? item.key : "";
        const i = item.idx;
        if (!key) return null;

        const fieldName = `${keyName}`;
        const entryName = `${keyType} ${i + 1}`;
        const trueTypeComment = trueTypeDef != undefined ? typeof trueTypeDef[0] === 'string' ? trueTypeDef[3] : trueTypeDef[4] : "";

        // Add true options
        const trueOptions = trueTypeDef ? (typeof trueTypeDef[0] === "string" ? trueTypeDef[2] : trueTypeDef[3]) : [];
        // Remove parent * from child to prevent mixups
        let newOptions = options.map(opt => opt.startsWith("*") ? opt.slice(1) : opt);
        newOptions = [...newOptions, ...trueOptions];

        let keyField: AllFieldArray;
        if (key === "Array" || key === "Record" || key === "Map" || key === "Enumerated" || key === "Choice") {
            let keyChildren = trueTypeDef != undefined ? trueTypeDef[4] ? Array.isArray(trueTypeDef[4]) ? trueTypeDef[4] : [] : [] : [];
            keyField = [fieldName, key, newOptions, trueTypeComment, keyChildren];
        } else {
            keyField = [i, fieldName, key, newOptions, trueTypeComment];
        }

        const keyEntry = keyList.find(entry => entry.name === entryName);

        return (
            <div key = {i} className="card" style={{ border: '0px' }}>
                <div className="d-flex align-items-start" style={{ gap: '0.25rem' }}>
                    <button
                        type="button"
                        className="border-0 px-2 py-1 btn btn-sm rounded-pill me-1 mt-1"
                        title="Remove Structure"
                        onClick={() => removeCard(i, entryName)}
                        //disabled = {numberOfItems <= minv}
                    >
                        <FontAwesomeIcon icon={faCircleXmark} size="lg"/>
                    </button>
                    <div style={{ flex: '0 1 100%' }}>
                        <Field
                            key={`${keyType} ${i + 1}`}
                            field={keyField}
                            parent={String(name)}
                            fieldChange={(_n, k) => addKey(entryName, k)}
                            value={keyEntry?.key}
                            toClear={clear}
                        />
                    </div>
                </div>
            </div>
        )
    });

    return (
        <>
            <div className='form-group'>
                <div className="d-flex align-items-center w-100"
                    style={{ borderColor: numberOfItems < minv && !_optional ? 'red' : undefined, 
                        borderWidth: numberOfItems < minv && !_optional ? '1px' : undefined, 
                        borderStyle: numberOfItems < minv && !_optional ? 'dashed' : undefined }} >
                    <label style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                    <SBInfoBtn comment={typeof _comment === 'string' ? _comment : undefined} />
                    <SBClearDataBtn onClick={() => {
                        setClear(true);
                        setTimeout(() => setClear(false), 0);
                    }} />
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
                    {errMsg && <div className="text-danger">{errMsg}</div>}
                    {fields}
                </div>
            </div>
        </>
    );
};

export default ArrayOf;