import { ArrayFieldArray, AllFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBSelect, { Option } from 'components/common/SBSelect';
import Field from 'components/create/data/lib/field/Field';
import SBInfoBtn from "components/common/SBInfoBtn";
import { isOptional } from "../../utils";
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
    const [selectedValue, setSelectedValue] = useState<Option | string>(value != '' ? { 'label': value, 'value': value } : '');
    const [selectedChild, setSelectedChild] = useState<JSX.Element>();
    const [childData, setChildData] = useState<any>({});
    const [bgColorClass, setBgColorClass] = useState('bg-light'); // Initial background color

    const handleChange = (e: Option | null) => {
        if (e == null || e.value === '' || e.value === undefined) {
            setSelectedValue('');
            setSelectedChild(undefined);
            setChildData({});
            fieldChange(name, '');
        } else {
            const child = getChild(e.value);
            setSelectedValue(e);
            setSelectedChild(child);
            
            const newData = {};
            setChildData(newData);
            
            fieldChange(name, e.value);
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
        return <div className="ms-3 mt-2"><Field key={field_name} field={child} fieldChange={updateChildData} parent={name} /></div>
    }

    const getOptions = children.map((child: AllFieldArray) => {
        return (typeof child[0] === 'string') ? { label: child[0], value: child[0] } : { label: child[1], value: child[1] };
    });

    const _optional = isOptional(options);

    return (
        <div className="p-1 form-group">
            <div className="card jadn-type">
                <div className='card-header d-flex align-items-center justify-content-between'>
                    <div className="d-flex align-items-center">
                        <label>{name}{ _optional ? "" : "*"}</label>
                        <SBInfoBtn comment={_comment} />
                    </div>
                    <SBSelect id={name} name={name} data={getOptions}
                        onChange={handleChange}
                        placeholder={`${name} options`}
                        value={selectedValue}
                        isSearchable
                        isClearable />
                </div>
                {selectedValue ? selectedChild : ""}
            </div>
        </div>
    );
};

export default Choice;