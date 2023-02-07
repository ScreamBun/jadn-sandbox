import React from 'react';
import {
  Button, ButtonGroup, FormText, Input
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

// Interface
interface KeyArrayEditorProps {
  name: string;
  description: string;
  placeholder?: string;
  value: Array<any>;
  change: (_v: Record<string, any>) => void;
  remove: (_id: string) => void;
}

// Key Array Editor
const KeyArrayEditor = (props: KeyArrayEditorProps) => {
  const { name, description, placeholder, value, change, remove } = props;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { dataset } = e.target;
    const idx = parseInt(dataset.index || '', 10);
    const tmpValues = [...value];
    tmpValues[idx] = e.target.value;
    change(tmpValues);
  };

  const removeAll = () => {
    remove(name.toLowerCase());
  };

  const removeIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (value.length > 1) {
      const { dataset } = e.currentTarget;
      const index = parseInt(dataset.index || '', 10);
      const tmpValues = [...value];
      tmpValues.splice(index, 1);
      change(tmpValues);
    }
  };

  const addIndex = () => {
    change([...value, '']);
  };

  const indices = value.map((val, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <div className="input-group col-sm-12 mb-1" key={i}>
      <Input
        type="text"
        className="form-control"
        data-index={i}
        placeholder={placeholder}
        value={val}
        onChange={onChange}
      />
      <div className="input-group-append">
        <Button color='danger' onClick={removeIndex} data-index={i}>
          <FontAwesomeIcon icon={faMinusSquare} />
        </Button>
      </div>
    </div>
  ));

  return (
    <div className="border m-1 p-1">
      <ButtonGroup size="sm" className="float-right">
        <Button color="info" onClick={addIndex} >
          <FontAwesomeIcon icon={faPlusSquare} />
        </Button>
        <Button color="danger" onClick={removeAll} >
          <FontAwesomeIcon icon={faMinusCircle} />
        </Button>
      </ButtonGroup>

      <div className="border-bottom mb-2">
        <p className="col-sm-4 my-1"><strong>{name}</strong></p>
        {description ? <FormText color='muted' className='ml-3'>{description}</FormText> : ''}
      </div>

      <div className="row m-0 indices">
        {indices}
      </div>
    </div>
  );
};

KeyArrayEditor.defaultProps = {
  placeholder: 'KeyArrayEditor'
};

export default KeyArrayEditor;
