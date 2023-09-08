import React, { memo, useState } from 'react';
import {
  Button, ButtonGroup, FormText, Input
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { InfoConfig } from '../../interface';
import { sbToastError } from 'components/common/SBToast';

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

// Key Object Editor
const KeyObjectEditor = memo(function KeyObjectEditor(props: KeyObjectEditorProps) {
  const { value, description, name, placeholder, change, config } = props;
  let valueObjInit = Object.keys(value).map(k => ({ key: k, value: value[k] }));
  const [valueObj, setValueObj] = useState(valueObjInit);

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

  const removeAll = () => {
    const { name, remove } = props;
    remove(name.toLowerCase());
  }

  const removeIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (valueObj.length > 1) {
      const { dataset } = e.currentTarget;
      const idx = parseInt(dataset.index || '', 10);

      const tmpvalue = [...valueObj.filter((_row, i) => i !== idx)];
      setValueObj(tmpvalue);
      change(toObject(tmpvalue));

    } else {
      removeAll();
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
      <Input
        type="text"
        className="form-control"
        data-index={i}
        data-type="key"
        placeholder={'NSID'}
        value={obj.key}
        onChange={onChange}
        onBlur={onBlur}
      />
      <Input
        type="text"
        className="form-control"
        data-index={i}
        data-type="value"
        placeholder={placeholder}
        value={obj.value}
        onChange={onChange}
        onBlur={onBlur}
      />
      <div className="input-group-append">
        <Button color="danger" onClick={removeIndex} data-index={i}>
          <FontAwesomeIcon icon={faMinusSquare} />
        </Button>
      </div>
    </div>
  ));

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
});

KeyObjectEditor.defaultProps = {
  placeholder: 'KeyObjectEditor'
};

export default KeyObjectEditor;