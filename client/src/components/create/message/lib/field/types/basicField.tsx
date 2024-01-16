//basic
import React, { useState } from 'react';
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
  children?: JSX.Element;
  value: any;
}

// Component
const BasicField = (props: BasicFieldProps) => {

  const { arr, def, optChange, parent, config, children, value = '' } = props;
  const [idx, name, type, opts, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');
  const [data, setData] = useState(value);

  var optData: Record<string, any> = {};
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
  const typeDefs = schema.types ? schema.types.filter(t => t[0] === type) : [];
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  if (typeDef.length != 0) {
    optData = (opts2obj(typeDef[2]));
  } else {
    optData = (opts ? opts2obj(opts) : []);
  }

  if (hasProperty(optData, 'default') && value == '') {
    setData(optData.default);
  }

  let dataType;
  if (typeDefs.length === 1) {
    dataType = typeDef[1].toLowerCase();
  } else {
    dataType = type ? type.toLowerCase() : type;
  }

  const [errMsg, setErrMsg] = useState<string[]>([]);

  const err = errMsg.map((msg, index) =>
    <div key={index}><small className='form-text' style={{ color: 'red' }}>{msg}</small></div>
  );

  if (name >= 0) { // name is type if not field    
    return (<Field key={def[1]} def={def} parent={msgName} optChange={optChange} config={config} value={value} children={children} />);
  }

  if (hasProperty(optData, 'format')) {
    return (<FormattedField
      basicProps={props} optData={optData}
      errMsg={errMsg} setErrMsg={setErrMsg} config={config} value={value} children={children}
    />);
  }

  if (dataType) {
    if (dataType == 'boolean') {
      return (
        <div className='form-group m-3'>
          <div className='card'>
            <div className='card-header p-4 d-flex justify-content-between'>
              <div>
                <label htmlFor={`checkbox-${idx}`} className="custom-control-label">
                  <input
                    id={`checkbox-${idx}`}
                    type='checkbox'
                    name={name}
                    value={data}
                    checked={data}
                    onChange={e => {
                      setData(e.target.checked);
                      optChange(name, e.target.checked, arr);
                    }}
                    style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                  />
                  <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                  {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                </label>
                {err}
              </div>
              {children}
            </div>
          </div>
        </div>
      );
    }

    if (dataType == 'binary') {
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
              <input
                type='text'
                name={name}
                value={data}
                onBlur={e => {
                  //encode into base64 for valid JSON
                  const encoded = Buffer.from(e.target.value, "utf8").toString('base64');
                  const errCheck = validateOptDataBinary(config, optData, encoded);
                  setErrMsg(errCheck);
                  optChange(name, encoded, arr);
                }}
                onChange={e => {
                  setData(e.target.value);
                }}
                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
              />
            </div>
            {err}
          </div>
        </div>
      );
    }

    if (dataType == 'number') {
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
              <input
                type='number'
                onWheel={(e) => { e.target.blur(); }}
                step='any'
                name={name}
                value={data}
                onChange={e => {
                  setData(e.target.value);
                }}
                onBlur={e => {
                  const errCheck = validateOptDataNum(optData, parseInt(e.target.value));
                  setErrMsg(errCheck);
                  optChange(name, parseInt(e.target.value), arr);
                }}
                onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
              />
            </div>
            {err}
          </div>
        </div>
      );
    }

    if (dataType == 'integer') {
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
              <input
                type='number'
                onWheel={(e) => { e.target.blur(); }}
                name={name}
                value={data}
                onChange={e => {
                  setData(e.target.value);
                }}
                onBlur={e => {
                  const errCheck = validateOptDataNum(optData, parseInt(e.target.value));
                  setErrMsg(errCheck);
                  optChange(name, parseInt(e.target.value), arr);
                }}
                onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
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
        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
          <div>
            <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
            {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
          </div>
          {children}
        </div>
        <div className='card-body m-0 p-0'>
          <input
            type='text'
            name={name}
            value={data}
            placeholder={optData.pattern ? optData.pattern : ''}
            onChange={e => {
              setData(e.target.value);
            }}
            onBlur={e => {
              const errCheck = validateOptDataStr(config, optData, e.target.value);
              setErrMsg(errCheck);
              optChange(name, e.target.value, arr);
            }}
            style={{ borderColor: errMsg.length != 0 ? 'red' : '' }} />
        </div>
        {err}
      </div>
    </div>
  );
}

export default BasicField;