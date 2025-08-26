import React from 'react';
import { CoreType, Array, ArrayOf, Record, Map, MapOf, Enumerated, Choice, Derived } from 'components/create/data/lib/field/types/Types';
import { AllFieldArray, StandardFieldArray, ArrayFieldArray, FieldOfArray } from '../../../schema/interface';
import { useSelector } from 'react-redux';
import { getSelectedSchema } from 'reducers/util';
import { caseMapOfEnumKey, destructureField, convertToArrayOf, getMultiplicity } from '../utils';

interface FieldProps {
    field: AllFieldArray;
    fieldChange: (k:string, v:any) => void;
    children?: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
    toClear: boolean;
}

const Field = (props: FieldProps) => {
    const { field, fieldChange, children, parent, value, toClear } = props;
    let [_idx, name, type, options, _comment, _children] = destructureField(field);
    const schemaObj = useSelector(getSelectedSchema);

    // Special Case Check: Type MapOf w/ keytype of Enum
    const enumKeys = caseMapOfEnumKey(schemaObj, field);
    if (enumKeys.length > 0) {
        const valType = options.find(opt => opt.startsWith("*"))?.substring(1);
        let childrenArray = enumKeys.map((key: string, idx: number) => {
            let fieldArray = [idx, key, valType, ["[0"], ""]; // TODO: handle options and comment?
            return fieldArray;
        });
        // Remove key and val from options
        options = options.filter(opt => !opt.startsWith("+") && !opt.startsWith("*"));
        let newField = [name, "Map", options, _comment, childrenArray];
        return <Map field={newField as ArrayFieldArray} fieldChange={fieldChange} children = {[]} parent={parent} value={value} toClear={toClear}/>;
    }

    // Check for multiplicities
    const hasMultiplicity = convertToArrayOf(field, ...getMultiplicity(options));
    if (hasMultiplicity) {
        return (
            <Field field={hasMultiplicity as unknown as AllFieldArray} fieldChange={fieldChange} parent={props.parent} value={value} toClear={toClear}/>
        );
    }

    switch (type) {
        case 'Boolean':
            return <CoreType field={field as StandardFieldArray} fieldChange={fieldChange} parent={parent} value={value} toClear={toClear} />;
        case 'Binary':
            return <CoreType field={field as StandardFieldArray} fieldChange={fieldChange} parent={parent} value={value} toClear={toClear} />;
        case 'String':
            return <CoreType field={field as StandardFieldArray} fieldChange={fieldChange} parent={parent} value={value} toClear={toClear}  />;
        case 'Number':
            return <CoreType field={field as StandardFieldArray} fieldChange={fieldChange} parent={parent} value={value} toClear={toClear} />;
        case 'Integer':
            return <CoreType field={field as StandardFieldArray} fieldChange={fieldChange} parent={parent} value={value} toClear={toClear} />;
        case 'Array':
            return <Array field={field as ArrayFieldArray} fieldChange={fieldChange} children={children ? children : []} parent={parent} value={value} toClear={toClear} />;
        case 'ArrayOf':
            return <ArrayOf field={field as unknown as FieldOfArray} fieldChange={fieldChange} children={[]} parent={parent} value={value} toClear={toClear} />;
        case 'Record':
            return <Record field={field as ArrayFieldArray} fieldChange={fieldChange} children={children ? children : []} parent={parent} value={value} toClear={toClear} />;
        case 'Map':
            return <Map field={field as ArrayFieldArray} fieldChange={fieldChange} children={children ? children : []} parent={parent} value={value} toClear={toClear} />;
        case 'MapOf':
            return <MapOf field={field as unknown as FieldOfArray} fieldChange={fieldChange} children={[]} parent={parent} value={value} toClear={toClear} />;
        case 'Enumerated':
            return <Enumerated field={field as ArrayFieldArray} fieldChange={fieldChange} parent={parent} value={value} toClear={toClear} />;
        case 'Choice':
            return <Choice field={field as ArrayFieldArray} fieldChange={fieldChange} parent={parent} value={value} toClear={toClear} />;
        default:
            return <Derived field={field as ArrayFieldArray} fieldChange={fieldChange} children={children ? children : []} parent={parent} value={value} toClear={toClear} />;
    }
}

export default Field;