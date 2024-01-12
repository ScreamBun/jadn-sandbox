import React, { useState } from 'react';
import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { InfoConfig, SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { hasProperty } from 'components/utils';
import SBSelect, { Option } from 'components/common/SBSelect';

// Interface
interface ChoiceFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any) => void;
  parent?: string;
  config: InfoConfig;
  children?: JSX.Element;
  value: any;
}

// Component
const ChoiceField = (props: ChoiceFieldProps) => {
  const { def, optChange, parent, config, children, value = {} } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
  const [initSelectedOpt, InitSelectedValues] = (typeof value == "object" && Object.keys(value).length != 0) ? Object.entries(value)[0] :
    (typeof value == "string" && value.length != 0) ? [value, ""] : ["", ""];
  const initSelectedOptValue = initSelectedOpt != '' ? { 'label': initSelectedOpt, 'value': initSelectedOpt } : null;

  const [selectedValue, setSelectedValue] = useState<Option | null>(initSelectedOptValue);
  const [selectedValueData, setSelectedValueData] = useState<any>(InitSelectedValues);

  const handleChange = (e: Option) => {
    //get selected choice
    if (e == null) {
      setSelectedValue(null);
      setSelectedValueData('');
      optChange(name, null);
    } else {
      setSelectedValue(e);
      setSelectedValueData(InitSelectedValues);
      optChange(name, e.value);
    }
    //target is undefined 
    //this resets selected choice
    //e.target.selectedOptions[0].text
  }

  const onChange = (k: string, v: any) => {
    //get fields (k, v) for selected choice 
    let updatedData = { [k]: v }
    setSelectedValueData(updatedData);
    optChange(name, updatedData);
  }

  const [_idx, name, type, _args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');
  var optData: Record<string, any> = {};

  const typeDefs = schema.types.filter(t => t[0] === type);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  if (typeDef.length != 0) {
    optData = (opts2obj(typeDef[2]));
  }

  let defOpts; //select dropdown options
  if (Array.isArray(typeDef[typeDef.length - 1]) && typeDef[typeDef.length - 1].length != 0) {
    defOpts = typeDef[typeDef.length - 1]?.map((opt: any) => ({ value: `${hasProperty(optData, 'id') && optData.id ? opt[0] : opt[1]}`, label: opt[1] }));
  }

  let selectedOpts;
  if (selectedValue != null) {
    let selectedDefs; //get opt where the key = selected
    if (hasProperty(optData, 'id') && optData.id) {
      selectedDefs = typeDef[typeDef.length - 1].filter((opt: any) => opt[0] === selectedValue.value);
    } else {
      selectedDefs = typeDef[typeDef.length - 1].filter((opt: any) => opt[1] === selectedValue.value);
    }
    const selectedDef = selectedDefs.length === 1 ? selectedDefs[0] : [];
    selectedOpts = <Field key={selectedDef[1]} def={selectedDef} parent={msgName} optChange={onChange} config={config} value={selectedValueData} />;
  }

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
          <div className='row'>
            <div className="col mb-2">
              <SBSelect id={name} name={name} data={defOpts}
                onChange={handleChange}
                placeholder={`${name} options`}
                value={selectedValue}
                isClearable />
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
