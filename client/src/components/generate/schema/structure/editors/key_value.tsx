import React, { ChangeEvent, FunctionComponent } from 'react';
import {
  Button, FormGroup, FormText, Input, Label
} from 'reactstrap';
import { InputType } from 'reactstrap/types/lib/Input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons';


interface KeyValueEditorProps {
  key?: number|string|undefined; 
  name: string;
  value: boolean|number|string;
  description?: string;
  options?: Array<string>;
  placeholder?: string;
  type?: InputType;
  removable?: boolean;
  change?: (_a: boolean|number|string) => void;
  remove?: (_id: string) => void;
}

const defaultProps = {
  description: '',
  options: [],
  placeholder: 'KeyValueEditor',
  type: 'text' as InputType
};


const KeyValueEditor: FunctionComponent<KeyValueEditorProps> = props => {
  const {
    name, value, description, options, placeholder, type, change, remove
  } = {...defaultProps, ...props};

  const inputArgs: Record<string, any> = {
    value,
    checked: type && value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      if(change){
        change(e.target.value)
      }
    }
  };

  if (['checkbox', 'radio'].includes(type)) {
    inputArgs.onChange = (e: ChangeEvent<HTMLInputElement>) => {
      if(change){
        change(e.target.checked)
      }      
    };
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
          className={ `form-control` }
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
