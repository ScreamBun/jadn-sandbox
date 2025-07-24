import { ArrayFieldArray, StandardFieldArray, AllFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import SBSelect, { Option } from 'components/common/SBSelect';
import Field from 'components/create/data/lib/field/Field';
interface FieldProps {
    field: ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children?: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const Choice = (props: FieldProps) => {
    const { field, fieldChange, parent, value } = props;
    const [name, type, options, _comment, children] = field;
    const [toggle, setToggle] = useState(true);
    const [selectedValue, setSelectedValue] = useState<Option | string>(value != '' ? { 'label': value, 'value': value } : '');
    const [selectedChild, setSelectedChild] = useState<JSX.Element>();
    const [childData, setChildData] = useState<any>({});

    const handleChange = (e: Option | null) => {
        if (e == null || e.value === '' || e.value === undefined) {
            setSelectedValue('');
            setSelectedChild(undefined);
            setChildData({});
            fieldChange(name, '');
        } else {
            const child = getChild(e.value)
            setSelectedValue(e);
            setSelectedChild(child);
            fieldChange(name, {[e.value]:selectedChild});
        }
    }

    const updateChildData = (k: string, v: any) => {
        setChildData((prev: Record<string, any>) => {
            let updated: Record<string, any> = { ...prev, [k]: v };
            if (v === "" || v === undefined || v === null) {
                delete updated[k];
            } else {
                updated[k] = v;
            }
            if (Object.keys(updated).length === 0) {
                fieldChange(name, '');
                return {};
            }
            fieldChange(name, updated);
            return updated;
        });
    };

    const getChild = (field_name: string) => { 
        const child = children.find((child: AllFieldArray) => child[1] === field_name || child[0] === field_name);
        if (!child) return undefined;
        return <Field key={field_name} field={child} fieldChange={updateChildData} parent={name} />;
    }

    const getOptions = children.map((child: AllFieldArray) => {
        return (typeof child[0] === 'string') ? { label: child[0], value: child[0] } : { label: child[1], value: child[1] };
    });

    return (
        <div className='form-group m-3'>
            <div className='card'>
                <div className='card-header p-4 d-flex align-items-center justify-content-between'>
                    <label><strong>{name}</strong></label>
                    {_comment ? <small className = "card-subtitle form-text text-muted test-wrap mr-3">{_comment}</small> : ""}
                    <SBToggleBtn toggle={toggle} setToggle={setToggle} />
                </div>
                <div className={`card-body mx-2 ${toggle ? '' : 'collapse'}`}>
                    <SBSelect id={name} name = {name} data = {getOptions}
                    onChange={handleChange}
                    placeholder={`${name} options`}
                    value={selectedValue}
                    isClearable />
                    {selectedValue ? selectedChild : ""}
                </div>
            </div>
        </div>
    );
};

export default Choice;