import React from 'react';
import { CoreType, Array, ArrayOf, Record, Map, MapOf, Enumerated, Choice, Derived } from 'components/create/data/lib/field/types/Types';
import { AllFieldArray, StandardFieldArray, ArrayFieldArray, FieldOfArray } from '../../../schema/interface';
import { convertToArrayOf, destructureField, getMultiplicity } from '../utils';

interface FieldProps {
    field: AllFieldArray;
    fieldChange: (k:string, v:any) => void;
    children?: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const Field = (props: FieldProps) => {
    const { field, fieldChange, children, parent, value } = props;
    const [_idx, name, type, options, _comment, _children] = destructureField(field);
    // Check for multiplicities
    const hasMultiplicity = convertToArrayOf(field, ...getMultiplicity(options));
    if (hasMultiplicity) {
        return (
            <Field field={hasMultiplicity as unknown as AllFieldArray} fieldChange={fieldChange} parent={props.parent} value={value}/>
        );
    }

    switch (type) {
        case 'Boolean':
            return <CoreType field={field as StandardFieldArray} fieldChange={fieldChange} parent={parent} value={value} />;
        case 'Binary':
            return <CoreType field={field as StandardFieldArray} fieldChange={fieldChange} parent={parent} value={value} />;
        case 'String':
            return <CoreType field={field as StandardFieldArray} fieldChange={fieldChange} parent={parent} value={value} />;
        case 'Number':
            return <CoreType field={field as StandardFieldArray} fieldChange={fieldChange} parent={parent} value={value} />;
        case 'Integer':
            return <CoreType field={field as StandardFieldArray} fieldChange={fieldChange} parent={parent} value={value} />;
        case 'Array':
            return <Array field={field as ArrayFieldArray} fieldChange={fieldChange} children={children ? children : []} parent={parent} value={value} />;
        case 'ArrayOf':
            return <ArrayOf field={field as unknown as FieldOfArray} fieldChange={fieldChange} children={[]} parent={parent} value={value} />;
        case 'Record':
            return <Record field={field as ArrayFieldArray} fieldChange={fieldChange} children={children ? children : []} parent={parent} value={value} />;
        case 'Map':
            return <Map field={field as ArrayFieldArray} fieldChange={fieldChange} children={children ? children : []} parent={parent} value={value} />;
        case 'MapOf':
            return <MapOf field={field as unknown as FieldOfArray} fieldChange={fieldChange} children={[]} parent={parent} value={value} />;
        case 'Enumerated':
            return <Enumerated field={field as ArrayFieldArray} fieldChange={fieldChange} parent={parent} value={value} />;
        case 'Choice':
            return <Choice field={field as ArrayFieldArray} fieldChange={fieldChange} parent={parent} value={value} />;
        default:
            return <Derived field={field as ArrayFieldArray} fieldChange={fieldChange} children={children ? children : []} parent={parent} value={value} />;
    }
}

export default Field;