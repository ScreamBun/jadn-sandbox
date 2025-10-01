import { $MAX_ELEMENTS, defaultValues } from "components/create/consts";

// FUNCTION Destructure Options
export const destructureOptions = (options: string[]): {
    isOptional: boolean; // is the field optional
    minLength: number | undefined;
    maxLength: number | undefined;
    minOccurs: number | undefined;
    maxOccurs: number | undefined;
    pointer: string | undefined;
    derived: string | undefined;
    unique: boolean;
    set: boolean;
    unordered: boolean;
    ordered: boolean;
    keyType: string | undefined; // For MapOf
    valueType: string | undefined; // For MapOf
    isID: boolean; // For Enumerated
    key: string | undefined;
    link: string | undefined;
    restriction: string | undefined;
    extension: string | undefined;
    abstract: boolean;
    final: boolean;
    formats: string[];
} => {
    const parseOpts = (completeMatch: boolean, opt: string) => {
        if (completeMatch) {
            return options.find(option => option === opt);
        } else {
            return options.find(option => option.startsWith(opt))?.slice(1);
        }
    }

    return {
        isOptional: parseOpts(true, '[0') ? true : false,
        minLength: Number(parseOpts(false, '{')),
        maxLength: Number(parseOpts(false, '}')),
        minOccurs: Number(parseOpts(false, '[')),
        maxOccurs: Number(parseOpts(false, ']')),
        pointer: parseOpts(false, '>'),
        derived: parseOpts(false, '#'),
        unique: parseOpts(true, 'q') ? true : false,
        set: parseOpts(true, 's') ? true : false,
        unordered: parseOpts(true, 'b') ? true : false,
        ordered: parseOpts(true, 'q') ? true : false,
        keyType: parseOpts(false, '+'),
        valueType: parseOpts(false, '*'),
        isID: parseOpts(true, '=') ? true : false,
        key: parseOpts(true, 'K'),
        link: parseOpts(true, 'L'),
        restriction: parseOpts(false, 'r'),
        extension: parseOpts(false, 'e'),
        abstract: parseOpts(true, 'a') ? true : false,
        final: parseOpts(true, 'f') ? true : false,
        formats: options.filter(option => option.startsWith("/"))
    }
}

// FUNCTION: Determine if a field is optional based on its options. Optional field has '[0']
/*export const isOptional = (options: any[]): boolean => {
    for (const opt of options) {
        if (String(opt) === '[0') {
            return true;
        }
    }
    return false;
}*/

// FUNCTION: Determine if a type is derived from another type
const isDerived = (type: string): Boolean => {
    if (type === "Array" || type === "ArrayOf" || type === "Choice" || type === "Enumerated" || 
        type === "Map" || type === "MapOf" || type === "Record" || type === "String" || 
        type === "Integer" || type === "Number" || type === "Boolean" || type === "Binary") {
        return false;
    }
    return true;
}

// FUNCTIONS: Determine the true type of a field based on its given type
const trueTypeHelper = (types: any, type: string): [string, any] | undefined => {
    if (!Array.isArray(types)) return undefined;
    const trueTypeDef = types.find((t: any) => t[0] === type || t[1] === type);
    const trueType = trueTypeDef ? (typeof trueTypeDef[0] === 'string' ? trueTypeDef[1] : trueTypeDef[2]) : undefined;
    if (trueType && isDerived(trueType)) {
        return trueTypeHelper(types, trueType);
    } else if (trueType && !isDerived(trueType)) {
        return [trueType, trueTypeDef];
    }
    return undefined;
}

export const getTrueType = (schemaTypes: any, type: string): any => {
    const trueTypeTuple = trueTypeHelper(schemaTypes, type);
    return trueTypeTuple ? trueTypeTuple : [undefined, undefined];
}

