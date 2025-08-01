import { AllFieldArray } from "components/create/schema/interface";
import React from "react";
import Field from "../Field";
import { useSelector } from "react-redux";
import { getSelectedSchema } from 'reducers/util'
import { isOptional } from "../../utils";


interface FieldProps {
    field: AllFieldArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const Derived = (props: FieldProps) => {
    const { field, fieldChange, parent, value } = props;
    // Destructure the field array into its components
    let _idx: any, name: any, type: any, options: any, _comment: any, children: any;
    if (field.length == 5 && Array.isArray(field[4])) { // ArrayField
        [name, type, options, _comment, children] = field;
    } else {
        [_idx, name, type, options, _comment] = field
    }

    const schemaObj = useSelector(getSelectedSchema);
    const types = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === type) : [];

    let trueTypeDef: string = types.find((t:any) => t[0] === type || t[1] === type);

    if (!trueTypeDef || trueTypeDef == null || trueTypeDef == undefined) {
        return <div>No derivative type found</div>
    }

    let trueTypeVal = typeof trueTypeDef[0] === 'string' ? trueTypeDef[1] : trueTypeDef[2];
    let trueOptions = typeof trueTypeDef[0] === 'string' ? trueTypeDef[2] : trueTypeDef[3];

    let newOpts = [...(Array.isArray(trueOptions) ? trueOptions : []), ...(Array.isArray(options) ? options : [])];
    // If true type is optional, remove the optionality from the options
    if (Array.isArray(trueOptions) && isOptional(trueOptions)) {
        const idx = trueOptions.findIndex((opt: string) => opt.includes("[0"));
        if (idx !== -1) {
            newOpts.splice(idx, 1);
        }
    }

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