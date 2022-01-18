import React from 'react';
import { Button, ButtonGroup, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

// Key Array Editor
const KeyArrayEditor = (props) => {
  const {
    change, id, placeholder, remove, value
  } = props;

  const removeAll = _e => remove(id.toLowerCase());

  const removeIndex = e => {
    if (value.length > 1) {
      const index = e.currentTarget.attributes.getNamedItem('data-index').value;
      const tmpValues = [ ...value ];
      tmpValues.splice(index, 1);
      change(tmpValues);
    }
  };

  const addIndex = () => change([ ...value, '' ]);

  const onChange = e => {
    const { attributes } = e.target;
    const index = attributes.getNamedItem('data-index').value;
    const tmpValues = [ ...value ];
    tmpValues[index] = e.target.value;
    change(tmpValues);
  };

  const indices = value.map((arr, i) => (
    <div className="input-group col-sm-12 mb-1" key={ i }>
      <Input
        type="text"
        className="form-control"
        data-index={ i }
        placeholder={ placeholder }
        value={ arr }
        onChange={ onChange }
      />
      <div className="input-group-append">
        <Button color='danger' onClick={ removeIndex } data-index={ i }>
          <FontAwesomeIcon icon={ faMinusSquare } />
        </Button>
      </div>
    </div>
  ));

  return (
    <div className='border m-1 p-1'>
      <ButtonGroup size='sm' className='float-right'>
        <Button color='info' onClick={ addIndex } >
          <FontAwesomeIcon icon={ faPlusSquare } />
        </Button>
        <Button color='danger' onClick={ removeAll } >
          <FontAwesomeIcon icon={ faMinusCircle } />
        </Button>
      </ButtonGroup>
      <div className='border-bottom mb-2'>
        <p className='col-sm-4 my-1'><strong>{ id }</strong></p>
      </div>
      <div className='row m-0 indices'>
        { indices }
      </div>
    </div>
  );
};

KeyArrayEditor.defaultProps = {
  id: 'KeyValueEditor',
  placeholder: 'KeyValueEditor',
  value: {},
  change: (val) => {
    console.log(val);
  },
  remove: (id) => {
    console.log(id);
  }
};

export default KeyArrayEditor;
