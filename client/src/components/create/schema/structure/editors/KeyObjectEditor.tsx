import React, { memo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faMinusSquare, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { InfoConfig } from '../../interface';
import { sbToastError } from 'components/common/SBToast';
import { SBConfirmModal } from 'components/common/SBConfirmModal';

// Interface
interface KeyObjectEditorProps {
  id: string;
  name: string;
  description: string;
  placeholder?: string;
  value: Record<string, any>;
  change: (_v: Record<string, any>) => void;
  remove: (_id: string) => void;
  config: InfoConfig;
}

type Pair = { key: string, value: any };

// Key Object Editor : NSID/Namespace
const KeyObjectEditor = memo(function KeyObjectEditor(props: KeyObjectEditorProps) {
  const { value, description, name, change, config } = props;
  let valueObjInit = Object.keys(value).map(k => ({ key: k, value: value[k] }));
  const [valueObj, setValueObj] = useState(valueObjInit);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { dataset, value } = e.target;
    const idx = parseInt(dataset.index || '', 10);
    const type = dataset.type as keyof Pair;

    const tmpvalue = [...valueObj];
    tmpvalue[idx][type] = value;
    setValueObj(tmpvalue);
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { dataset, value } = e.target;
    const idx = parseInt(dataset.index || '', 10);
    const type = dataset.type as keyof Pair;

    if (type == 'key' && value) {
      const regex = new RegExp(config.$NSID, "g");
      if (!regex.test(value)) {
        sbToastError('Error: Namespace Identifier format is not permitted');
      }
    }

    const tmpvalue = [...valueObj];
    tmpvalue[idx][type] = value;
    if (JSON.stringify(valueObjInit) == JSON.stringify(tmpvalue)) {
      return;
    }
    setValueObj(tmpvalue);
    change(toObject(tmpvalue));
  }

  const toObject = (val: Array<Pair>) => {
    return (val || valueObj).reduce((obj, row) => ({
      ...obj,
      [row.key]: row.value
    }), {});
  }

  const onRemoveItemClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (name == "Namespaces") {
      setIsConfirmModalOpen(true);
    } else {
      const { name, remove } = props;
      remove(name.toLowerCase());
    }

  };

  const removeAll = (response: boolean) => {
    setIsConfirmModalOpen(false);
    if (response == true) {
      const { name, remove } = props;
      remove(name.toLowerCase());
    }
  }

  const removeIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (valueObj.length > 1) {
      const { dataset } = e.currentTarget;
      const idx = parseInt(dataset.index || '', 10);

      const tmpvalue = [...valueObj.filter((_row, i) => i !== idx)];
      setValueObj(tmpvalue);
      change(toObject(tmpvalue));

    } else {
      removeAll(true);
    }
  }

  const addIndex = () => {
    if (valueObjInit.some(v => v.key === '')) {
      sbToastError('Cannot add more: Enter namespace');
      return;
    }

    const tmpvalue = [...valueObj, { key: '', value: '' }];
    setValueObj(tmpvalue);
    change(toObject(tmpvalue));
  }

  const indices = valueObj.map((obj, i) => (
    <div className="input-group mb-1 p-0" key={i}>
      <input
        id={`keyObjectEditorKey-${i}`}
        type="text"
        className="form-control"
        data-index={i}
        data-type="key"
        placeholder={'NSID'}
        value={obj.key}
        onChange={onChange}
        onBlur={onBlur}
      />
      <input
        id={`keyObjectEditorValue-${i}`}
        type="text"
        className="form-control"
        data-index={i}
        data-type="value"
        placeholder={'Namespace'}
        value={obj.value}
        onChange={onChange}
        onBlur={onBlur}
      />
      <button type='button' className='btn btn-sm btn-danger' onClick={removeIndex} data-index={i}>
        <FontAwesomeIcon icon={faMinusSquare} />
      </button>
    </div>
  ));

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
});
export default KeyObjectEditor;