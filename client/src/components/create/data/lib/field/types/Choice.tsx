import { ArrayFieldArray, AllFieldArray } from "components/create/schema/interface";
import React, { useEffect, useMemo, useState } from "react";
import SBSelect, { Option } from 'components/common/SBSelect';
import Field from 'components/create/data/lib/field/Field';
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, destructureOptions, generateData } from "../../utils";
import { useSelector } from "react-redux";
import SBHierarchyBtn from "components/common/SBHierarchyBtn";
interface FieldProps {
    field: ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children?: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
    toClear: boolean;
    ancestor?: string;
}

const Choice = (props: FieldProps) => {
    const { field, fieldChange, value, toClear, ancestor } = props;
    const [_idx, name, _type, options, _comment, children] = destructureField(field);
    const optionsObj = destructureOptions(options);
    const _optional = optionsObj.isOptional;
    const isID = optionsObj.isID;

    const selectedLabel = value ? Object.keys(value)?.[0] : '';
    const selectedVal = value ? { value: Object.values(value)?.[0] } : {};
    const [selectedValue, setSelectedValue] = useState<Option | string>(selectedLabel != '' ? { 'label': selectedLabel, 'value': selectedLabel } : '');

    const [clear, setClear] = useState(toClear);
    useEffect(() => {
        setClear(toClear);
        if (toClear === true) {
            setSelectedValue('');
            setSelectedChild(undefined);
            fieldChange(name, '');
        }
    }, [toClear, fieldChange]);

    const updateChildData = (k: string, v: any) => {
        const key = isID ? (nameToIdMap[k] ?? k) : k;
        if (v === "" || v === undefined || v === null) {
            fieldChange(name, '');
        } else {
            fieldChange(name, { [key]: v });
        }
    };

    const getChild = (field_name: string) => { 
        const child = children.find((child: AllFieldArray) => child[1] === field_name || child[0] === field_name);
        if (!child) return undefined;
        return <div className="ms-3 mt-2">
            <Field 
                key={field_name} 
                field={child}
                fieldChange={updateChildData}
                parent={name}
                value={selectedVal.value} 
                toClear={clear} />
            </div>
    }


    const [selectedChild, setSelectedChild] = useState<JSX.Element | undefined>(
        selectedLabel ? getChild(selectedLabel) : undefined
    );
    
    // If isID, map child field name to child ID
    const nameToIdMap = useMemo(() => {
        if (!Array.isArray(children)) return {};

        const newChildren: Record<string | number, string | number> = {};
        children.forEach(child => {
            if (Array.isArray(child)) {
                const childID = child[0]; 
                const childName = child[1];
                newChildren[childName] = childID;
            }
        });
        return newChildren;
    }, [children]);

    const handleChange = (e: Option | null) => {
        if (e == null || e.value === '' || e.value === undefined) {
            setSelectedValue('');
            setSelectedChild(undefined);
            fieldChange(name, '');
        } else {
            const child = getChild(e.value);
            setSelectedValue(e);
            setSelectedChild(child);
            
            fieldChange(name, e.value);
        }
    }

    const getOptions = children.map((child: AllFieldArray) => {
        return (typeof child[0] === 'string') ? { label: child[0], value: child[0] } : { label: child[1], value: child[1] };
    });

    const setDefaults = useSelector((state: any) => state.toggleDefaults);
    React.useEffect(() => {
        if (
            (value === undefined || value === null || value === '') ||
            (selectedValue === undefined || selectedValue === null || selectedValue === '')
        ) {
            const defaultValue = generateData([], _type, children);
            if (defaultValue !== undefined && setDefaults) {
                setSelectedValue({ label: defaultValue, value: defaultValue });
                fieldChange(name, defaultValue);
                setSelectedChild(getChild(defaultValue));
            }
        }
    }, [setDefaults]);

    return (
        <div className="form-group">
            <div className='form-group d-flex align-items-center justify-content-between'>
                <label style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                {ancestor ? <SBHierarchyBtn ancestor={ancestor || ""} current={field} /> : null}
                <SBInfoBtn comment={_comment} />
                <SBSelect id={name} name={name} data={getOptions}
                    onChange={handleChange}
                    placeholder={`${name} options`}
                    value={selectedValue}
                    isSearchable
                    isClearable
                    isSmStyle />
            </div>
            {selectedValue ? selectedChild : ""}
        </div>
    );
};

export default Choice;