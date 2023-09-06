
//ArrayOf
import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { InfoConfig, SchemaJADN, StandardFieldArray, TypeArray } from '../../../../schema/interface';
import { opts2obj } from '../../../../schema/structure/editors/options/consts';
import { useAppSelector } from '../../../../../../reducers';
import { validateOptDataElem } from '../../utils';
import { delMultiKey, hasProperty, setMultiKey } from 'components/utils';
import { $MINV } from 'components/create/consts';

// Interface
interface MapOfFieldProps {
    def: StandardFieldArray;
    optChange: (n: string, v: any, i?: number) => void;
    parent?: string;
    config: InfoConfig;
}

// MapOf Field Component
const MapOfField = (props: MapOfFieldProps) => {
    const { def, parent, optChange, config } = props;
    const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;

    const [count, setCount] = useState(1);
    const [min, setMin] = useState(false);
    const [max, setMax] = useState(false);
    const [opts, setOpts] = useState<any[]>([]); //opts: let every obj have a key and value [{key: '', value:''}, ...]
    const [kopts, setkOpts] = useState<any[]>([]);
    const [vopts, setvOpts] = useState<any[]>([]);
    const [errMsg, setErrMsg] = useState<string[]>([]);

    var optData: Record<string, any> = {};
    const [_idx, name, type, args, comment] = def;
    const msgName = (parent ? [parent, name] : [name]).join('.');

    const addOpt = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        //check if max fields has been created
        const maxCount = hasProperty(optData, 'maxv') && optData.maxv != 0 ? optData.maxv : config.$MaxElements;
        setMax(maxCount <= count);
        setCount(count + 1);
    }

    const removeOpt = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        //check if min fields exist
        const minCount = hasProperty(optData, 'minv') && optData.minv != 0 ? optData.minv : $MINV;
        setMin(count <= minCount);
        if (count <= minCount) {
            return;
        }
        //remove from end of arr
        var updatedOpts = opts.filter((_obj, index) => {
            return index != count - 1;
        });
        setOpts(updatedOpts);
        //TODO? filter null values?
        //validate data
        const errCheck = validateOptDataElem(config, optData, updatedOpts);
        setErrMsg(errCheck);

        //update data
        optChange(msgName, Array.from(new Set(Object.values(updatedOpts))));
        setCount(count - 1);
    }

    const onChangeKey = (k: string, v: any, i: number) => {
        if (!v) {
            v = '';
        }
        const ktype = msgName + "." + optData.ktype.toLowerCase();
        const arrKeys = ktype.split(".");
        const valKeys = k.split(".");
        const nestedKeys = valKeys.slice(arrKeys.length);

        let updatedVal = v;
        if (nestedKeys.length != 0) {
            updatedVal = { ...kopts[i] };
            if (v) {
                setMultiKey(updatedVal, k.toString(), v);
            } else {
                delMultiKey(updatedVal, k.toString());
                if (nestedKeys.length > 1 && updatedVal[nestedKeys[0]] && !updatedVal[nestedKeys[0]][nestedKeys[1]]) {
                    delMultiKey(updatedVal, nestedKeys[0].toString());
                }
            }
        }

        var updatedOpts;
        if (kopts.length - 1 < i) {
            updatedOpts = [...kopts, updatedVal];
        } else {
            updatedOpts = kopts.map((obj, idx) => {
                if (idx === i) {
                    return updatedVal;
                } else {
                    return obj;
                }
            });
        }

        setkOpts(updatedOpts);
        onChange('key', updatedOpts, i);
    }

    const onChangeValue = (k: string, v: any, i: number) => {
        if (!v) {
            v = '';
        }
        const vtype = msgName + "." + optData.vtype.toLowerCase();
        const arrKeys = vtype.split(".");
        const valKeys = k.split(".");
        const nestedKeys = valKeys.slice(arrKeys.length);

        let updatedVal = v;
        if (nestedKeys.length != 0) {
            updatedVal = { ...vopts[i] };
            if (v) {
                setMultiKey(updatedVal, nestedKeys.join('.').toString(), v);
            } else {
                delMultiKey(updatedVal, nestedKeys.join('.').toString());
                if (nestedKeys.length > 1 && updatedVal[nestedKeys[0]] && !updatedVal[nestedKeys[0]][nestedKeys[1]]) {
                    delMultiKey(updatedVal, nestedKeys[0].toString());
                }
            }
        }

        var updatedOpts;
        if (vopts.length - 1 < i) {
            updatedOpts = [...vopts, updatedVal];
        } else {
            updatedOpts = vopts.map((obj, idx) => {
                if (idx === i) {
                    return updatedVal;
                } else {
                    return obj;
                }
            });
        }

        setvOpts(updatedOpts);
        onChange('val', updatedOpts, i);
    }

    const onChange = (k: string, v: any, i: number) => {
        var updatedOpts;
        //add to key or value type
        if (opts.length - 1 < i) {
            updatedOpts = [...opts, { [k]: v[i] }];
            setOpts(updatedOpts);
        } else {
            updatedOpts = opts.map((obj, idx) => {
                if (idx === i) {
                    return { ...obj, [k]: v[i] };
                } else {
                    return obj;
                }
            });
            setOpts(updatedOpts);
        }

        const errCheck = validateOptDataElem(config, optData, updatedOpts);
        setErrMsg(errCheck);

        // TODO: FINISH REDUCE ARR OF OBJ ...
        // A MapOf type where ktype is Enumerated is equivalent to a Map. 
        // JSON object if ktype is a String type 
        // JSON array if ktype is not a String type.  
        let data;
        const ktypeDefs = schema.types.filter(t => t[0] === keyField[2]);
        var ktypeDef = ktypeDefs.length === 1 ? ktypeDefs[0][1] : keyField[2];
        if (ktypeDef == 'Enumerated' || ktypeDef == 'String') {
            data = updatedOpts.reduce((opts, obj) => { return Object.assign(opts, { [obj.key]: obj.val }) }, {});
        } else {
            data = updatedOpts.reduce((opts, obj) => { return opts.concat([obj.key], [obj.val]) }, []);
        }

        optChange(msgName, data);
    }

    const typeDefs: TypeArray[] = schema.types.filter(t => t[0] === type);
    const typeDef = typeDefs.length === 1 ? typeDefs[0] : []; //type is not model defined; mapOf
    if (typeDef.length != 0) {
        optData = (opts2obj(typeDef[2]));
    } else {
        optData = (opts2obj(args));
    }
    // MUST include ktype and vtype options.


    // if ktype is enum/pointer = derived enum else ktype
    var keyDef; //keyDef == defined or based type
    var keyField: any[];
    if (optData.ktype.startsWith("#") || optData.ktype.startsWith(">")) {
        optData.ktype = optData.ktype.slice(1);
        const keyDefs: TypeArray[] = schema.types.filter((t: any) => t[0] === optData.ktype);
        //CURRENTLY IN TypeKey = 'name' | 'type' | 'options' | 'comment' | 'fields';
        //no fields in def
        //StandardFieldKey = 'id' | 'name' | 'type' | 'options' | 'comment';
        keyDefs.length === 1 ? keyDef = keyDefs[0] : keyDef = keyDefs;
        keyField = [0, keyDef.toLowerCase(), 'Enumerated', [], keyDef[keyDef.length - 1]];

    } else {
        const keyDefs: TypeArray[] = schema.types.filter((t: any) => t[0] === optData.ktype);
        const keyDef = keyDefs.length === 1 ? keyDefs[0] : optData.ktype;

        if (keyDefs.length != 0) {
            keyField = keyDef.length === 4 ? [0, keyDef[0].toLowerCase(), keyDef[0], [], keyDef[keyDef.length - 1]]
                : [0, keyDef[0].toLowerCase(), keyDef[0], [], keyDef[keyDef.length - 2]];
        } else {
            //vtype is a primitive type or undefined (create string field)
            // TODO? : definition not found = unresolved schema (validate JADN should have failed)
            keyField = [0, keyDef.toLowerCase(), keyDef, [], ''];
        }
    }

    // if vtype is enum/pointer = derived enum
    var valDef;
    var valField;
    if (optData.vtype.startsWith("#") || optData.vtype.startsWith(">")) {
        optData.vtype = optData.vtype.slice(1);
        const valDefs: TypeArray[] = schema.types.filter((t: any) => t[0] === optData.vtype);
        valDefs.length === 1 ? valDef = valDefs[0] : valDef = valDefs;
        valField = [0, valDef.toLowerCase(), 'Enumerated', [], valDef[valDef.length - 1]];

    } else {
        //vtype is an def
        const valDefs: TypeArray[] = schema.types.filter((t: any) => t[0] === optData.vtype);
        const valDef = valDefs.length === 1 ? valDefs[0] : optData.vtype;
        if (valDefs.length != 0) {
            valField = valDef.length === 4 ? [0, valDef[0].toLowerCase(), valDef[0], [], valDef[valDef.length - 1]]
                : [0, valDef[0].toLowerCase(), valDef[0], [], valDef[valDef.length - 2]];
        } else {
            //vtype is a primitive type or undefined (create string field)
            // TODO? : definition not found = unresolved schema (validate JADN should have failed)
            valField = [0, valDef.toLowerCase(), valDef, [], ''];
        }
    }

    const fields: any[] = [];
    for (let i = 0; i < count; ++i) {
        fields.push(
            <div className='form-group' key={i}>
                <div className='card border-secondary'>
                    <div className='card-header p-2'>
                        <p className='card-title m-0'>
                            {name} {i + 1}
                        </p>
                    </div>
                    <div className='card-body mx-2'>
                        <Field key={"key"} def={keyField} parent={msgName} optChange={onChangeKey} idx={i} config={config} />
                        <Field key={"value"} def={valField} parent={msgName} optChange={onChangeValue} idx={i} config={config} />
                    </div>
                </div>
            </div >
        );
    }

    const err = errMsg.map((msg, index) =>
        <div key={index}><small className='form-text' style={{ color: 'red' }}>{msg}</small></div>
    );

    return (
        <div className='form-group'>
            <div className='card border-secondary'>
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
                    {err}
                </div>

                <div className='card-body mx-2'>
                    {fields}
                </div>
            </div>
        </div>
    );
}

export default MapOfField;
