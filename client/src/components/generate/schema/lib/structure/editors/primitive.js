import React from 'react';
import {
  Button, ButtonGroup, FormGroup, Input, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

// Primitive Editor
const PrimitiveEditor = (props) => {
  const {
    change, dataIndex, value, remove
  } = props;
  let values = {};

  if (value && typeof(value) === 'object') {
    const [ name, type, options, comment ] = value;
    values = {
      name: name || '',
      type: type || '',
      options: options || [],
      comment: comment || ''
    };
  }

  const removeAll = e => remove(dataIndex);

  const onChange = e => {
    const key = e.target.placeholder.toLowerCase();
    const value = e.target.value;
    if (key === 'options') {
      value = value.split(/,\s+?/);
    }

    values[key] = value;
    change(values, dataIndex);
  };

  return (
    <div className='border m-1 p-1'>
      <ButtonGroup size='sm' className='float-right'>
        <Button color='danger' onClick={ removeAll } >
          <FontAwesomeIcon icon={ faMinusCircle } />
        </Button>
      </ButtonGroup>
      <div className='border-bottom mb-2'>
        <h3 className='col-sm-10 my-1'>
          { values.type }
          &nsbp;-&nsbp;
          { values.name }
        </h3>
      </div>
      <div className='row m-0'>
        <FormGroup className='col-md-4'>
          <Label>Name</Label>
          <Input type="string" placeholder="Name" value={ values.name } onChange={ onChange } />
        </FormGroup>
        <FormGroup className='col-md-4'>
          <Label>Options</Label>
          <Input type="string" placeholder="Options" value={ values.options.join(', ') } onChange={ onChange } />
        </FormGroup>
        <FormGroup className='col-md-4'>
          <Label>Comment</Label>
          <Input type="textarea" placeholder="Comment" rows={ 1 } value={ values.comment } onChange={ onChange } />
        </FormGroup>
      </div>
    </div>
  );
};

PrimitiveEditor.defaultProps = {
  dataIndex: -1,
  values: {
    name: 'name',
    type: 'type',
    options: [],
    comment: ''
  },
  change: (vals, idx) => {
    console.log(vals, idx);
  },
  remove: idx => {
    console.log(idx);
  }
};

export default PrimitiveEditor;
