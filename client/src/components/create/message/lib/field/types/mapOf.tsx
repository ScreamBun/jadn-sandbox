
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
import { merge } from 'lodash';

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
    const [opts, setOpts] = useState([]);
    const [isValid, setisValid] = useState('');

    var optData: Record<string, any> = {};
    const [_idx, name, type, args, comment] = def;
    const msgName = (parent ? [parent, name] : [name]).join('.');

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
        //opts: let every obj have a key and value [{key: '', value:''}, ...]
        //data : then reduce object to key:value pairs 
        const ktype = msgName + "." + optData.ktype.toLowerCase();
        const vtype = msgName + "." + optData.vtype.toLowerCase();

        if (Number.isNaN(v)) {
            v = undefined;
        }

        const arrKeys = msgName.split(".");
        const valKeys = k.split(".");

        if (valKeys.length == 1 && v == undefined) {
            //reset
            setOpts([]);
        } else if ((arrKeys.length < valKeys.length)) {
            //create nested obj based on keys
            const nestedKeys = valKeys.slice(arrKeys.length);
            let nestedObj = {};
            nestedKeys.reduce((obj, key, index) => {
                if (index == nestedKeys.length - 1) {
                    return obj[key] = v;
                } else {
                    return obj[key] = {};
                }
            }, nestedObj);

            v = nestedObj;

            if (opts[i]) {
                //merge and update v obj at opt[i] key or value 
                let oldV;
                if (k == ktype && opts[i]['key']) {
                    oldV = opts[i]['key'];
                } else if (k == vtype && opts[i]['value']) {
                    oldV = opts[i]['value'];
                }
                v = merge(oldV, v);
            }//else no data to merge
        } //else v is not an obj

        let updatedOpts;
        if (i <= opts.length - 1) {
            //update
            updatedOpts = opts.map((opt, index) => {
                if (i === index) {
                    if (k == ktype) {
                        //change key
                        return { ...opt, ['key']: v };
                    } else if (k == vtype) {
                        //change val
                        return { ...opt, ['value']: v };
                    }
                } else {
                    return opt;
                }
            });
            setOpts(updatedOpts);

        } else {
            //add 
            if (k == ktype) {
                //add key
                setOpts([...opts, { ['key']: v, ['value']: '' }]);
                updatedOpts = [...opts, { ['key']: v, ['value']: '' }];
            } else if (k == vtype) {
                //add val
                setOpts([...opts, { ['key']: '', ['value']: v }]);
                updatedOpts = [...opts, { ['key']: '', ['value']: v }];
            }
        }

        /* //working ish---- string escape characters visible...
        updatedOpts?.forEach((obj) => {
            const newKey = JSON.stringify(obj.key)
            Object.assign(data, { [newKey]: obj.value });
        }) */

        //const data = updatedOpts?.reduce((opts, obj) => ({ ...opts, [obj.key]: obj.value }), {});
        //issue: key ===> obj obj         
        //CREATE MAP not obj, but json does not understand MAP
        //convert map key to string ===> obj

        /*    let mapOfdata: Map<any, any>[] = [];
           updatedOpts?.forEach(obj => {
               let newO = new Map();
               newO.set(obj.key, obj.value);
               mapOfdata.push(newO)
           }); 
                   console.log(mapOfdata)*/

        //JSON object if ktype is a String type
        //JSON array if ktype is not a String type. 
        let data;
        if (updatedOpts && typeof updatedOpts[0]['key'] == "string") {
            data = updatedOpts.reduce((opts, obj) => ({ ...opts, [obj.key]: obj.value }), {});
        } else {
            //data = updatedOpts;
            data = [];
            updatedOpts?.forEach(obj => {
                data.push(obj.key);
                data.push(obj.value);
            });
        }
        optChange(msgName, data);
    }


    const typeDefs: TypeArray[] = schema.types.filter(t => t[0] === type);
    const typeDef = typeDefs.length === 1 ? typeDefs[0] : def;

    if (typeDef) {
        if (typeDefs.length === 1) {
            optData = (opts2obj(typeDef[2]));
        } else {
            optData = (opts2obj(args));
        }
        if (optData.ktype.startsWith("#") || optData.ktype.startsWith(">")) {
            optData.ktype = optData.ktype.slice(1);
        }
        if (optData.vtype.startsWith("#") || optData.vtype.startsWith(">")) {
            optData.vtype = optData.vtype.slice(1);
        }
        // MUST include ktype and vtype options.
        //console.log(optData);
    }

    const keyDefs: TypeArray[] = schema.types.filter((t: any) => t[0] === optData.ktype);
    let keyDef; //keyDef == defined or based type
    let keyField;

    //CURRENTLY IN TypeKey = 'name' | 'type' | 'options' | 'comment' | 'fields';
    //StandardFieldKey = 'id' | 'name' | 'type' | 'options' | 'comment';
    if (keyDefs.length === 1) {
        keyDef = keyDefs[0];
        //CHECK IF THERE ARE FIELDS (type array vs standard field array)
        keyField = keyDef.length === 4 ? [0, keyDef[0].toLowerCase(), keyDef[0], [], keyDef[keyDef.length - 1]]
            : [0, keyDef[0].toLowerCase(), keyDef[0], [], keyDef[keyDef.length - 2]];
    } else {
        //definition not found
        keyDef = optData.ktype;
        keyField = [0, keyDef.toLowerCase(), 'String', [], ''];
    }

    const valDefs: TypeArray[] = schema.types.filter((t: any) => t[0] === optData.vtype);
    let valDef;
    let valField;
    if (valDefs.length === 1) {
        valDef = valDefs[0];
        valField = valDef.length === 4 ? [0, valDef[0].toLowerCase(), valDef[0], [], valDef[valDef.length - 1]]
            : [0, valDef[0].toLowerCase(), valDef[0], [], valDef[valDef.length - 2]];
    } else {
        valDef = optData.vtype;
        valField = [0, valDef.toLowerCase(), 'String', [], ''];
    }

    const fields: any[] = [];
    for (let i = 0; i < count; ++i) {
        fields.push(
            <div className='form-group' key={i}>
                <div className='card'>
                    <div className='card-header p-2'>
                        <p className='card-title m-0'>
                            {name} {i + 1}
                        </p>
                    </div>
                    <div className='card-body mx-2'>
                        <Field key={"key"} def={keyField} parent={msgName} optChange={onChange} idx={i} />
                        <Field key={"value"} def={valField} parent={msgName} optChange={onChange} idx={i} />
                    </div>
                </div>
            </div >
        );
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
