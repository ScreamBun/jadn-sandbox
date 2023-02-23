//basic
import React, { useState } from 'react';
import { Button, Input } from 'reactstrap';
import dayjs from 'dayjs'
import { v4 as uuid4 } from 'uuid';

import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { opts2obj } from 'components/generate/schema/structure/editors/options/consts';
import { hasProperty } from '../../../../../utils';
import { useAppSelector } from 'reducers';

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
  optData = (opts2obj(opts));

  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
  const typeDefs = schema.types.filter(t => t[0] === type);
  const typeDefName = typeDefs.length === 1 ? typeDefs[0][0] : 'text';
  let typeDef = typeDefs.length === 1 ? typeDefs[0][1] : 'text';
  typeDef == 'Integer' ? typeDef = 'number' : typeDef = typeDef.toLowerCase();

  const [value, setValue] = useState('');
  const [isValid, setisValid] = useState({
    color: '',
    msg: []
  })

  const createID = () => {
    const randomID = uuid4();
    setValue(randomID);
    optChange(msgName.join('.'), randomID, arr);
  }

  const validate = (data: any) => {
    let valc = '';
    let valm = [];
    if (optData && data) {
      if (hasProperty(optData, 'minf')) {
        if (data < optData.minf) {
          valc = 'red';
          valm.push('Minf Error: must be more than ' + optData.minf);
        }
      }
      if (hasProperty(optData, 'maxf')) {
        if (data > optData.maxf) {
          valc = 'red';
          valm.push('Maxf Error: must be less than ' + optData.maxf);
        }
      }
      if (hasProperty(optData, 'minv')) {
        if (typeof data == 'string') {
          if (data.length < optData.minv) {
            valc = 'red';
            valm.push('Minv Error: must be more than ' + optData.minv);
          }
        } else {
          if (data < optData.minv) {
            valc = 'red';
            valm.push('Minv Error: must be more than' + optData.minv);
          }
        }
      }
      if (hasProperty(optData, 'maxv')) {
        if (typeof data == 'string') {
          if (data.length > optData.maxv) {
            valc = 'red';
            valm.push('Maxv Error: must be less than ' + optData.maxv);
          }
        } else {
          if (data > optData.maxv) {
            valc = 'red';
            valm.push('Maxv Error: must be less than ' + optData.maxv);
          }
        }
      }
      if (hasProperty(optData, 'pattern')) {
        if (!optData.pattern.test(data)) {
          valc = 'red';
          valm.push('Pattern Error: must match ' + optData.pattern);
        }
      }
    }
    setisValid({ color: valc, msg: valm });
  }

  let err: any[] = [];
  (isValid.msg).forEach(msg => {
    err.push(<div><small className='form-text' style={{ color: 'red' }}> {msg}</small></div>)
  });

  if (name >= 0) { // name is type if not field    
    return (<Field def={def} parent={msgName.join('.')} optChange={optChange} />);
  }
  if (name == 'command_id') {
    return (
      <div className='form-group'>
        <div className='card'>
          <div className='card-header p-2'>
            <Button color='primary' className='float-right' onClick={createID}>Generate ID</Button>
            <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
            {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
          </div>
          <div className='card-body m-0 p-0'>
            <Input
              value={value}
              type={typeDef}
              name={name}
              onChange={e => { setValue(e.target.value); validate(e.target.value); optChange(msgName.join('.'), e.target.value, arr); }}
            />
          </div>
          {err}
        </div>
      </div>
    );
  } else if (typeDefName == 'Date-Time') {
    return (
      <div className='form-group'>
        <div className='card'>
          <div className='card-header p-2'>
            <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
            {comment ? <small className='card-subtitle form-text  text-muted'>{comment}</small> : ''}
          </div>
          <div className='card-body m-0 p-0'>
            <Input
              name={name}
              type="datetime-local"
              step="any"
              min={dayjs().format('YYYY-MM-DD HH:mm:ss')}
              pattern='/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/'
              onChange={e => { validate(dayjs(e.target.value).valueOf()); optChange(msgName.join('.'), dayjs(e.target.value).valueOf(), arr); }}
            />
          </div>
          {err}
        </div>
      </div>
    );

  } else if (typeDef == 'number') {
    return (
      <div className='form-group'>
        <div className='card'>
          <div className='card-header p-2'>
            <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
            {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
          </div>
          <div className='card-body m-0 p-0'>
            <Input
              type={typeDef}
              name={name}
              onChange={e => { validate(e.target.value); optChange(msgName.join('.'), e.target.value, arr); }}
            />
          </div>
          {err}
        </div>
      </div>
    );

  } else {
    return (
      <div className='form-group'>
        <div className='card'>
          <div className='card-header p-2'>
            <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
            {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
          </div>
          <div className='card-body m-0 p-0'>
            <Input
              type={typeDef}
              name={name}
              onChange={e => { validate(e.target.value); optChange(msgName.join('.'), e.target.value, arr); }}
              style={{ borderColor: isValid.color }}
            />
          </div>
          {err}
        </div>
      </div>
    );
  }
}

export default BasicField;