// FUNCTION: Determine the structure of a field
export const destructureField = (field: any[]): [number, string, string, string[], string, any[]] => {
    let _idx: number, name: string, type: string, options: string[], _comment: string, children: any[];
    const len = field.length;
    const hasChildren = Array.isArray(field[4]);

    if (len == 5 && hasChildren) { // Field = [name, type, options, _comment, children]
        _idx = 0;
        [name, type, options, _comment, children] = field;
    } else if (len == 5) { // Field = [_idx, name, type, options, _comment]
        [_idx, name, type, options, _comment] = field;
        children = [];
    } else if (len == 4) { // Field = [name, type, options, _comment]
        _idx = 0;
        [name, type, options, _comment] = field;
        if (typeof options === 'string') {
            [_idx, name, type, options] = field; // Field = [_idx, name, type, _comment]
        } // Field = [name, type, _comment, children]
        children = [];
    } else { // Field = [_idx, name, _comment]
        _idx = field[0];
        name = field[1];
        _comment = field[2];
        type = _comment;
        options = [];
        children = [];

    }

    return [_idx, name, type, options, _comment, children];
}

//FUNCTION: Get the minv (minimum length) of an ArrayOf, MapOf
/*export const getMinv = (opts: any[]): number => {
    const minvOpt = opts.find(opt => typeof opt === 'string' && opt.startsWith("{"));
    return minvOpt ? parseInt((minvOpt as string).slice(1), 10) : 0;
}

export const getMaxv = (opts: any[]): number | undefined => {
    const maxvOpt = opts.find(opt => typeof opt === 'string' && opt.startsWith("}"));
    return maxvOpt ? parseInt((maxvOpt as string).slice(1), 10) : undefined;
}*/

//FUNCTION: Recursively get pointer children
const addPointerChildren = (schemaObj: any, type: any, pointerChildren: any[], path: string[], isID: boolean = false): any[] => {
    let newPath = [...path];

    let [_idx, _name, _type, _options, _comment, children] = destructureField(type);
    if (!Array.isArray(children)) {
        return [];
    }
    if (children.length === 0) {
        const [_trueType, trueTypeDef] = getTrueType(schemaObj.types, _type);
        // Don't need to list enum or choice
        if (_trueType === "Enumerated" || _trueType === "Choice") {
            return [[[...newPath, isID ? String(_idx) : _name].join('/')]];
        }

        const trueChildren = trueTypeDef && trueTypeDef[4] ? trueTypeDef[4] : [];
        if (trueChildren.length > 0) {
            for (const child of trueChildren) {
                pointerChildren = [...pointerChildren, ...addPointerChildren(schemaObj, child, [], [...newPath, isID ? String(_idx) : _name])];
            }
            return pointerChildren;
        }
        return [[[...newPath, isID ? String(_idx) : _name].join('/')]];
    }

    for (const child of children) {
        const hasID = isID === true ? isID : _options.some(opt => String(opt) === '=');
        pointerChildren = [...pointerChildren, ...addPointerChildren(schemaObj, child, [], [...newPath, _name], hasID)];
    }
    return pointerChildren;
}

export const getPointerChildren = (schemaObj: any, pointer: string, children: any[], isID: boolean = false): any[] => {
    const types = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === pointer) : [];
    let pointerChildren: any[] = [];
    for (const type of types) {
        pointerChildren = [...pointerChildren, ...addPointerChildren(schemaObj, type, [], [], isID)];
    }
    let childrenOpts = [...children, ...pointerChildren];   
    return childrenOpts.map((child: any) => {
        return [0, ...child];
    });
}

//FUNCTION: Derived Enumeration Logic
export const getDerivedOptions = (schemaObj: any, derived: string): any[] => {
    const types = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === derived) : [];
    let derivedOptions: any[] = [];
    for (const type of types) {
        let [_idx, _name, _type, _options, _comment, children] = destructureField(type);
        if (children.length > 0) {
            derivedOptions = [...derivedOptions, ...children];
        }
    }
    return derivedOptions;
}

