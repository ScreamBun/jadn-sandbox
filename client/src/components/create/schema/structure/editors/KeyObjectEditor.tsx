import React from 'react';
import {
  Button, ButtonGroup, FormText, Input
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { InfoConfig } from '../../interface';
import { sbToastError } from 'components/common/SBToast';

// Interface
interface KeyObjectEditorProps {
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
const KeyObjectEditor = (props: KeyObjectEditorProps) => {
  const { value, description, name, placeholder, change, config } = props;
  let valueObj = Object.keys(value).map(k => ({ key: k, value: value[k] }));

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { dataset, value } = e.target;
    const idx = parseInt(dataset.index || '', 10);
    const type = dataset.type as keyof Pair;

    //TODO:A Namespace Identifier (NSID) is, by default, a 1-8 character string beginning with a letter and containing only letters and numbers. 
    //Default formatting can be overridden by inserting an alternative definition into a JADN schema.
    if (type == 'key' && value) {
      const regex = new RegExp(config.$NSID, "g");
      if (!regex.test(value)) {
        sbToastError('Error: Namespace Identifier does not match regex');
      }
    }

    const tmpvalue = [...valueObj];
    tmpvalue[idx][type] = value;
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
      change(toObject(tmpvalue));

    } else {
      console.log('cant remove');
    }
  }

  const addIndex = () => {
    if (valueObj.some(v => v.key === '')) {
      return;
    }

    const tmpvalue = [...valueObj, { key: '', value: '' }];
    change(toObject(tmpvalue));
  }

  const indices = valueObj.map((obj, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <div className="input-group col-sm-12 mb-1" key={i}>
      <Input
        type="text"
        className="form-control"
        data-index={i}
        data-type="key"
        placeholder={'NSID'}
        value={obj.key}
        onChange={onChange}
      />
      <Input
        type="text"
        className="form-control"
        data-index={i}
        data-type="value"
        placeholder={placeholder}
        value={obj.value}
        onChange={onChange}
      />
      <div className="input-group-append">
        <Button color="danger" onClick={removeIndex} data-index={i}>
          <FontAwesomeIcon icon={faMinusSquare} />
        </Button>
      </div>
    </div>
  ));

  return (
    <div className="border m-1 p-1">
      <ButtonGroup size="sm" className="float-right">
        <Button color="info" onClick={addIndex} >
          <FontAwesomeIcon
            icon={faPlusSquare}
          />
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
}

KeyObjectEditor.defaultProps = {
  placeholder: 'KeyObjectEditor'
};

export default KeyObjectEditor;