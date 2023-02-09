//basic
import React, { useState } from 'react';
import { Button, Input } from 'reactstrap';
import { InputType } from 'reactstrap/types/lib/Input';
import dayjs from 'dayjs'
import { v4 as uuid4 } from 'uuid';

import Field from '..';
import { isOptional } from '../..';
import { StandardFieldArray } from '../../../../schema/interface';

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
  const [_idx, name, type, _opts, comment] = def;
  const msgName = parent ? [parent, name] : [name];

  const [value, setValue] = useState('');

  const inputOpts = (type: string) => {
    const opts: {
      type: InputType;
      placeholder?: string;
    } = {
      type: 'text'
    };
    switch (type) {
      case 'Duration':
        opts.type = 'number';
        opts.placeholder = '0';
        break;
      case 'Date-Time':
        opts.type = 'datetime';
        opts.placeholder = '2000-01-01T00:00:00-00:00';
        break;
      // no default
    }
    return opts;
  };

  const createID = () => {
    const randomID = uuid4();
    setValue(randomID);
    optChange(msgName.join('.'), randomID, arr);
  }

  if (name >= 0) { // name is type if not field    
    return (<Field def={def} parent={msgName.join('.')} optChange={optChange} />);
  }
  const opts = inputOpts(type);
  if (name == 'command_id') {
    return (
      <div className='form-group'>
        <div className='card'>
          <div className='card-header p-2'>
            <Button color='primary' className='float-right' onClick={createID}>Generate ID</Button>
            <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
            {comment ? <small className='card-subtitle text-muted'>{comment}</small> : ''}
          </div>
          <div className='card-body m-0 p-0'>
            <Input
              value={value}
              type={opts.type}
              placeholder={opts.placeholder}
              name={name}
              onChange={e => { setValue(e.target.value); optChange(msgName.join('.'), e.target.value, arr); }}
            />
          </div>
        </div>
      </div>
    );
  } else if (opts.type == 'datetime') {
    return (
      <div className='form-group'>
        <div className='card'>
          <div className='card-header p-2'>
            <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
            <span>{comment ? <small className='card-subtitle text-muted'>{comment}</small> : ''}</span>
          </div>
          <div className='card-body m-0 p-0'>
            <Input
              name={name}
              type="datetime-local"
              step="any"
              min={dayjs().format('YYYY-MM-DD HH:mm:ss')}
              pattern='/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/'
              onChange={e => optChange(msgName.join('.'), dayjs(e.target.value).valueOf(), arr)}
            />
          </div>
        </div>
      </div>
    );

  } else {
    return (
      <div className='form-group'>
        <div className='card'>
          <div className='card-header p-2'>
            <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
            <span>{comment ? <small className='card-subtitle text-muted'>{comment}</small> : ''}</span>
          </div>
          <div className='card-body m-0 p-0'>
            <Input
              type={opts.type}
              placeholder={opts.placeholder}
              name={name}
              onChange={e => optChange(msgName.join('.'), e.target.value, arr)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default BasicField;