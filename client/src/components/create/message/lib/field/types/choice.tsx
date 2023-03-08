import React, { useState } from 'react';
import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { hasProperty } from 'react-json-editor/dist/utils';

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
  const [selected, setSelected] = useState('-1');


  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { optChange, def } = props;
    setSelected(e.target.value);
    optChange(def[1], undefined); //target is undefined
    //e.target.selectedOptions[0].text
  }

  const [_idx, name, type, _args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');
  var optData: Record<string, any> = {};

  const typeDefs = schema.types.filter(t => t[0] === type);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  if (typeDef) {
    optData = (opts2obj(typeDef[2]));
    //TODO type opts: extend
  }

  let defOpts;
  let selectedOpts;
  if (typeDef[typeDef.length - 1] == '' || typeDef[typeDef.length - 1] == null) {
    defOpts = <option value="-1">No Options Available</option>;
  } else {
    defOpts = typeDef[typeDef.length - 1].map((opt: any) => <option key={opt[0]} data-subtext={opt[2]} value={hasProperty(optData, 'id') && optData.id ? opt[0] : opt[1]}>{opt[1]}</option>);

    let selectedDefs; //get opt where the key = selected
    if (hasProperty(optData, 'id') && optData.id) {
      selectedDefs = typeDef[typeDef.length - 1].filter((opt: any) => opt[0] === selected);
    } else {
      selectedDefs = typeDef[typeDef.length - 1].filter((opt: any) => opt[1] === selected);
      const selectedDef = selectedDefs.length === 1 ? selectedDefs[0] : [];
      selectedOpts = selected >= '0' ? <Field key={selectedDef[1]} def={selectedDef} parent={msgName} optChange={optChange} /> : '';
    }
  }

  return (
    <div className='form-group'>
      <div className='card'>
        <div className='card-header p-2'>
          <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
          {comment && <small className='card-subtitle form-text text-muted'>{comment}</small>}
        </div>
        <div className='card-body m-0 p-0'>
          <div className='row'>
            <div className="col mb-2">
              <select name={name} title={name} className="custom-select" onChange={handleChange}>
                <option data-subtext={`${name} options`} value='-1'> {name} options </option>
                {defOpts}
              </select>
            </div>
          </div>
          <div className='row'>
            <div className="col">
              {selectedOpts}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChoiceField;
