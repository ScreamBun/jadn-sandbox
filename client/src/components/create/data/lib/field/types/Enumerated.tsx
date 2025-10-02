import { ArrayFieldArray, EnumeratedFieldArray } from "components/create/schema/interface";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import SBSelect, { Option } from 'components/common/SBSelect';
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, generateData, getPointerChildren, getDerivedOptions, destructureOptions } from "../../utils";
import { getSelectedSchema } from "reducers/util";
import SBHighlightButton from "components/common/SBHighlightButton";
import { clearHighlight } from "actions/highlight";
import SBHierarchyBtn from "components/common/SBHierarchyBtn";
import { getToggleGenData } from "reducers/gendata";

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
    const { field, fieldChange, value, toClear, ancestor } = props;
    let [_idx, name, _type, options, _comment, children] = destructureField(field);
    const optionsObj = destructureOptions(options);
    const schemaObj = useSelector(getSelectedSchema);
    const toggleDataGen = useSelector(getToggleGenData);
    const [selectedValue, setSelectedValue] = useState<Option | string>(value != '' ? { 'label': value, 'value': value } : '');
    const dispatch = useDispatch();

    const _optional = optionsObj.isOptional;
    const highlightWords = [name, typeof selectedValue === 'object' ? selectedValue.label : value];

    // Check for pointer
    const pointer = optionsObj.pointer;
    if (pointer) {
        children = [...children, ...getPointerChildren(schemaObj, pointer, [])];
    }

    // Add derived options if derived exists
    const derived = optionsObj.derived;
    if (derived) {
        children = getDerivedOptions(schemaObj, derived);
    }
    const enumChildren = Array.isArray(children) ? children.filter(c => Array.isArray(c)) : [];

    const isID = optionsObj.isID;
    const getOptions: Option[] = enumChildren.map(child => {
        const id = child[0];
        const fname = child[1];
        if (isID) {
            return { label: String(fname), value: id };
        }
        return { label: String(fname), value: String(fname) };
    });

    useEffect(() => {
        if (
            (value === undefined || value === null || value === '') ||
            (selectedValue === undefined || selectedValue === null || selectedValue === '')
        ) {
            const genData = generateData([], "Enumerated", getOptions.map(opt => opt.value));
            if (genData !== undefined && toggleDataGen) {
                setSelectedValue({ label: genData, value: genData });
                fieldChange(name, genData);
            }
        }
    }, [toggleDataGen]);

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

    const handleChange = (e: Option) => {
        if (e == null) {
            setSelectedValue('');
            fieldChange(name, '');
        } else {
            setSelectedValue(e);
            fieldChange(name, e.value);
        }
    }

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