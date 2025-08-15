import { FieldOfArray, AllFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import Field from "../Field";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, getMaxv, getMinv, getTrueType, getUniqueOrSet, isOptional } from "../../utils";
import { useSelector } from "react-redux";
import { getSelectedSchema } from "reducers/util";

interface FieldProps {
    field: AllFieldArray | FieldOfArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const ArrayOf = (props: FieldProps) => {
    const { field, fieldChange } = props;

    let [_idx, name, _type, options, _comment, _children] = destructureField(field);

    const [toggle, setToggle] = useState(true);
    const [keyList, setKeyList] = useState<Array<{name: any , key: any}>>([]);
    const schemaObj = useSelector(getSelectedSchema);
    const [idNumber, setIdNumber] = useState(0);
    // Check if there are enough / too many items
    const [numberOfItems, setNumberOfItems] = useState(0);
    const minv = getMinv(options);
    const maxv = getMaxv(options);

    const keyName = options.find(opt => opt.startsWith("*"))?.slice(1);
    const [trueTypeVal, trueTypeDef] = getTrueType(schemaObj.types, String(keyName));
    let keyType = trueTypeVal == undefined ? keyName : trueTypeVal;
    const [cards, setCards] = useState<Array<{idx: number, key: string}>>([]);

    const [errMsg, setErrMsg] = useState<string | undefined>(undefined);

    React.useEffect(() => {
        const keys = keyList;
        let output = [];
        for (let i = 0; i < keys.length; i++) {
            output.push(keys[i].key);
        }
        fieldChange(String(name), output);
        setErrMsg(getUniqueOrSet(keyList, options));
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
        const entryName = `${key} ${i+1}`;
        const trueTypeComment = trueTypeDef != undefined ? typeof trueTypeDef[0] === 'string' ? trueTypeDef[3] : trueTypeDef[4] : "";
        
        let keyField: AllFieldArray;
        if (key === "Array" || key === "Record" || key === "Map" || key === "Enumerated" || key === "Choice") {
            let keyChildren = trueTypeDef != undefined ? trueTypeDef[4] ? Array.isArray(trueTypeDef[4]) ? trueTypeDef[4] : [] : [] : [];
            keyField = [fieldName, key, options, trueTypeComment, keyChildren];
        } else {
            keyField = [i, fieldName, key, options, trueTypeComment];
        }

        const keyEntry = keyList.find(entry => entry.name === entryName);

        return (
            <div key = {i} className="card" style={{ border: '0px' }}>
                <div className="d-flex align-items-start" style={{ gap: '0.25rem' }}>
                    <button
                        type="button"
                        className="btn btn-sm btn-danger me-1"
                        title="Remove Field"
                        onClick={() => removeCard(i, entryName)}
                        disabled = {numberOfItems <= minv}
                    >
                        <FontAwesomeIcon icon={faX} size="sm"/>
                    </button>
                    <div style={{ flex: '0 1 100%' }}>
                        <Field
                            key={`${key} ${i+1}`}
                            field={keyField}
                            parent={String(name)}
                            fieldChange={(n, k) => addKey(entryName, k)}
                            value={keyEntry?.key ?? ""}
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
                    style={{ borderColor: numberOfItems < minv ? 'red' : undefined, 
                        borderWidth: numberOfItems < minv ? '1px' : undefined, 
                        borderStyle: numberOfItems < minv ? 'dashed' : undefined }} >
                    <label style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                    <SBInfoBtn comment={typeof _comment === 'string' ? _comment : undefined} />
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