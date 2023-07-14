//basic
import React, { useState } from 'react';
import { Input, Label } from 'reactstrap';

import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { InfoConfig, SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { useAppSelector } from 'reducers';
import { validateOptDataNum, validateOptDataBinary, validateOptDataStr } from '../../utils';
import { hasProperty } from 'components/utils';
import { FormattedField } from './Types';
import { Buffer } from 'buffer';

// Interface
interface BasicFieldProps {
  arr?: any;
  def: StandardFieldArray;
  optChange: (n: string, v: any, i?: number) => void;
  parent?: string;
  config: InfoConfig;
}

// Component
const BasicField = (props: BasicFieldProps) => {

  const { arr, def, optChange, parent, config } = props;
  var [_idx, name, type, opts, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');

  var optData: Record<string, any> = {};
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
  const typeDefs = schema.types.filter(t => t[0] === type);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  if (typeDef.length != 0) {
    optData = (opts2obj(typeDef[2]));
    type = typeDef[1];
  } else {
    optData = (opts2obj(opts));
  }

  const [errMsg, setErrMsg] = useState<string[]>([]);

  const err = errMsg.map((msg, index) =>
    <div key={index}><small className='form-text' style={{ color: 'red' }}>{msg}</small></div>
  );

  if (name >= 0) { // name is type if not field    
    return (<Field key={def[1]} def={def} parent={msgName} optChange={optChange} config={config} />);
  }

  if (hasProperty(optData, 'format')) {
    return (<FormattedField
      basicProps={props} optData={optData}
      errMsg={errMsg} setErrMsg={setErrMsg} config={config}
    />);
  }

  if (type) {
    if (type.toLowerCase() == 'boolean') {
      return (
        <div className='form-group m-3'>
          <Label check>
            <Input
              type={'checkbox'}
              name={name}
              defaultValue={hasProperty(optData, 'default') ? optData.default : ''}
              onChange={e => {
                optChange(msgName, e.target.checked, arr);
              }}
              style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
            />
            <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
            {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
          </Label>
          {err}
        </div>
      );
    }

    if (type.toLowerCase() == 'binary') {
      return (
        <div className='form-group'>
          <div className='card'>
            <div className='card-header p-2'>
              <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
              {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
            </div>
            <div className='card-body m-0 p-0'>
              <Input
                type={'text'}
                name={name}
                defaultValue={hasProperty(optData, 'default') ? optData.default : ''}
                onChange={e => {
                  //encode into base64 for valid JSON
                  const encoded = Buffer.from(e.target.value, "utf8").toString('base64');
                  const errCheck = validateOptDataBinary(config, optData, encoded);
                  setErrMsg(errCheck);
                  optChange(msgName, encoded, arr);
                }}
                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
              />
            </div>
            {err}
          </div>
        </div>
      );
    }

    if (type.toLowerCase() == 'number') {
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
                onChange={e => {
                  const errCheck = validateOptDataNum(optData, parseInt(e.target.value));
                  setErrMsg(errCheck);
                  optChange(msgName, parseInt(e.target.value), arr);
                }}
                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
              />
            </div>
            {err}
          </div>
        </div>
      );
    }

    if (type.toLowerCase() == 'integer') {
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
                name={name}
                defaultValue={hasProperty(optData, 'default') ? optData.default : ''}
                onChange={e => {
                  const errCheck = validateOptDataNum(optData, parseInt(e.target.value));
                  setErrMsg(errCheck);
                  optChange(msgName, parseInt(e.target.value), arr);
                }}
                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
              />
            </div>
            {err}
          </div>
        </div>
      );
    }
  }

  //DEFAULT: STRING 
  return (
    <div className='form-group'>
      <div className='card'>
        <div className='card-header p-2'>
          <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
          {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
        </div>
        <div className='card-body m-0 p-0'>
          <Input
            type={'text'}
            name={name}
            defaultValue={hasProperty(optData, 'default') ? optData.default : ''}
            placeholder={optData.pattern ? optData.pattern : ''}
            onChange={e => {
              const errCheck = validateOptDataStr(config, optData, e.target.value);
              setErrMsg(errCheck);
              optChange(msgName, e.target.value, arr);
            }}
            style={{ borderColor: errMsg.length != 0 ? 'red' : '' }} />
        </div>
        {err}
      </div>
    </div>
  );
}

export default BasicField;