//FUNCTION: ArrayOf and Array unique & set check
export const getUniqueOrSet = (children: any[], opts: any[], type: string): string => {
    const isUnique = opts.some(opt => opt === "q");
    const isSet = opts.some(opt => opt === "s");
    let m = "";
    if (isUnique || isSet) {
        if (type === "ArrayOf") {
            if (Array.from(new Set(children.map(c => c.key))).length != children.map(c => c.key).length) {
                m = ("Error: Must not contain duplicate values");
            }
        } else if (type === "Array") {
            if (Array.from(new Set(children)).length != children.length) {
                m = ("Error: Must not contain duplicate values");
            }
        }
    }
    return m;
}

//FUNCTION: Extract keys from an enumeration
const getEnumKeys = (children: any[], isID: boolean = false): any[] => {
    return children.map((child: any) => {
        let [_idx, name, _type, _options, _comment, _children] = destructureField(child);
        return isID ? _idx : name;
    });
}

export const caseMapOfEnumKey = (schemaObj: any, field: any[]) => {
    let [_idx, _name, type, options, _comment, _children] = destructureField(field);
    let enumKeys: any[] = [];
    if (type === "MapOf") {
        // Check if key type or true type of key type is Enumerated
        const keyType = options.find(opt => opt.startsWith("+"))?.substring(1);
        const [trueType, trueTypeDef] = getTrueType(schemaObj.types, keyType ? keyType : "");
        if (keyType === "Enumerated" || trueType === "Enumerated") {
            let [_idx, _trueName, _type, _options, _comment, children] = destructureField(trueTypeDef ? trueTypeDef : []);
            const isID = _options.some(opt => opt.startsWith("=")); // Check if enum option has ID
            enumKeys = getEnumKeys(children, isID);

            // Check if enum is pointer
            const hasPointer = _options.find(opt => opt.startsWith(">"))?.slice(1);
            if (enumKeys.length === 0 && hasPointer) {
                enumKeys = getPointerChildren(schemaObj, hasPointer, children, isID).map((child: any) => {
                    let [_idx, name, _type, _options, _comment, _children] = destructureField(child);
                    return name;
                });
            }
        }
    }

    return enumKeys;
}

//FUNCTION: Get default value. If option has default value, that takes precedence over the type default value.
export const getDefaultValue = (type: string, options: any[], children: any[] = []): any => {
    const optionsObj = destructureOptions(options);
    const minInclusive = options.find(opt => typeof opt === 'string' && opt.startsWith("w"))?.slice(1);
    let minExclusive = options.find(opt => typeof opt === 'string' && opt.startsWith("y"))?.slice(1);
    // Adjust minExclusive
    if (minExclusive) {
        if (type === "Integer") minExclusive = parseInt(minExclusive) + 1;
        if (type === "Number") minExclusive = parseFloat(minExclusive) + 0.01;
    }
    const minValue = minInclusive ? minInclusive : minExclusive ? minExclusive : undefined;

    for (const option of options) {
        // Check for integer versions of dates
        const secondVis = type === "Integer" && (option === "/date-time" || option === "/date" || option === "/time");
        const val = defaultValues(option, optionsObj.minLength, minValue, children, secondVis);
        if (val !== undefined) {
            return val;
        }
    }
    const val2 = defaultValues(type, optionsObj.minLength, minValue, children);
    if (val2 !== undefined) {
        return val2;
    }
    return undefined;
}

//FUNCTION: Deal with field multiplicity for primitives
/*export const getMultiplicity = (opts: any[]): [number | undefined, number | undefined] => {
    let minOccurs = opts.find(opt => typeof opt === 'string' && opt.startsWith("["))?.substring(1);
    minOccurs = minOccurs ? parseInt(minOccurs) : undefined;
    let maxOccurs = opts.find(opt => typeof opt === 'string' && opt.startsWith("]"))?.substring(1);
    maxOccurs = maxOccurs ? parseInt(maxOccurs) : undefined;
    return [minOccurs, maxOccurs];
}*/

