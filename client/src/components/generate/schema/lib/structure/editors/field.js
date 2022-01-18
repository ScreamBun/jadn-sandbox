import React from 'react';
import {
  Button, ButtonGroup, FormGroup, Input, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

export const StandardField = {
  id: 1,
  name: 'name',
  type: '',
  options: [],
  comment: ''
};

export const EnumeratedField = {
  id: 1,
  value: 'value',
  comment: ''
};

// Field Editor
const FieldEditor = props => {
  const {
    dataIndex, enumerated, remove, value
  } = props;
  const values = {};

  if (value && typeof(value) === 'object') {
    values.id = value[0] || 0;

    if (enumerated) {
      values.value = value[1] || '';
      values.comment = value[2] || '';
    } else {
      values.name = value[1] || '';
      values.type = value[2] || '';
      values.options = value[3] || [];
      values.comment = value[4] || '';
    }
  }

  let removeAll = e => remove(dataIndex);

  let onChange = e => {
    const { change } = props;
    const { placeholder, value } = e.target;
    const key = placeholder.toLowerCase();
    let val = value;
    if (key === 'options') {
      val = value.split(/,\s+?/);
    }

    values[key] = value;
    if (change) {
      const tmpVals = Object.values(values);
      tmpVals[0] = Number(tmpVals[0]);
      change(tmpVals, dataIndex);
    }
  };

  return (
    <div className='col-sm-12 border m-1 p-1'>
      <ButtonGroup size='sm' className='float-right'>
        <Button color='danger' onClick={ removeAll } >
          <FontAwesomeIcon icon={ faMinusCircle } />
        </Button>
      </ButtonGroup>
      <div className='border-bottom mb-2'>
        <p className='col-sm-4 my-1'><strong>{ enumerated ? values.value : values.name }</strong></p>
      </div>
      <div className='row m-0'>
        <FormGroup className={ enumerated ? 'col-md-4' : 'col-md-3' }>
          <Label>ID</Label>
          <Input type='string' placeholder='ID' value={ values.id } onChange={ onChange } />
        </FormGroup>
        {
          enumerated ? (
            <FormGroup className='col-md-4'>
              <Label>Value</Label>
              <Input type='string' placeholder='Value' value={ values.value } onChange={ onChange } />
            </FormGroup>
          ) : (
            <div className='col-md-9 p-0 m-0'>
              <FormGroup className='col-md-4 d-inline-block'>
                <Label>Name</Label>
                <Input type='string' placeholder='Name' value={ values.name } onChange={ onChange } />
              </FormGroup>
              <FormGroup className='col-md-4 d-inline-block'>
                <Label>Type</Label>
                <Input type='string' placeholder='Type' value={ values.type } onChange={ onChange } />
              </FormGroup>
              <FormGroup className='col-md-4 d-inline-block'>
                <Label>Options</Label>
                <Input type='string' placeholder='Options' value={ values.options.join(', ') } onChange={ onChange } />
              </FormGroup>
            </div>
          )
        }
        <FormGroup className={ enumerated ? 'col-md-4' : 'col-md-12' }>
          <Label>Comment</Label>
          <Input type='textarea' placeholder='Comment' rows={ 1 } value={ values.comment } onChange={ onChange } />
        </FormGroup>
      </div>
    </div>
  );
};

FieldEditor.defaultProps = {
  enumerated: false,
  dataIndex: -1,
  values: [],
  change: (vals, idx) => {
    console.log(vals, idx);
  },
  remove: idx => {
    console.log(idx);
  }
};

export default FieldEditor;