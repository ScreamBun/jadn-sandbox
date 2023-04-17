//basic
import React, { useState } from 'react';
import { Input, Label } from 'reactstrap';

import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { SchemaJADN, StandardFieldArray, TypeArray } from '../../../../schema/interface';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { useAppSelector } from 'reducers';
import { validateOptData } from '../../utils';
import { hasProperty } from 'react-json-editor/dist/utils';
import { FormattedField } from './Types';

// Interface
interface BasicFieldProps {
  arr?: any;
  def: StandardFieldArray;
  optChange: (n: string, v: any, i?: number) => void;
  parent?: string;
}

// Component
const BasicField = (props: BasicFieldProps) => {

  const { arr, def, optChange, parent } = props;
  const [_idx, name, type, opts, comment] = def;
  const msgName = parent ? [parent, name] : [name];
  var optData: Record<string, any> = {};

  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
  const typeDefs = schema.types.filter(t => t[0] === type);
  let typeDef = typeDefs.length === 1 ? typeDefs[0] : def;
  if (typeDefs.length === 1) {
    optData = (opts2obj(typeDef[2]));
  } else {
    optData = (opts2obj(opts));
  }

  const [isValid, setisValid] = useState<{ color: string, msg: string[] }>({
    color: '',
    msg: []
  });

  let err: any[] = [];
  (isValid.msg).forEach(msg => {
    err.push(<div><small className='form-text' style={{ color: 'red' }}> {msg}</small></div>)
  });

  if (name >= 0) { // name is type if not field    
    return (<Field def={def} parent={msgName.join('.')} optChange={optChange} />);
  }

  if (hasProperty(optData, 'format')) {
    return (<FormattedField
      basicProps={props} optData={optData}
      isValid={isValid} setisValid={setisValid}
      err={err} />);
  }

  if (typeDef[1].toLowerCase() == 'boolean') {
    return (
      <div className='form-group'>
        <Label check>
          <Input
            type={'checkbox'}
            name={name}
            defaultValue={hasProperty(optData, 'default') ? optData.default : ''}
            onChange={e => {
              const validMsg = validateOptData(optData, e.target.value);
              setisValid(validMsg);
              optChange(msgName.join('.'), e.target.checked, arr);
            }}
          />
          <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
          {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
        </Label>
        {err}
      </div>
    );
  }

  //TODO: Binary minv/maxv check
  if (typeDef[1].toLowerCase() == 'binary') {
    return (
      <div className='form-group'>
        <div className='card'>
          <div className='card-header p-2'>
            <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
            {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
          </div>
          <div className='card-body m-0 p-0'>
            <Input
              type={typeDef[1]}
              name={name}
              defaultValue={hasProperty(optData, 'default') ? optData.default : ''}
              onChange={e => {
                if (e.target.value.match(/^[0-1]{1,}$/g)) {
                  const validMsg = validateOptData(optData, e.target.value);
                  setisValid(validMsg);
                  optChange(msgName.join('.'), e.target.value, arr);
                } else {
                  if (e.target.value != '') {
                    //validation: only allow 1 and 0 input
                    setisValid(validMsg => ({
                      color: 'red',
                      msg: [...validMsg.msg,
                      validMsg.msg.includes("Error: Invalid Binary value") ? '' :
                        "Error: Invalid Binary value"]
                    }))
                  }
                  optChange(msgName.join('.'), '', arr);
                }
              }}
              style={{ borderColor: isValid.color }}
            />
          </div>
          {err}
        </div>
      </div>
    );
  }

  if (typeDef[1].toLowerCase() == 'number' || typeDef[1].toLowerCase() == 'integer') {
    return (
      <div className='form-group'>
        <div className='card'>
          <div className='card-header p-2'>
            <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
            {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
          </div>
          <div className='card-body m-0 p-0'>
            <Input
              type={'number'}
              step='any'
              name={name}
              defaultValue={hasProperty(optData, 'default') ? optData.default : ''}
              placeholder={optData.format ? optData.format : ''}
              onChange={e => {
                const validMsg = validateOptData(optData, e.target.value);
                setisValid(validMsg);
                optChange(msgName.join('.'), e.target.value, arr);
              }}
            />
          </div>
          {err}
        </div>
      </div>
    );
  }

  //pattern can also be placeholder?
  return (
    <div className='form-group'>
      <div className='card'>
        <div className='card-header p-2'>
          <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
          {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
        </div>
        <div className='card-body m-0 p-0'>
          <Input
            type={typeDef[1]}
            name={name}
            defaultValue={hasProperty(optData, 'default') ? optData.default : ''}
            placeholder={optData.format ? optData.format : ''}
            onChange={e => {
              const validMsg = validateOptData(optData, e.target.value);
              setisValid(validMsg);
              optChange(msgName.join('.'), e.target.value, arr);
            }}
            style={{ borderColor: isValid.color }}
          />
        </div>
        {err}
      </div>
    </div>
  );

}

export default BasicField;