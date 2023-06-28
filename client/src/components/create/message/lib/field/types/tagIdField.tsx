//basic
import React from 'react';
import Field from '../Field';
import { InfoConfig, SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { useAppSelector } from 'reducers';

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
    const [_idx, name, type, opts, comment] = def;

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
    const [_fidx, _fname, _ftype, _fopts, _fcomment] = selectedDef;
    const newField = [_fidx, name, _ftype, opts, comment];

    return (
        <Field key={name} def={newField} parent={parent} optChange={optChange} config={config} />
    );
}

export default TagIDField;