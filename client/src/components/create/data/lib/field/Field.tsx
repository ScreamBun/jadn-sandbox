import React from 'react';
import { CoreType, Array, ArrayOf, Record, Map, MapOf, Enumerated, Choice, Derived } from 'components/create/data/lib/field/types/Types';
import { AllFieldArray, StandardFieldArray, ArrayFieldArray, FieldOfArray } from '../../../schema/interface';
import { useSelector } from 'react-redux';
import { getSelectedSchema } from 'reducers/util';
import { caseMapOfEnumKey, destructureField, convertToArrayOf, getMultiplicity, restrictType, extendType, linkToKey } from '../utils';

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
    let extendsField: AllFieldArray | undefined = undefined;

    // Check for abstract -- no data allowed
    const isAbstract = options?.some(opt => opt === "a");
    if (isAbstract) {
        const displayChildren = _children.map((child) => {
            return `${child[0]} - ${child[1]} (${child[2]})<br>`;
        }).join("");
        const newComment = `Abstract Type - No data allowed<br>Fields:<br>${displayChildren}Options: ${options}<br>Comment: ${_comment}`;
        const newField = [name, type, [], newComment, []];
        return <Field field={newField as AllFieldArray} fieldChange={fieldChange} parent={parent} value={value} toClear={toClear}/>;
    }

    // Check for extends
    const extend = options.find(opt => opt.startsWith("e"))?.substring(1);
    if (extend) {
        // Extend options & children
        const extendResult = extendType(schemaObj, extend, _children);
        if (extendResult) {
            const {extendChildren, extendOpts} = extendResult;
            options = options.filter(opt => !opt.startsWith("e"));
            extendsField = [name, type, [...options, ...extendOpts], _comment, extendChildren] as unknown as AllFieldArray;
        }
    }

    // Check for restricts
    let restrictsField: AllFieldArray | undefined = undefined;
    const restricts = options.find(opt => opt.startsWith("r"))?.substring(1);
    if (restricts) {
        // Restrict children and options
        const restrictResult = restrictType(schemaObj, restricts, _children);
        if (restrictResult) {
            const {restrictChildren, restrictOpts} = restrictResult;
            options = options.filter(opt => !opt.startsWith("r"));
            restrictsField = [name, type, restrictOpts, _comment, restrictChildren] as unknown as AllFieldArray;
        }
    }

    // Check for key/link
    const isLink = options.some(opt => opt === "L");
    const linkedRef = isLink ? linkToKey(schemaObj, type) : undefined;
    if (linkedRef && linkedRef.type && linkedRef.options && linkedRef.children) {
        let newOpts = options.filter(opt => opt !== "L");
        let newChildren = linkedRef.children.length > 0 ? linkedRef.children : [];
        let fieldArray = [_idx, name, linkedRef.type, [...newOpts, ...linkedRef.options], "", newChildren];
        return <Field field={fieldArray as AllFieldArray} fieldChange={fieldChange} parent={parent} value={value} toClear={toClear}/>;
    }

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
            return <Array field={extendsField as ArrayFieldArray || restrictsField as ArrayFieldArray || field as ArrayFieldArray} fieldChange={fieldChange} children={children ? children : []} parent={parent} value={value} toClear={toClear} />;
        case 'ArrayOf':
            return <ArrayOf field={field as unknown as FieldOfArray} fieldChange={fieldChange} children={[]} parent={parent} value={value} toClear={toClear} />;
        case 'Record':
            return <Record field={extendsField as ArrayFieldArray || restrictsField as ArrayFieldArray || field as ArrayFieldArray} fieldChange={fieldChange} children={children ? children : []} parent={parent} value={value} toClear={toClear} />;
        case 'Map':
            return <Map field={extendsField as ArrayFieldArray || restrictsField as ArrayFieldArray || field as ArrayFieldArray} fieldChange={fieldChange} children={children ? children : []} parent={parent} value={value} toClear={toClear} />;
        case 'MapOf':
            return <MapOf field={field as unknown as FieldOfArray} fieldChange={fieldChange} children={[]} parent={parent} value={value} toClear={toClear} />;
        case 'Enumerated':
            return <Enumerated field={extendsField as ArrayFieldArray || restrictsField as ArrayFieldArray || field as ArrayFieldArray} fieldChange={fieldChange} parent={parent} value={value} toClear={toClear} />;
        case 'Choice':
            return <Choice field={extendsField as ArrayFieldArray || restrictsField as ArrayFieldArray || field as ArrayFieldArray} fieldChange={fieldChange} parent={parent} value={value} toClear={toClear} />;
        default:
            return <Derived field={extendsField as ArrayFieldArray || restrictsField as ArrayFieldArray || field as ArrayFieldArray} fieldChange={fieldChange} children={children ? children : []} parent={parent} value={value} toClear={toClear} />;
    }
}

export default Field;