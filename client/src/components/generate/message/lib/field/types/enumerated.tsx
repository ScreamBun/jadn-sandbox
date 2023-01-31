import React from 'react';
import { isOptional } from '../..';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';

// Interface
interface EnumeratedFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any) => void;
  parent?: string;
}

// Component
const EnumeratedField = (props: EnumeratedFieldProps) => {
  const { def, optChange, parent } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;

  const [_idx, name, type, _opts, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');

  const typeDefs = schema.types.filter(t => t[0] === type);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];

  const defOpts = typeDef[typeDef.length - 1].map(opt => <option key={opt[0]} data-subtext={opt[2]}>{opt[1]}</option>);

  return (
    <div className='form-group'>
      <div className='card'>
        <div className='card-header p-2'>
          <h4 className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</h4>
          {comment ? <small className='card-subtitle text-muted'>{comment}</small> : ''}
        </div>
        <div className='card-body mx-3'>
          <div className="col-12 my-1 px-0">
            <select
              name={name}
              title={name}
              className="custom-select"
              onChange={e => optChange(msgName, e.target.value)}
            >
              <option data-subtext={`${name} options`} value={name} >{`${name} options`}</option>
              {defOpts}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnumeratedField;