export const convertToArrayOf = (field: any[], minOccurs: number | undefined, maxOccurs: number | undefined): any[] | undefined => {
    let [_idx, name, type, options, _comment, _children] = destructureField(field);
    // Remove minOccurs and maxOccurs from options
    if (minOccurs === 0) {
        options = options.filter(opt => typeof opt === 'string' && !opt.startsWith("]"));
    } else {
        options = options.filter(opt => typeof opt === 'string' && !opt.startsWith("[") && !opt.startsWith("]"));
    }

    // Case maxOccurs == -1
    const useMaxElements = maxOccurs === -1;
    // Case maxOccurs == -2
    const upperBoundUnlimited = maxOccurs === -2;
    
    // Convert minOccurs and maxOccurs to minLength and maxLength
    let newOpts = [`*${type}`, `${minOccurs ? "{"+String(minOccurs) : ""}`, useMaxElements ? `}${$MAX_ELEMENTS}` : upperBoundUnlimited ? `}Infinity` : `${maxOccurs ? "}"+String(maxOccurs): ""}`, ...options]
    // Remove empty strings
    newOpts = newOpts.filter(opt => typeof opt === 'string' && opt !== "");

    if ((minOccurs && minOccurs !== 0) || maxOccurs) {
        const newField = [name, "ArrayOf", newOpts, ""]
        return newField
    }

    return undefined;
}

//FUNCTION: get default value
export const getDefaultOpt = (options: string[], type: string): any | undefined => {
    const defaultOpt = options.find(opt => opt.startsWith("u"));
    switch (type) {
        case "Integer":
        case "Number":
            return defaultOpt ? Number(defaultOpt.slice(1)) : undefined;
        case "Boolean":
            if (!defaultOpt) return undefined;
            const boolStr = defaultOpt.slice(1);
            return boolStr.toLowerCase() === "false" ? false : Boolean(boolStr);
        default:
            return defaultOpt ? String(defaultOpt.slice(1)) : undefined;
    }
}

//FUNCTION: get const value
export const getConstOpt = (options: string[], type: string): any | undefined => {
    const defaultOpt = options.find(opt => opt.startsWith("v"));
    switch (type) {
        case "Integer":
        case "Number":
            return defaultOpt ? Number(defaultOpt.slice(1)) : undefined;
        case "Boolean":
            if (!defaultOpt) return undefined;
            const boolStr = defaultOpt.slice(1);
            return boolStr.toLowerCase() === "false" ? false : Boolean(boolStr);
        default:
            return defaultOpt ? String(defaultOpt.slice(1)) : undefined;
    }
}

// FUNCTION: Remove wrapper from xml data
export const removeXmlWrapper = (xml: string): string => {
    return xml.replace(/<\/?all>/g, '');
}

// FUNCTION: Overwrite field - used for inheritance
export const overwriteFields = (fieldsToReturn: any[], newFields: any[]): void => {
    for (const child of newFields) {
        const [childID] = destructureField(child);
        if (!fieldsToReturn.some(c => {
            const [cID] = destructureField(c);
            return cID === childID;
        })) {
            fieldsToReturn.push(child);
        }
    }
    fieldsToReturn.sort((a, b) => {
        const [aID] = destructureField(a);
        const [bID] = destructureField(b);
        return aID - bID;
    });
}

