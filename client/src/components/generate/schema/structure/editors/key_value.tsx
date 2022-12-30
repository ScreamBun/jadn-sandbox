import React, { ChangeEvent, FunctionComponent } from 'react';
import {
  Button, FormGroup, FormText, Input, Label
} from 'reactstrap';
import { InputType } from 'reactstrap/es/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons';

// Interface
interface KeyValueEditorProps {
  name: string;
  value: boolean|number|string;
  description?: string;
  options?: Array<string>; // only for type='select'
  placeholder?: string;
  type?: InputType;
  change: (_v: boolean|number|string) => void;
  remove: (_id: string) => void;
}

const defaultProps = {
  description: '',
  options: [],
  placeholder: 'KeyValueEditor',
  type: 'text' as InputType
};

// Key Value Editor
const KeyValueEditor: FunctionComponent<KeyValueEditorProps> = props => {
  const {
    name, value, description, options, placeholder, type, change, remove
  } = {...defaultProps, ...props};

  const shadowless: Array<InputType> = [
    'checkbox', 'file', 'hidden', 'image', 'radio'
  ];

  const inputArgs: Record<string, any> = {
    value,
    checked: type && value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => change(e.target.value)
  };

  if (['checkbox', 'radio'].includes(type)) {
    inputArgs.onChange = (e: ChangeEvent<HTMLInputElement>) => change(e.target.checked);
  }

  if (type === 'select' && options) {
    inputArgs.children = options.map(opt => <option key={ opt } value={ opt } >{ opt }</option>);
  }

  let removeBtn: JSX.Element|undefined;
  if (remove) {
    removeBtn = (
      <div className="input-group-append">
        <Button color='danger' onClick={ () => remove(name.toLowerCase()) }>
          <FontAwesomeIcon icon={ faMinusSquare } />
        </Button>
      </div>
    );
  }

  return (
    <FormGroup row className="border m-1 p-1">
      <Label htmlFor={ `editor-${name}` } sm={ 2 } ><strong>{ name }</strong></Label>
      <div className="input-group col-sm-10">
        <Input
          type={ type }
          id={ `editor-${name}` }
          className={ `form-control ${shadowless.includes(type) ? ' shadow-none' : ''}` }
          placeholder={ placeholder }
          { ...inputArgs }
        />
        { removeBtn }
      </div>
      { description ? <FormText color='muted' className='ml-3'>{ description }</FormText> : '' }
    </FormGroup>
  );
};

KeyValueEditor.defaultProps = defaultProps;

export default KeyValueEditor;
