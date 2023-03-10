import React from 'react';
import {
  Button, FormGroup, FormText, Input, Label
} from 'reactstrap';
import { InputType } from 'reactstrap/es/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons';

// Interface
interface KeyValueEditorProps {
  name: string;
  description?: string;
  placeholder?: string;
  value: boolean | number | string;
  type?: InputType;
  options?: Array<string>; // only for type='select'
  change: (_v: boolean | number | string) => void;
  remove: (_id: string | number) => void;
}

// Key Value Editor
const KeyValueEditor = (props: KeyValueEditorProps) => {
  const {
    name, value, description, options, placeholder, type, change, remove
  } = props;

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

  if (type === 'select' && options) {
    inputArgs.children = options.map(opt => <option key={opt} value={opt} >{opt}</option>);
  }

  return (
    <FormGroup row className="border m-1 p-1">
      <Label htmlFor={`editor-${placeholder}`} sm={2} ><strong>{placeholder}</strong></Label>
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
