import React from 'react';
import { Button, ButtonGroup, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

// Key Object Editor
const KeyObjectEditor = (props) => {
  const {
    change, id, remove, placeholder, value
  } = props;

  const removeAll = e => remove(id.toLowerCase());

  const removeIndex = e => {
    if (value.length > 1) {
      console.log('WHOOT');
      const { attributes } = e.target;
      const index = attributes.getNamedItem('data-index').value.split(',')[0];
      const tmpValue = [ ...value ];
      tmpValue.splice(index, 1);
      change(tmpValue);
    } else {
      console.log('cant remove');
    }
  };

  const addIndex = () => {
    const tmpValue = [ ...value ];
    tmpValue.push(['', '']);
    change(tmpValue);
  };

  const onChange = e => {
    const { attributes } = e.target;
    const index = attributes.getNamedItem('data-index').value.split(',');

    let tmpValue = [ ...value ];
    if (!tmpValue[index[0]]) {
      tmpValue[index[0]] = ['', ''];
    }
    tmpValue[index[0]][index[1]] = e.target.value;
    change(tmpValue);
  };

  const indices = value.map((obj, i) => (
    <div className="input-group col-sm-12 mb-1" key={ i }>
      <Input
        type="text"
        className="form-control"
        data-index={ [i, 0] }
        placeholder={ placeholder }
        value={ obj[0] || '' }
        onChange={ onChange }
      />
      <Input
        type="text"
        className="form-control"
        data-index={ [i, 1] }
        placeholder={ placeholder }
        value={ obj[1] || '' }
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

KeyObjectEditor.defaultProps = {
  id: 'KeyObjectEditor',
  placeholder: 'KeyObjectEditor',
  value: [],
  change: val => {
    console.log(val);
  },
  remove: id => {
    console.log(id);
  }
};

export default KeyObjectEditor;
