//basic
import React, { useState } from 'react';
import { Button, Input, Label } from 'reactstrap';
import dayjs from 'dayjs'
import { v4 as uuid4 } from 'uuid';

import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { useAppSelector } from 'reducers';
import { validateOptData } from '../../utils';
import { hasProperty } from 'react-json-editor/dist/utils';

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
  const typeDefName = typeDefs.length === 1 ? typeDefs[0][0] : 'text';
  let typeDef = typeDefs.length === 1 ? typeDefs[0][1] : 'text';
  if (typeDef) {
    optData = (opts2obj(opts));
  }

  const [value, setValue] = useState('');
  const [isValid, setisValid] = useState<{ color: string, msg: string[] }>({
    color: '',
    msg: []
  });

  const createID = () => {
    const randomID = uuid4();
    setValue(randomID);
    optChange(msgName.join('.'), randomID, arr);
  }

  let err: any[] = [];
  (isValid.msg).forEach(msg => {
    err.push(<div><small className='form-text' style={{ color: 'red' }}> {msg}</small></div>)
  });

  if (name >= 0) { // name is type if not field    
    return (<Field def={def} parent={msgName.join('.')} optChange={optChange} />);
  }

  //NOTE this is OC2 specific 
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
              onChange={e => {
                setValue(e.target.value);
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

  //MOVE to integer/numeric --- NOTE this is OC2 specific --- changes to milliseconds
  if (typeDefName.toLowerCase() == 'date-time') {
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
              onChange={e => {
                const validMsg = validateOptData(optData, dayjs(e.target.value).valueOf());
                setisValid(validMsg);
                optChange(msgName.join('.'), dayjs(e.target.value).valueOf(), arr);
              }}
            />
          </div>
          {err}
        </div>
      </div>
    );
  }

  if (typeDef.toLowerCase() == 'boolean') {
    return (
      <div className='form-group'>
        <Label check>
          <Input
            type={'checkbox'}
            name={name}
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

  if (typeDef.toLowerCase() == 'binary') {
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
              defaultValue={hasProperty(optData, 'default') ? optData.default : ''}
              placeholder={optData.format ? optData.format : ''}
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

  if (typeDef.toLowerCase() == 'number' || typeDef.toLowerCase() == 'integer') {
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