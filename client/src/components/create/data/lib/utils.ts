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
    } else { // Field = [name, type, options, _comment]
        _idx = 0;
        [name, type, options, _comment] = field;
        children = [];
    }

    return [_idx, name, type, options, _comment, children];
}