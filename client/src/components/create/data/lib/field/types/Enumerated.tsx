import { ArrayFieldArray, EnumeratedFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import SBSelect, { Option } from 'components/common/SBSelect';
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, getDefaultValue, getPointerChildren, isOptional, getDerivedOptions } from "../../utils";
import { getSelectedSchema } from "reducers/util";
import SBHighlightButton from "components/common/SBHighlightButton";
import { clearHighlight } from "actions/highlight";
import SBHierarchyBtn from "components/common/SBHierarchyBtn";

interface FieldProps {
    field: ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children?: EnumeratedFieldArray | EnumeratedFieldArray[];
    parent?: string;
    value?: any;
    toClear: boolean;
    ancestor?: string;
}

const Enumerated = (props: FieldProps) => {
    const { field, fieldChange, parent, value, toClear, ancestor } = props;
    let [_idx, name, _type, options, _comment, children] = destructureField(field);
    const [selectedValue, setSelectedValue] = useState<Option | string>(value != '' ? { 'label': value, 'value': value } : '');
    const dispatch = useDispatch();

    const handleChange = (e: Option) => {
        if (e == null) {
            setSelectedValue('');
            fieldChange(name, '');
        } else {
            setSelectedValue(e);
            fieldChange(name, e.value);
        }
    }

    const _optional = isOptional(options);
    const highlightWords = [name, typeof selectedValue === 'object' ? selectedValue.label : value];

    // Check for pointer
    let pointer: string | undefined = undefined;
    options.forEach((opt) => {
        if (String(opt).startsWith('>')) {
            pointer = String(opt).substring(1);
        }
    });

    // Add pointer children to children if pointer exists
    const schemaObj = useSelector(getSelectedSchema);
    if (pointer !== undefined) {
        children = [...children, ...getPointerChildren(schemaObj, pointer, [])];
    }

    // Check for derived enum
    let derived: string | undefined = undefined;
    options.forEach((opt) => {
        if (String(opt).startsWith('#')) {
            derived = String(opt).substring(1);
        }
    });

    // Add derived options if derived exists
    if (derived !== undefined) {
        children = getDerivedOptions(schemaObj, derived);
    }

    const isID = options.some(opt => String(opt) === '=');

    const enumChildren = Array.isArray(children) ? children.filter(c => Array.isArray(c)) : [];

    const getOptions: Option[] = enumChildren.map(child => {
        const id = child[0];
        const fname = child[1];
        if (isID) {
            return { label: String(fname), value: id };
        }
        return { label: String(fname), value: String(fname) };
    });

    const setDefaults = useSelector((state: any) => state.toggleDefaults);
    React.useEffect(() => {
        if (
            (value === undefined || value === null || value === '') ||
            (selectedValue === undefined || selectedValue === null || selectedValue === '')
        ) {
            const defaultValue = getDefaultValue("Enumerated", [], getOptions.map(opt => opt.value));
            if (/*!_optional && */defaultValue !== undefined && setDefaults) {
                setSelectedValue({ label: defaultValue, value: defaultValue });
                fieldChange(name, defaultValue);
            }
        }
    }, [setDefaults]);

    React.useEffect(() => {
        if (toClear) {
            setSelectedValue('');
            fieldChange(name, '');
            dispatch<any>(clearHighlight());
        }
    }, [toClear]);

    React.useEffect(() => {
        setSelectedValue(value && value !== "" ? { label: value, value: value } : '');
    }, [value]);

    return (

        <div className="form-group">
            <div className='form-group d-flex align-items-center justify-content-between'>
                <label style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                {ancestor ? <SBHierarchyBtn ancestor={ancestor || ""} current={field} /> : null}
                <SBInfoBtn comment={_comment} />
                <SBHighlightButton highlightWords={highlightWords} />
                <SBSelect id={name} name = {name} data = {getOptions}
                    onChange={handleChange}
                    placeholder={`${name} options`}
                    value={selectedValue}
                    isClearable 
                    isSmStyle
                />
            </div>
        </div>
    );
};

export default Enumerated;