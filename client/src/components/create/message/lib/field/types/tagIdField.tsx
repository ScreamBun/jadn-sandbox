//basic
import React from 'react';
import Field from '../Field';
import { InfoConfig, SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { useAppSelector } from 'reducers';
import { isOptional } from '../../GenMsgLib';

// Interface
interface TagIDFieldProps {
    def: StandardFieldArray;
    optChange: (n: string, v: any, i?: number) => void;
    parent?: string;
    config: InfoConfig;
    selectedEnum: string;
}

// Component
const TagIDField = (props: TagIDFieldProps) => {

    const { def, optChange, parent, config, selectedEnum } = props;
    const [idx, name, type, opts, comment] = def;

    var optData: Record<string, any> = {};
    const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
    const typeDefs = schema.types.filter(t => t[0] === type);
    let typeDef = typeDefs.length === 1 ? typeDefs[0] : def;
    if (typeDef) {
        optData = (opts2obj(opts));
    }

    //choice field based on selectedEnum
    const selectedDefs = typeDef[typeDef.length - 1].filter((opt: any) => opt[1] === selectedEnum);
    const selectedDef = selectedDefs.length === 1 ? selectedDefs[0] : [];
    if (selectedDef.length != 0) {
        const [_fidx, _fname, _ftype, _fopts, _fcomment] = selectedDef;
        const newField = [_fidx, name, _ftype, opts, comment];
        return (
            <Field key={name} def={newField} parent={parent} optChange={optChange} config={config} />
        );
    } else {
        return (
            <div className='form-group' key={idx}>
                <div className='card'>
                    <div className='card-header p-2'>
                        <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                        {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
                    </div>

                    <div className='card-body mx-2'>
                        <span style={{ color: 'red' }}> Key Not Found</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default TagIDField;