import { AllFieldArray } from "components/create/schema/interface";
import React from "react";
import Field from "../Field";
import { useSelector } from "react-redux";
import { getSelectedSchema } from 'reducers/util'
import { destructureField, getTrueType } from "../../utils";

interface FieldProps {
    field: AllFieldArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const Derived = (props: FieldProps) => {
    const { field, fieldChange, parent, value } = props;
    let [_idx, name, type, options, _comment, _children] = destructureField(field);

    const schemaObj = useSelector(getSelectedSchema);
    const types = schemaObj.types;
    const [trueTypeVal, trueTypeDef] = getTrueType(types, String(type));
    if (trueTypeDef == undefined || trueTypeVal == undefined) {
        return <div>No derivative type found</div>
    }
    let trueOptions = typeof trueTypeDef[0] === 'string' ? trueTypeDef[2] : trueTypeDef[3];
    let newOpts = [...(Array.isArray(trueOptions) ? trueOptions : []), ...(Array.isArray(options) ? options : [])];

    let newField;
    if (trueTypeDef.length == 5 && Array.isArray(trueTypeDef[4])) {
        newField = [name, trueTypeVal, newOpts, _comment, trueTypeDef[4]];
    } else {
        newField = [_idx, name, trueTypeVal, newOpts, _comment];
    }
    const card = <Field field={newField as AllFieldArray} fieldChange={fieldChange} parent={parent} value={value} />

    return (
        <div>
            {card}
        </div>
    );
};

export default Derived;