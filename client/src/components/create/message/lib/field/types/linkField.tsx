//basic
import React from 'react';
import Field from '../Field';
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
    value: any;
}

// Component
const LinkField = (props: LinkFieldProps) => {

    const { def, optChange, parent, config, value } = props;
    const [_idx, name, type, _opts, _comment] = def;

    var optData: Record<string, any> = {};
    const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
    const typeDefs = schema.types.filter(t => t[0] === type);
    const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
    if (typeDef.length != 0) {
        optData = (opts2obj(typeDef[2]));
    }

    //find key
    let linkField = undefined;
    if (Array.isArray(typeDef[typeDef.length - 1]) && typeDef[typeDef.length - 1].length != 0) {
        for (let field of (typeDef[typeDef.length - 1])) {
            const [_fidx, _fname, _ftype, fopts, _fcomment] = field;
            const newField = [_fidx, name, _ftype, fopts, _fcomment];
            const foptData = (opts2obj(fopts));
            if (hasProperty(foptData, 'key')) {
                //create field based on key
                return linkField = (
                    <Field key={name} def={newField} parent={parent} optChange={optChange} config={config} value={value} />
                );
            }
        };
    }

    if (linkField) {
        return linkField;
    } else {
        return (<div style={{ color: 'red' }}> No Link Found </div>);
    }
}

export default LinkField;