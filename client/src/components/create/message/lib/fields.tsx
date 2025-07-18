import React from "react";
import { makeCards, findKeys, findValues, hasChildren, getChildren, getRootType } from "./utils"
import { SchemaJADN } from "components/create/schema/interface";

// Aux Functions
const isOptional = (field: Array<any>): JSX.Element | JSX.Element[] | null => {
	switch (field.length) {
		case 5:
			return field[3].includes('[0');
		case 4:
			return field[2].includes('[0');
		default:
			return null;
	}
};

const makeChildCards = (children: Array<any>, schemaObj: SchemaJADN): JSX.Element | JSX.Element[] | null => {
    if(children.length == 0) {
        return null;
    }
    let childrenCards: JSX.Element[] = [];

    for (let child of children) {
        if (hasChildren(child, schemaObj)) {
            const cards = makeCards(child, schemaObj);
            if (Array.isArray(cards)) {
                childrenCards.push(...cards);
            } else if (cards) {
                childrenCards.push(cards);
            }
        } else {
            const card = makeFieldValueCard(child);
            if (Array.isArray(card)) {
                childrenCards.push(...card);
            } else if (card) {
                childrenCards.push(card);
            }
        }
    }

    return childrenCards;
}

const makeFieldValueCard = (field: Array<any>): JSX.Element | JSX.Element[] => {
    const name = field[1];
    const type = field[2];
    const fieldOpts = field[3];
    const showOpts = fieldOpts && fieldOpts.length > 0 ? `Opts: ${fieldOpts}` : '';
    const comment = field[4];

    return (
        <div className='form-group m-3'>
            <div className='card'>
                <div className='card-header p-4 d-flex justify-content-between'>
                    <div>
                        <p className='card-title m-0'>{`${type} - ${name}${isOptional(field) ? '' : '*'} ${showOpts}`}</p>
                        {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapKeyVals = (keys: JSX.Element[], values: JSX.Element[], schemaObj: SchemaJADN): JSX.Element | JSX.Element[] => {
    let mapping: JSX.Element[] = []
    for (let i = 0; i < keys.length; i++) {
        mapping.push(
            <div className='form-group'>
                 <div className='card'>
                    {makeCards(keys[i], schemaObj)}
                    {makeCards(values[i], schemaObj)}
                 </div>
            </div>
        );
    }
    return mapping;
}

// Card Functions
export const record = (field: Array<any>, schemaObj: SchemaJADN): JSX.Element | JSX.Element[] => {
    const name = field[0]
    const type = field[1];
    const fieldOpts = field[2]
    const showOpts = fieldOpts && fieldOpts.length > 0 ? `Opts: ${fieldOpts}` : '';
    const comment = field[3]
    const children = field[4]

    const card = 
        <div className='form-group'>
            <div className='card'>
                <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                    <div>
                        <p className='card-title m-0'>{`${type} - ${name}${isOptional(field) ? '' : '*'} ${showOpts}`}</p>
                        {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                    </div>
                </div>
                <div className = 'card-body mx-2'>
                    <div className='row'>
                        <div className="col my-1 px-0">
                            {makeChildCards(children, schemaObj)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    return card
}

export const enumerated = (field: Array<any>, schemaObj: SchemaJADN): JSX.Element | JSX.Element[] => {
    return <div></div>
}

export const array = (field: Array<any>, schemaObj: SchemaJADN): JSX.Element | JSX.Element[] => {
    const name = field[0]
    const type = field[1];
    const fieldOpts = field[2]
    const showOpts = fieldOpts && fieldOpts.length > 0 ? `Opts: ${fieldOpts}` : '';
    const comment = field[3]
    const children = field[4]

    const card = 
        <div className='form-group'>
            <div className='card'>
                <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                    <div>
                        <p className='card-title m-0'>{`${type} - ${name}${isOptional(field) ? '' : '*'} ${showOpts}`}</p>
                        {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                    </div>
                </div>
                <div className = 'card-body mx-2'>
                    <div className='row'>
                        <div className="col my-1 px-0">
                            {makeChildCards(children, schemaObj)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    return card
}

export const mapOf = (field: Array<any>, schemaObj: SchemaJADN): JSX.Element | JSX.Element[] => {
    const name = field[0]
    const type = field[1];
    const fieldOpts = field[2]
    const comment = field[3]

    const ktype = fieldOpts[0].substring(1);
    const vtype = fieldOpts[1].substring(1);
    const keys = findKeys(ktype, schemaObj);
    const values = findValues(vtype, schemaObj);

    return <div className='form-group m-3'>
        <div className='card'>
            <div className='card-header p-4 d-flex justify-content-between'>
                <div>
                    <p className='card-title m-0'>{`${type} - ${name}${isOptional(field) ? '' : '*'} ${fieldOpts}`}</p>
                    {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                </div>
            </div>
            <div className = 'card-body mx-2'>
                <div className='row'>
                    <div className="col my-1 px-0">
                        {mapKeyVals(
                            Array.isArray(keys) ? keys : [keys],
                            Array.isArray(values) ? values : [values],
                            schemaObj
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export const arrayOf = (field: Array<any>): JSX.Element | JSX.Element[] => {
    const name = field[0]
    const type = field[1];
    const fieldOpts = field[2]
    const showOpts = fieldOpts && fieldOpts.length > 0 ? `Opts: ${fieldOpts}` : '';
    const comment = field[3]

    return <div className='form-group m-3'>
        <div className='card'>
            <div className='card-header p-4 d-flex justify-content-between'>
                <div>
                    <p className='card-title m-0'>{`${type} - ${name}${isOptional(field) ? '' : '*'} ${showOpts}`}</p>
                    {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                </div>
            </div>
        </div>
    </div>
}

export const choice = (field: Array<any>, schemaObj: SchemaJADN): JSX.Element | JSX.Element[] => {
    return []
}

export const basetype = (field: Array<any>): JSX.Element | JSX.Element[] => {
    const name = field[0]
    const type = field[1];
    const typeOpts = field[2]
    const showOpts = typeOpts && typeOpts.length > 0 ? `Opts: ${typeOpts}` : '';
    const comment = field[3]

    switch(type) {
        //Default is string
        default:
            return <div className='form-group m-3'>
                    <div className='card'>
                        <div className='card-header p-4 d-flex justify-content-between'>
                            <div>
                                <p className='card-title m-0'>{`${type} - ${name}${isOptional(field) ? '' : '*'} ${showOpts}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                        </div>
                    </div>
                </div>
    }
}

export const derivedType = (field: Array<any>, schemaObj: SchemaJADN): JSX.Element | JSX.Element[] => {
    const name = field[1]
    const type = field[2];
    const typeOpts = field[3]
    const showOpts = typeOpts && typeOpts.length > 0 ? `Opts: ${typeOpts}` : '';
    const comment = field[4]
    const children = getChildren(getRootType(type, schemaObj), schemaObj);

    const card = 
        <div className='form-group m-3'>
            <div className='card'>
                <div className={`card-header p-4 ${children ? 'd-flex justify-content-between' : ''}`}>
                    <div>
                        <p className='card-title m-0'>{`${type} - ${name}${isOptional(field) ? '' : '*'} ${showOpts}`}</p>
                        {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                    </div>
                </div>
                <div className = 'card-body mx-2'>
                    <div className='row'>
                        <div className="col my-1 px-0">
                            {makeChildCards(children, schemaObj)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    return card
}