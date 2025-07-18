import { SchemaJADN } from 'components/create/schema/interface';
import { record, enumerated, array, mapOf, arrayOf, choice, basetype, derivedType } from './fields';

// Make Specific Card
export const makeCards = (field: any, schemaObj: SchemaJADN): JSX.Element | JSX.Element[] => {
    console.log(field);
    if(field[1] === 'Record') {
        return record(field, schemaObj);
    } else if (field[1] === 'Enumeration') {
        return enumerated(field, schemaObj);
    } else if (field[1] === 'Array') {
        return array(field, schemaObj);
    } else if (field[1] === 'MapOf') {
        return mapOf(field, schemaObj);
    } else if (field[1] === 'ArrayOf') {
        return arrayOf(field);
    } else if (field[1] === 'Choice') {
        return choice(field, schemaObj);
    } else if (field[1] === 'Binary' || field[1] === 'Boolean' || field[1] === 'Integer' || field[1] === 'Number' || field[1] === 'String'){
        return basetype(field);
    } else {
        return derivedType(field, schemaObj);
    }
};

export const findKeys = (type: string, schemaObj: SchemaJADN): JSX.Element | JSX.Element[] => {
    const types = schemaObj.types;
    const keys: any[] = [];
    for (const t of types) {
        if (t[1] === type || t[0] === type) {
            keys.push(t);
        }
    }
    return keys;
}

export const findValues = (type: string, schemaObj: SchemaJADN): JSX.Element | JSX.Element[] => {
    const types = schemaObj.types;
    const values: any[] = [];
    for (const t of types) {
        if (t[1] === type || t[0] === type) {
            values.push(t);
        }
    }
    return values;
}

export const hasChildren = (field: any, schemaObj: SchemaJADN): boolean => {
    const types = schemaObj.types;
    for (const t of types) {
        if (t[0] === field[1] || t[0] === field[2]){
            if (t[4] && t[4].length > 0) {
                return true;
            }
            return false;
        }
    }
    return false;
}

export const getChildren = (field: string, schemaObj: SchemaJADN): any[] => {
    const types = schemaObj.types;
    for (const t of types) {
        if (t[0] === field){
            if (t[4] && t[4].length > 0) {
                return t[4];
            }
        }
    }
    return [];
}

export const getRootType = (field: string, schemaObj: SchemaJADN): string => {
    const types = schemaObj.types;
    for (const t of types) {
        if (t[0] === field){
            return t[0];
        }
    }
    return ""
}