// FUNCTION: Restrict children and options based on restricts
export const restrictType = (schemaObj: any, type: string, overloadingChildren: any[]): any => {
    const types = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === type) : [];
    let restrictChildren: any[] = [...overloadingChildren]; // start out with overloading children
    let restrictOpts: any[] = [];

    for (const t of types) {
        let [_idx, _name, _type, _options, _comment, children] = destructureField(t);

        // Check if type being restricted is final - stop
        if (_options.some((opt: any) => String(opt) === 'f')) return undefined;

        overwriteFields(restrictChildren, children);

        const isRestricted = _options.find(opt => opt.startsWith("r"));
        if (isRestricted) { // For rescursive restricts
            const restrictTypeName = isRestricted.slice(1);
            const restrict = restrictType(schemaObj, restrictTypeName, restrictChildren);
            const { restrictChildren: baseRestrictChildren = [], restrictOpts: baseRestrictOpts = [] } = restrict || {};
            overwriteFields(restrictChildren, baseRestrictChildren);
            restrictOpts.push(...baseRestrictOpts);
        }

        const isExtended = _options.find(opt => opt.startsWith("e"));
        if (isExtended) {
            // Recurse
            const parentType = isExtended.slice(1);
            const parentExt = extendType(schemaObj, parentType, restrictChildren);
            const { extendChildren: baseChildren = [], extendOpts: baseOpts = [] } = parentExt || {};
            overwriteFields(restrictChildren, baseChildren);
            restrictOpts.push(...baseOpts);
        }

        // If children empty, push children
        if (restrictChildren.length === 0) restrictChildren.push(...children);
        restrictOpts.push(..._options);
        restrictOpts = restrictOpts.filter(opt => !opt.startsWith("e")); // Remove 'e' option
        restrictOpts = restrictOpts.filter(opt => !opt.startsWith("r")); // Remove 'r' option
    }
    return restrictChildren.length > 0 || restrictOpts.length > 0 ? { restrictChildren, restrictOpts } : undefined;
}

// FUNCTION: Extends logic
export const extendType = (schemaObj: any, type: string, existingChildren: any[]): any => {
    const types = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === type) : [];
    let extendedChildren: any[] = [...existingChildren];
    let extendedOpts: any[] = [];

    for (const t of types) {
        let [_idx, _name, _type, _options, _comment, children] = destructureField(t);
        // Check if type being extended is final - stop
        if (_options.some((opt: any) => String(opt) === 'f')) return undefined;

        overwriteFields(extendedChildren, children);

        // Check for recursive extension
        const isExtended = _options.find(opt => opt.startsWith("e"));
        if (isExtended) {
            // Recurse
            const parentType = isExtended.slice(1);
            const parentExt = extendType(schemaObj, parentType, extendedChildren);
            const { extendChildren: baseChildren = [], extendOpts: baseOpts = [] } = parentExt || {};
            overwriteFields(extendedChildren, baseChildren);
            extendedOpts.push(...baseOpts);
        }

        // Check for restrict
        const isRestricted = _options.find(opt => opt.startsWith("r"));
        if (isRestricted) {
            const restrictTypeName = isRestricted.slice(1);
            const restrict = restrictType(schemaObj, restrictTypeName, extendedChildren);
            const { restrictChildren: baseRestrictChildren = [], restrictOpts: baseRestrictOpts = [] } = restrict || {};
            overwriteFields(extendedChildren, baseRestrictChildren);
            extendedOpts.push(...baseRestrictOpts);
        }

        // If children empty, push children
        if (extendedChildren.length === 0) extendedChildren.push(...children);
        extendedOpts.push(..._options);
        extendedOpts = extendedOpts.filter(opt => !opt.startsWith("e")); // Remove 'e' option
        extendedOpts = extendedOpts.filter(opt => !opt.startsWith("r")); // Remove 'r' option
    }
    return extendedChildren.length > 0 || extendedOpts.length > 0 ? { extendChildren: extendedChildren, extendOpts: extendedOpts } : undefined;
}
// FUNCTION: Key/Link: return type and options of referenced key
export const linkToKey = (schemaObj: any, link: any): {type: string, options: string[], children: any[]} | undefined => {
    if (!schemaObj || !schemaObj.types || !link) return undefined;
    const types = schemaObj.types;
    for (const type of types) {
        const [_idx, _name, _type, _options, _comment, _children] = destructureField(type);
        if (_name === link) { // If the link matches the name, then parent found. Go thru children to find key
            for (const child of _children) {
                const [_cidx, _cname, _ctype, coptions, _ccomment, _cchildren] = destructureField(child);
                if (coptions.some((opt: any) => String(opt) === 'K')) { // If child has key option
                    return {type: _ctype, options: coptions, children: _cchildren};
                }
            }
        }
    }
    return undefined;
}
