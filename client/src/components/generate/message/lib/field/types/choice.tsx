import React, { useState } from 'react';
import Field from '..';
import { isOptional } from '../..';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';

// Interface
interface ChoiceFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any) => void;
  parent?: string;
}

// Component
const ChoiceField = (props: ChoiceFieldProps) => {
  const { def, optChange, parent } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
  const [selected, setSelected] = useState(-1);


  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { optChange, def } = props;
    setSelected(parseInt(e.target.value, 10));
    optChange(def[1], undefined); //target is undefined
    //e.target.selectedOptions[0].text
  }

  const [_idx, name, _type, _args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');

  const typeDefs = schema.types.filter(t => t[0] === def[2]);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  const defOpts = typeDef[typeDef.length - 1].map((opt: any) => <option key={opt[0]} data-subtext={opt[2]} value={opt[0]}>{opt[1]}</option>);

  const selectedDefs = typeDef[typeDef.length - 1].filter((opt: any) => opt[0] === selected); //get opt where the key = selected
  const selectedDef = selectedDefs.length === 1 ? selectedDefs[0] : [];

  const selectedOpts = selected >= 0 ? <Field key={def[1]} def={selectedDef} parent={msgName} optChange={optChange} /> : '';

  return (
    <div className='form-group'>
      <div className='card'>
        <div className='card-header p-2'>
          <h4 className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</h4>
          {comment && <small className='card-subtitle text-muted'>{comment}</small>}
        </div>
        <div className='card-body mx-3'>
          <div className="col-12 my-1 px-0">
            <select name={name} title={name} className="custom-select" onChange={handleChange}>
              <option data-subtext={`${name} options`} value='-1'> {name} options </option>
              {defOpts}
            </select>
          </div>
          <div className="col-12 py-2">
            {
              selectedOpts
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChoiceField;
