import React, { useState } from 'react';
import {
  Button, FormGroup, FormText, Input, Label
} from 'reactstrap';
import { InputType } from 'reactstrap/es/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons';
import SBCreatableSelect from 'components/common/SBCreatableSelect';
import SBSelect, { Option } from 'components/common/SBSelect';

// Interface
interface KeyValueEditorProps {
  id: string;
  name: string;
  description?: string;
  placeholder?: string;
  value: boolean | number | string;
  type?: InputType;
  options?: Array<string>; // only for type='select'
  change: (_v: boolean | number | string) => void;
  remove: (_id: string | number) => void;
  required: boolean;
}

// Key Value Editor
const KeyValueEditor = (props: KeyValueEditorProps) => {
  const { name, value, description, options, placeholder, type, change, remove, required } = props;
  const [val, setVal] = useState(value ? { value: value, label: value } : '');
  const onSelectChange = (e: Option) => {
    if (e == null) {
      setVal('');
      change('');
    } else {
      setVal(e);
      change(e.value);
    }
  }

  if (type === 'SBCreatableSelect' && options) {
    return (
      <FormGroup row className="border m-1 p-1">
        <Label htmlFor={`editor-${placeholder}`} sm={2} ><strong>{placeholder}{required ? '*' : ''}</strong></Label>
        <div className="input-group col-sm-10">
          <SBCreatableSelect id={`editor-${placeholder}`}
            placeholder={`Please select a ${placeholder}...`}
            data={options}
            onChange={onSelectChange}
            value={val}
            isGrouped={Array.isArray(options) ? false : true}
          />
          {remove ?
            <div className="input-group-append">
              <Button color='danger' onClick={() => remove(name.toLowerCase())}>
                <FontAwesomeIcon icon={faMinusSquare} />
              </Button>
            </div> : ''}
        </div>
        {description ? <FormText color='muted' className='ml-3'>{description}</FormText> : ''}
      </FormGroup>
    );
  }

  if (type === 'SBSelect' && options) {
    console.log(options)
    return (
      <FormGroup row className="border m-1 p-1">
        <Label htmlFor={`editor-${placeholder}`} sm={2} ><strong>{placeholder}{required ? '*' : ''}</strong></Label>
        <div className="input-group col-sm-10">
          <SBSelect id={`editor-${placeholder}`}
            placeholder={`Please select a ${placeholder}...`}
            data={options}
            onChange={onSelectChange}
            value={val}
            isGrouped={Array.isArray(options) ? false : true}
          />
          {remove ?
            <div className="input-group-append">
              <Button color='danger' onClick={() => remove(name.toLowerCase())}>
                <FontAwesomeIcon icon={faMinusSquare} />
              </Button>
            </div> : ''}
        </div>
        {description ? <FormText color='muted' className='ml-3'>{description}</FormText> : ''}
      </FormGroup>
    );
  }

  const shadowless: Array<InputType> = [
    'checkbox', 'file', 'hidden', 'image', 'radio'
  ];

  const inputArgs: Record<string, any> = {
    value,
    checked: type && value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => change(e.target.value)
  };

  if (['checkbox', 'radio'].includes(type)) {
    inputArgs.onChange = (e: React.ChangeEvent<HTMLInputElement>) => change(e.target.checked);
  }

  return (
    <FormGroup row className="border m-1 p-1">
      <Label htmlFor={`editor-${placeholder}`} sm={2} ><strong>{placeholder}{required ? '*' : ''}</strong></Label>
      <div className="input-group col-sm-10">
        <Input
          type={type}
          id={`editor-${placeholder}`}
          className={`form-control ${shadowless.includes(type) ? ' shadow-none' : ''}`}
          placeholder={placeholder}
          {...inputArgs}
        />
        {remove ?
          <div className="input-group-append">
            <Button color='danger' onClick={() => remove(name.toLowerCase())}>
              <FontAwesomeIcon icon={faMinusSquare} />
            </Button>
          </div> : ''}
      </div>
      {description ? <FormText color='muted' className='ml-3'>{description}</FormText> : ''}
    </FormGroup>
  );
};

KeyValueEditor.defaultProps = {
  description: '',
  options: [],
  placeholder: 'KeyValueEditor',
  type: 'text' as InputType
};

export default KeyValueEditor;
