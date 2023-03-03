
//ArrayOf
import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { SchemaJADN, StandardFieldArray, TypeArray } from '../../../../schema/interface';
import { opts2obj } from '../../../../schema/structure/editors/options/consts';
import { hasProperty } from '../../../../../utils';
import { useAppSelector } from '../../../../../../reducers';

// Interface
interface MapOfFieldProps {
    def: StandardFieldArray;
    optChange: (n: string, v: any, i?: number) => void;
    parent?: string;
}

// MapOf Field Component
const MapOfField = (props: MapOfFieldProps) => {
    const { def, parent, optChange } = props;
    const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
    const [min, setMin] = useState(false);
    const [max, setMax] = useState(false);
    const [count, setCount] = useState(1);
    const [opts, setOpts] = useState([]); //array of objects
    const [isValid, setisValid] = useState('');

    var optData: Record<string, any> = {};
    const [_idx, name, type, _args, comment] = def;
    const msgName = (parent ? [parent, name] : [name]).join('.');

    const typeDefs: TypeArray[] = schema.types.filter(t => t[0] === type);
    const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
    if (typeDef) {
        optData = (opts2obj(typeDef[2]));
        if (optData.ktype.startsWith("#") || optData.ktype.startsWith(">")) {
            optData.ktype = optData.ktype.slice(1);
        }
        if (optData.vtype.startsWith("#") || optData.vtype.startsWith(">")) {
            optData.vtype = optData.vtype.slice(1);
        }
        // MUST include ktype and vtype options.
    }

    const keyDefs: TypeArray[] = schema.types.filter((t: any) => t[0] === optData.ktype);
    const keyDef = keyDefs.length === 1 ? keyDefs[0] : typeDef[0];

    const keyField = keyDefs.length === 1 ? [0, keyDef[0].toLowerCase(), keyDef[0], [], keyDef[keyDef.length - 2]]
        : [0, keyDef, 'String', [], ''];

    const valDefs: TypeArray[] = schema.types.filter((t: any) => t[0] === optData.vtype);
    const valDef = valDefs.length === 1 ? valDefs[0] : typeDef[0];

    const valField = valDefs.length === 1 ? [0, valDef[0].toLowerCase(), valDef[0], [], valDef[valDef.length - 2]]
        : [0, valDef, 'String', [], ''];

    const fields: any[] = [];
    for (let i = 0; i < count; ++i) {
        fields.push(<Field key={"k" + i} def={keyField} parent={msgName} optChange={onChange} idx={i} />);
        fields.push(<Field key={"v" + i} def={valField} parent={msgName} optChange={onChange} idx={i} />);
    }

    const addOpt = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setisValid('');
        const maxCount = hasProperty(optData, 'maxv') && optData.maxv != 0 ? optData.maxv : 20;
        const maxBool = count < maxCount;
        if (!maxBool) {
            setisValid('Error: Maximum of ' + maxCount)
        }
        setCount(maxBool ? count => count + 1 : count);
        setMax(maxBool => !maxBool);
        setOpts([...opts, {}]);
    }

    const removeOpt = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setisValid('');
        const minCount = hasProperty(optData, 'minv') ? optData.minv : 0;

        const minBool = count > minCount;
        if (minBool) {
            setOpts(
                opts.filter((_opt, index) =>
                    index !== opts.length - 1
                )
            );

            const tmpOpts = [...opts];
            tmpOpts.pop();
            const filteredOpts = tmpOpts.filter(data => {
                return data != null;
            });
            optChange(msgName, Array.from(new Set(Object.values(filteredOpts))));
        } else {
            setisValid('Error: Minimum of ' + minCount)
        }

        setCount(minBool ? count => count - 1 : count);
        setMin(minBool => !minBool);
    }

    const onChange = (k: string, v: any, i: number) => {
        if (Number.isNaN(v)) {
            v = undefined;
        }

        const ktype = msgName + "." + optData.ktype.toLowerCase();
        //const vtype = msgName + "." + optData.vtype.toLowerCase();
        let key;
        if (k == ktype) {
            key = "key";
        } else {
            key = "value";
        }

        let updatedOpts;
        if (i < opts.length) {
            updatedOpts = opts.map((opt, index) => {
                if (i === index) {
                    return { ...opt, [key]: v };
                } else {
                    return opt;
                }
            });
            setOpts(updatedOpts);
        } else {
            setOpts([...opts, { [key]: v }]);
            updatedOpts = [...opts, { [key]: v }];
        }


        const data = Object.assign({}, ...updatedOpts.map(({ key, value }) =>
            ({ [key]: value })));

        optChange(msgName, data);
    }

    return (
        <div className='form-group'>
            <div className='card'>
                <div className='card-header p-2'>
                    <p className='card-title m-0'>
                        {`${name}${isOptional(def) ? '' : '*'}`}
                    </p>
                    <Button
                        color="danger"
                        className={`float-right p-1${min ? ' disabled' : ''}`}
                        onClick={removeOpt}
                    >
                        <FontAwesomeIcon icon={faMinusSquare} size="lg" />
                    </Button>
                    <Button
                        color="primary"
                        className={`float-right p-1${max ? ' disabled' : ''}`}
                        onClick={addOpt}
                    >
                        <FontAwesomeIcon icon={faPlusSquare} size="lg" />
                    </Button>
                    {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
                    <div><small className='form-text' style={{ color: 'red' }}> {isValid}</small></div>
                </div>

                <div className='card-body mx-2'>
                    {fields}
                </div>
            </div>
        </div>
    );
}

export default MapOfField;
