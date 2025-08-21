import { ArrayFieldArray, AllFieldArray } from "components/create/schema/interface";
import React, { useMemo, useState } from "react";
import SBSelect, { Option } from 'components/common/SBSelect';
import Field from 'components/create/data/lib/field/Field';
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, getDefaultValue, isOptional } from "../../utils";
import { useSelector } from "react-redux";
interface FieldProps {
    field: ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children?: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const Choice = (props: FieldProps) => {
    const { field, fieldChange, parent, value } = props;
    const [_idx, name, _type, options, _comment, children] = destructureField(field);

    const selectedLabel = value ? Object.keys(value)?.[0] : '';
    const selectedVal = value ? { value: Object.values(value)?.[0] } : {};
    const [selectedValue, setSelectedValue] = useState<Option | string>(selectedLabel != '' ? { 'label': selectedLabel, 'value': selectedLabel } : '');

    const updateChildData = (k: string, v: any) => {
        setChildData((prev: Record<string, any>) => {
            let updated: Record<string, any> = { ...prev };
            const key = isID ? (nameToIdMap[k] ?? k) : k;

            if (v === "" || v === undefined || v === null) {
                delete updated[key];
            } else {
                updated[key] = v;
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
        return <div className="ms-3 mt-2">
            <Field 
                key={field_name} 
                field={child}
                fieldChange={updateChildData}
                parent={name}
                value={selectedVal.value} />
            </div>
    }


    const [selectedChild, setSelectedChild] = useState<JSX.Element | undefined>(
        selectedLabel ? getChild(selectedLabel) : undefined
    );
    const [childData, setChildData] = useState<any>(
        value && typeof value === 'object' ? value : {}
    );
    const isID = options.some(opt => String(opt) === '=');

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

    const getOptions = children.map((child: AllFieldArray) => {
        return (typeof child[0] === 'string') ? { label: child[0], value: child[0] } : { label: child[1], value: child[1] };
    });

    const _optional = isOptional(options);

    const setDefaults = useSelector((state: any) => state.toggleDefaults);
    React.useEffect(() => {
        if (
            (value === undefined || value === null || value === '') ||
            (selectedValue === undefined || selectedValue === null || selectedValue === '')
        ) {
            const defaultValue = getDefaultValue("Choice", [], children);
            if (/*!_optional && */defaultValue !== undefined && setDefaults) {
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