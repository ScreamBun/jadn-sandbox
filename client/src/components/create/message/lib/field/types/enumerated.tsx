import React, { useState } from 'react';
import { isOptional } from '../../GenMsgLib';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { hasProperty } from 'components/utils';
import SBSelect, { Option } from 'components/common/SBSelect';

// Interface
interface EnumeratedFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any) => void;
  parent?: string;
  children?: JSX.Element;
  value: any;
}

// Component
const EnumeratedField = (props: EnumeratedFieldProps) => {
  const { def, optChange, parent, children, value = '' } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
  const [selectedValue, setSelectedValue] = useState<Option | string>(value != '' ? { 'label': value, 'value': value } : '');
  var optData: Record<string, any> = {};
  const [idx, name, type, opts, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');

  const handleChange = (e: Option) => {
    // if (hasProperty(optData, 'id') && optData.id) {
    //key should already be id
    if (e == null) {
      setSelectedValue('');
      optChange(name, '')
    } else {
      setSelectedValue(e);
      optChange(name, e.value);
    }
  }

  const typeDefs = schema.types.filter(t => t[0] === type);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : def;
  if (typeDefs.length === 1) {
    optData = (opts2obj(typeDef[2]));
  } else {
    optData = (opts2obj(opts));
  }

  var defOpts: any[] = [];
  if (hasProperty(optData, 'enum')) {
    const typeDefs = schema.types.filter(t => t[0] === optData.enum);
    const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
    defOpts = typeDef[typeDef.length - 1]?.map((opt: any) => ({ value: `${hasProperty(optData, 'id') && optData.id ? opt[0] : opt[1]}`, label: opt[1] }));

  } else if (hasProperty(optData, 'pointer')) {
    const typeDefs = schema.types.filter(t => t[0] === optData.pointer);
    const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
    let optCount = 1;
    typeDef[typeDef.length - 1]?.map((opt: any) => {
      // check for field opt for dir, replace Pointer extension with an Enumerated type containing a JSON Pointer pathname 
      const fieldOptData = (opts2obj(opt[3]));
      if (hasProperty(fieldOptData, 'dir') && fieldOptData.dir) {
        const pointerDefs = schema.types.filter(t => t[0] === opt[2]);
        const pointerDef = pointerDefs.length === 1 ? pointerDefs[0] : [];
        pointerDef[pointerDef.length - 1]?.map((fieldOpt: any) => {
          defOpts.push({ value: `${hasProperty(optData, 'id') && optData.id ? optCount : fieldOpt[1]}`, label: opt[2] + '/' + fieldOpt[1] });
          optCount += 1;
        });

      } else {
        defOpts.push({ value: `${hasProperty(optData, 'id') && optData.id ? optCount : opt[1]}`, label: opt[1] });
      }
      optCount += 1;
    });

  } else {
    defOpts = typeDef[typeDef.length - 1]?.map((opt: any) => ({ value: `${hasProperty(optData, 'id') && optData.id ? opt[0] : opt[1]}`, label: opt[1] }));
  }

  return (
    <div className='form-group'>
      <div className='card'>
        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
          <div>
            <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
            {idx != 0 && comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
          </div>
          {children}
        </div>
        <div className='card-body m-0 p-0'>
          <div className='row'>
            <div className="col">
              <SBSelect id={name} name={name} data={defOpts}
                onChange={handleChange}
                placeholder={`${name} options`}
                value={selectedValue}
                isClearable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnumeratedField;
