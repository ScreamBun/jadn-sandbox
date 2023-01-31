import React from 'react';
import Field from '..';
import { isOptional } from '../..';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';

// Interface
interface MapFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any) => void;
  parent?: string;
}

// Component
const MapField = (props: MapFieldProps) => {
  const { def, optChange, parent } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;

  const [_idx, name, _type, _args, comment] = def;

  const typeDefs = schema.types.filter(t => t[0] === def[2]);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  const fieldDef = typeDef[typeDef.length - 1].map((d: any) => <Field key={d[0]} def={d} parent={msgName} optChange={optChange} />)

  const msgName = (parent ? [parent, name] : [name]).join('.');

  return (
    <div className='form-group'>
      <div className='card'>
        <div className='card-header p-2'>
          <h4 className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</h4>
          {comment ? <small className='card-subtitle text-muted'>{comment}</small> : ''}
        </div>
        <div className='card-body mx-3'>
          <div className="col-12 my-1 px-0">
            {fieldDef}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapField;
