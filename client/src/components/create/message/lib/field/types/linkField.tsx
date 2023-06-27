//basic
import React from 'react';
import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { InfoConfig, SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { useAppSelector } from 'reducers';
import { hasProperty } from 'components/utils';

// Interface
interface LinkFieldProps {
    def: StandardFieldArray;
    optChange: (n: string, v: any, i?: number) => void;
    parent?: string;
    config: InfoConfig;
}

// Component
const LinkField = (props: LinkFieldProps) => {

    const { def, optChange, parent, config } = props;
    const [_idx, name, type, opts, comment] = def;
    let msgName: any = parent;

    var optData: Record<string, any> = {};
    const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
    const typeDefs = schema.types.filter(t => t[0] === type);
    let typeDef = typeDefs.length === 1 ? typeDefs[0] : def;
    if (typeDef) {
        optData = (opts2obj(opts));
    }

    //find key
    let linkField = undefined;
    typeDef[typeDef.length - 1].every((field: StandardFieldArray) => {
        const [_fidx, fname, _ftype, fopts, _fcomment] = field;
        const foptData = (opts2obj(fopts));
        if (hasProperty(foptData, 'key')) {
            //create field based on key
            return linkField = (
                <div className='form-group'>
                    <div className='card'>
                        <div className='card-header p-2'>
                            <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                            {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
                        </div>
                        <div className='card-body'>
                            <Field key={fname} def={field} parent={msgName} optChange={optChange} config={config} />
                        </div>
                    </div>
                </div>
            );
        }
    });

    if (linkField) {
        return linkField;
    } else {
        return (<div style={{ color: 'red' }}> No Link Found </div>);
    }
}

export default LinkField;