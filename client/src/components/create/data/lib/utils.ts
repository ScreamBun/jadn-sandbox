export const isOptional = (options: any[]): boolean => {
    for (const opt of options) {
        if (String(opt) === '[0') {
            return true;
        }
    }
    return false;
}

const isDerived = (type: string): Boolean => {
    if (type === "Array" || type === "ArrayOf" || type === "Choice" || type === "Enumerated" || 
        type === "Map" || type === "MapOf" || type === "Record" || type === "String" || 
        type === "Integer" || type === "Number" || type === "Boolean" || type === "Binary") {
        return false;
    }
    return true;
}

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