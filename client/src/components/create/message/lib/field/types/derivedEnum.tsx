import React from 'react';
import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { InfoConfig, SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';

// Interface
interface DerivedEnumProps {
    def: StandardFieldArray;
    optChange: (n: string, v: any) => void;
    parent?: string;
    config: InfoConfig;
    children?: JSX.Element;
    value: any;
}

// Component
const DerivedEnum = (props: DerivedEnumProps) => {
    const { def, optChange, parent, children, config, value = {} } = props;
    const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;

    const onChange = (_k: string, v: any) => {
        optChange(name, v);
    }

    const [_idx, name, type, _args, comment] = def;
    const msgName = (parent ? [parent, name] : [name]).join('.');
    var optData: Record<string, any> = {};

    const typeDefs = schema.types.filter(t => t[0] === type);
    const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
    if (typeDef.length != 0) {
        optData = (opts2obj(typeDef[2]));
    }

    let fieldDef = [0, typeDef[0].toLowerCase(), typeDef[0], typeDef[2], typeDef[3]];

    return (
        <div className='form-group'>
            <div className='card'>
                <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                    <div>
                        <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                        {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                    </div>
                    {children}
                </div>
                <div className='card-body m-0 p-0'>
                    <Field key={fieldDef[0]} def={fieldDef} parent={msgName} optChange={onChange} config={config} value={value} />
                </div>
            </div>
        </div>
    );
}

export default DerivedEnum;
