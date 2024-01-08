import React, { memo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faMinusSquare, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { SBConfirmModal } from 'components/common/SBConfirmModal';
import SBSelect, { Option } from 'components/common/SBSelect';
import { shallowEqual } from 'react-redux';
import { useAppSelector } from 'reducers';

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

// Key Array Editor: Exports
const KeyArrayEditor = memo(function KeyArrayEditor(props: KeyArrayEditorProps) {
  const { name, description, placeholder, value, change, remove } = props;
  const [dataArr, setDataArr] = useState(value);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const schemaTypes = useAppSelector((state) => (Object.keys(state.Util.types.schema)), shallowEqual)
  const validExports = dataArr.length != 0 ? schemaTypes.filter(type => !dataArr.includes(type)) : schemaTypes;

  const onChange = (e: Option, idx: number) => {
    const tmpValues = [...dataArr];
    if (e == null) {
      tmpValues[idx] = "";
    } else {
      tmpValues[idx] = e.value;
    }
    setDataArr(tmpValues);
    change(tmpValues);
  }

  const onRemoveItemClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const removeAll = (response: boolean) => {
    setIsConfirmModalOpen(false);
    if (response == true) {
      remove(name.toLowerCase());
    }
  }

  const removeIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (dataArr.length > 1) {
      const { dataset } = e.currentTarget;
      const index = parseInt(dataset.index || '', 10);
      const tmpValues = [...dataArr];
      tmpValues.splice(index, 1);
      setDataArr(tmpValues);
      change(tmpValues);
    } else {
      setDataArr([]);
      change([]);
    }
  }

  const addIndex = () => {
    setDataArr([...dataArr, '']);
  }

  const indices = dataArr.map((val, i) => (
    <div className="input-group mb-1" key={i}>
      <SBSelect
        id={`keyArrayEditor-${i}`}
        placeholder={placeholder}
        value={val ? { value: val, label: val } : null}
        onChange={(e: Option) => onChange(e, i)}
        data={validExports}
        isSmStyle
        isCreatable
        customNoOptionMsg={'Begin typing to add an Export...'}
      />
      <button type='button' className='btn btn-sm btn-danger' onClick={removeIndex} data-index={i}>
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
                  <FontAwesomeIcon icon={faPlusCircle} />
                </button>
                <button type='button' className='btn btn-sm btn-danger' onClick={onRemoveItemClick} >
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
      <SBConfirmModal
        isOpen={isConfirmModalOpen}
        title={`Remove ${name}`}
        message={`Are you sure you want to remove ${name}?`}
        onResponse={removeAll}>
      </SBConfirmModal>
    </>
  );
})

export default KeyArrayEditor;
