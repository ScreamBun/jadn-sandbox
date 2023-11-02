import React, { memo, useState } from 'react';
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
    <div className="input-group mb-1" key={i}>
      <input
        id={`keyArrayEditor-${i}`}
        type="text"
        className="form-control"
        data-index={i}
        placeholder={placeholder}
        value={val}
        onChange={onChange}
        onBlur={onBlur}
      />
      <button type='button' className='btn btn-danger' onClick={removeIndex} data-index={i}>
        <FontAwesomeIcon icon={faMinusSquare} />
      </button>
    </div>
  ))

  return (
    <>
      <div className="card mb-2" id={name.toLowerCase()}>
        <div className="card-header px-2 py-2">
          <div className='row no-gutters'>
            <div className='col'>
              <span>{name} <small style={{ fontSize: '10px' }}> {description} </small></span>
            </div>
            <div className='col'>
              <div className="btn-group float-end" role="group" aria-label="button group">
                <button type='button' className='btn btn-sm btn-primary' onClick={addIndex} >
                  <FontAwesomeIcon icon={faPlusSquare} />
                </button>
                <button type='button' className='btn btn-sm btn-danger' onClick={removeAll} >
                  <FontAwesomeIcon icon={faMinusCircle} />
                </button>
              </div>
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

export default KeyArrayEditor;
