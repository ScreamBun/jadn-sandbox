import React from 'react';
import {
  Button, FormGroup, Input, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons';

// Key Value Editor
const KeyValueEditor = (props) => {
  const {
    change, id, placeholder, remove, value
  } = props;
  return (
    <FormGroup row className='border m-1 p-1'>
      <Label for={ `editor-${id}` } sm={ 2 } ><strong>{ id }</strong></Label>
      <div className="input-group col-sm-10">
        <Input
          type="text"
          id={ `editor-${id}` }
          className="form-control"
          placeholder={ placeholder }
          value={ value }
          onChange={ e => change(e.target.value) }
        />
        <div className="input-group-append">
          <Button color='danger' onClick={ () => remove(id.toLowerCase()) }>
            <FontAwesomeIcon icon={ faMinusSquare } />
          </Button>
        </div>
      </div>
    </FormGroup>
  );
};

KeyValueEditor.defaultProps = {
  id: 'KeyValueEditor',
  placeholder: 'KeyValueEditor',
  value: '',
  change: val => {
    console.log(val);
  },
  remove: id => {
    console.log(id);
  }
};

export default KeyValueEditor;