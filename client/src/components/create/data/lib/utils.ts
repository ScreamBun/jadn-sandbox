import { defaultValues } from "components/create/consts";

// FUNCTION: Determine if a field is optional based on its options. Optional field has '[0']
export const isOptional = (options: any[]): boolean => {
    for (const opt of options) {
        if (String(opt) === '[0') {
            return true;
        }
    }
    return false;
}

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
    if (!Array.isArray(types)) return undefined; // <-- Add this guard
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
        children = [];
    } else { // Field = [_idx, name, _comment]
        _idx = field[0];
        name = field[1];
        _comment = field[2];
        type = "";
        options = [];
        children = [];
    }

    return [_idx, name, type, options, _comment, children];
}

//FUNCTION: Get the minv (minimum length) of an ArrayOf, MapOf
export const getMinv = (opts: any[]): number => {
    const minvOpt = opts.find(opt => typeof opt === 'string' && opt.startsWith("{"));
    return minvOpt ? parseInt((minvOpt as string).slice(1), 10) : 0;
}

export const getMaxv = (opts: any[]): number | undefined => {
    const maxvOpt = opts.find(opt => typeof opt === 'string' && opt.startsWith("}"));
    return maxvOpt ? parseInt((maxvOpt as string).slice(1), 10) : undefined;
}

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

//FUNCTION: ArrayOf unique & set check
export const getUniqueOrSet = (children: any[], opts: any[]): string => {
    const isUnique = opts.some(opt => opt === "q");
    const isSet = opts.some(opt => opt === "s");
    let m = "";
    if (isUnique || isSet) {
        if (Array.from(new Set(children.map(c => c.key))).length != children.map(c => c.key).length) {
            m = ("Error: Must not contain duplicate values");
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
    for (const option of options) {
        const val = defaultValues(option, getMinv(options), children);
        if (val !== undefined) {
            return val;
        }
    }
    const val2 = defaultValues(type, getMinv(options), children);
    if (val2 !== undefined) {
        return val2;
    }
    return undefined;
}