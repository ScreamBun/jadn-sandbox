import React, { memo, useState } from 'react';
import {
  Button, ButtonGroup, FormText, Input
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

// Interface
interface KeyArrayEditorProps {
  id: string;
  name: string;
  description: string;
  placeholder?: string;
  value: Array<any>;
  change: (_v: Record<string, any>) => void;
  remove: (_id: string) => void;
}

// Key Array Editor
const KeyArrayEditor = memo(function KeyArrayEditor(props: KeyArrayEditorProps) {
  const { name, description, placeholder, value, change, remove } = props;

  const [dataArr, setDataArr] = useState(value);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { dataset } = e.target;
    const idx = parseInt(dataset.index || '', 10);
    const tmpValues = [...dataArr];
    tmpValues[idx] = e.target.value;
    setDataArr(tmpValues);
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { dataset } = e.target;
    const idx = parseInt(dataset.index || '', 10);
    const tmpValues = [...dataArr];
    tmpValues[idx] = e.target.value;
    if (JSON.stringify(tmpValues) == JSON.stringify(value)) {
      return;
    }
    setDataArr(tmpValues);
    change(tmpValues);
  }

  const removeAll = () => {
    remove(name.toLowerCase());
  }

  const removeIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (dataArr.length > 1) {
      const { dataset } = e.currentTarget;
      const index = parseInt(dataset.index || '', 10);
      const tmpValues = [...dataArr];
      tmpValues.splice(index, 1);
      setDataArr(tmpValues);
      change(tmpValues);
    }
  }

  const addIndex = () => {
    setDataArr([...dataArr, '']);
    change([...dataArr, '']);
  }

  const indices = dataArr.map((val, i) => (
    <div className="input-group input-group-sm mb-1" key={i}>
      <Input
        type="text"
        className="form-control form-control-sm"
        data-index={i}
        placeholder={placeholder}
        value={val}
        onChange={onChange}
        onBlur={onBlur}
      />
      <div className="input-group-append">
        <Button color='danger' onClick={removeIndex} data-index={i}>
          <FontAwesomeIcon icon={faMinusSquare} />
        </Button>
      </div>
    </div>
  ))

  return (
    <>
      <div className="card border-secondary mb-2">
        <div className="card-header px-2 py-2">
            <div className='row no-gutters'>
              <div className='col'>
              <span>{name} <small style={{ fontSize: '10px' }}> {description} </small></span>
              </div>
              <div className='col'>
                <ButtonGroup size="sm" className="float-right">
                    <Button color="primary" onClick={addIndex} >
                      <FontAwesomeIcon icon={faPlusSquare} />
                    </Button>
                    <Button color="danger" onClick={removeAll} >
                      <FontAwesomeIcon icon={faMinusCircle} />
                    </Button>
                  </ButtonGroup>
              </div>
            </div>     
          </div>
          <div className="card-body px-2 py-2">
              <div className="row m-0">
                <div className="col-12 m-0">
                  {indices}
                </div>
              </div>
          </div>
      </div>     
    </>
  );
})

KeyArrayEditor.defaultProps = {
  placeholder: 'KeyArrayEditor'
};

export default KeyArrayEditor;
