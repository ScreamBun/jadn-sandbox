//basic
import React, { useState } from 'react';
import { Input, Label } from 'reactstrap';

import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { useAppSelector } from 'reducers';
import { validateOptData, validateOptDataBinary } from '../../utils';
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
  let baseType: string;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
  const typeDefs = schema.types.filter(t => t[0] === type);
  let typeDef = typeDefs.length === 1 ? typeDefs[0] : def;
  if (typeDefs.length === 1) {     //primitive field
    optData = (opts2obj(typeDef[2]));
    baseType = typeDef[1];
  } else {     //structured field
    optData = (opts2obj(opts));
    baseType = type;
  }

  const [errMsg, setErrMsg] = useState<{ color: string, msg: string[] }>({
    color: '',
    msg: []
  });
  let err: any[] = [];
  (errMsg.msg).forEach(msg => {
    err.push(<div><small className='form-text' style={{ color: 'red' }}> {msg}</small></div>)
  });

  if (name >= 0) { // name is type if not field    
    return (<Field key={def[1]} def={def} parent={msgName.join('.')} optChange={optChange} />);
  }

  /*   if (hasProperty(optData, 'format')) {
      return (<FormattedField
        basicProps={props} optData={optData}
        errMsg={errMsg} setErrMsg={setErrMsg}
        err={err} />);
    }
   */
  if (baseType.toLowerCase() == 'boolean') {
    return (
      <div className='form-group'>
        <Label check>
          <Input
            type={'checkbox'}
            name={name}
            defaultValue={hasProperty(optData, 'default') ? optData.default : ''}
            onChange={e => {
              optChange(msgName.join('.'), e.target.checked, arr);
            }}
            style={{ borderColor: errMsg.color }}
          />
          <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
          {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
        </Label>
        {err}
      </div>
    );
  }

  //TODO: Binary minv/maxv check
  if (baseType.toLowerCase() == 'binary') {
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
                console.log(optData.format)
                const errCheck = validateOptDataBinary(optData, e.target.value);
                setErrMsg(errCheck);
                optChange(msgName.join('.'), e.target.value, arr);
              }}
              style={{ borderColor: errMsg.color }}
            />
          </div>
          {err}
        </div>
      </div>
    );
  }

  if (baseType.toLowerCase() == 'number') {
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
                const errCheck = validateOptData(optData, e.target.value, 'number');
                setErrMsg(errCheck);
                optChange(msgName.join('.'), e.target.value, arr);
              }}
              style={{ borderColor: errMsg.color }}
            />
          </div>
          {err}
        </div>
      </div>
    );
  }


  if (baseType.toLowerCase() == 'integer') {
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
                const errCheck = validateOptData(optData, e.target.value, 'integer');
                setErrMsg(errCheck);
                optChange(msgName.join('.'), e.target.value, arr);
              }}
              style={{ borderColor: errMsg.color }}
            />
          </div>
          {err}
        </div>
      </div>
    );
  }

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
              const errCheck = validateOptData(optData, e.target.value, 'string');
              setErrMsg(errCheck);
              optChange(msgName.join('.'), e.target.value, arr);
            }}
            style={{ borderColor: errMsg.color }} />
        </div>
        {err}
      </div>
    </div>
  );

}

export default BasicField;