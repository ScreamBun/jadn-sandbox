import React, { memo, useState } from 'react';
import {
  Button, FormText, Label
} from 'reactstrap';
import { InputType } from 'reactstrap/es/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons';
import SBCreatableSelect from 'components/common/SBCreatableSelect';
import SBSelect, { Option } from 'components/common/SBSelect';

// Interface
interface KeyValueEditorProps {
  id: string;
  name: string;
  description?: string;
  placeholder?: string;
  value: boolean | number | string;
  type?: InputType;
  options?: Array<string>; // only for type='select'
  change: (_v: boolean | number | string) => void;
  remove: (_id: string | number) => void;
  required: boolean;
}

// Key Value Editor
const KeyValueEditor = memo(function KeyValueEditor(props: KeyValueEditorProps) {
  const { name, value, description, options, placeholder, type, change, remove, required } = props;
  const [valueData, setValueData] = useState(value);

  const [val, setVal] = useState(value ? { value: value, label: value } : ''); //for select
  const onSelectChange = (e: Option) => {
    if (e == null) {
      setVal('');
      change('');
    } else {
      setVal(e);
      change(e.value);
    }
  }

  if (type === 'SBCreatableSelect' && options) {
    return (
      <>
        <div className="card mb-2">
          <div className="card-body px-2 py-2">
          <div className="row m-0 no-gutters">
              <div className='col'>
                <div className='mb-0'>
                  <Label htmlFor={`editor-${placeholder}`}><strong>{placeholder}{required ? '*' : ''}</strong></Label>
                  <div className="input-group col-sm-12">
                    <SBCreatableSelect id={`editor-${placeholder}`}
                      placeholder={`Please select a ${placeholder}...`}
                      data={options}
                      onChange={onSelectChange}
                      value={val}
                      isGrouped={Array.isArray(options) ? false : true}
                    />
                    {remove ?
                      <div className="input-group-append">
                        <Button color='danger' onClick={() => remove(name.toLowerCase())}>
                          <FontAwesomeIcon icon={faMinusSquare} />
                        </Button>
                      </div> : ''}
                  </div>
                  {description ? <FormText color='muted' className='ml-3'>{description}</FormText> : ''}
                </div> 
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (type === 'SBSelect' && options) {
    return (
      <>
        <div className="card mb-2">
          <div className="card-body px-2 py-2">
          <div className="row m-0 no-gutters">
              <div className='col'>
                <div className='mb-0'>
                  <Label htmlFor={`editor-${placeholder}`}><strong>{placeholder}{required ? '*' : ''}</strong></Label>
                  <div className="input-group col-md-12">
                    <SBSelect id={`editor-${placeholder}`}
                      placeholder={`Please select a ${placeholder}...`}
                      data={options}
                      onChange={onSelectChange}
                      value={val}
                      isGrouped={Array.isArray(options) ? false : true}
                    />
                    {remove ?
                      <div className="input-group-append">
                        <Button color='danger' onClick={() => remove(name.toLowerCase())}>
                          <FontAwesomeIcon icon={faMinusSquare} />
                        </Button>
                      </div> : ''}
                  </div>
                  {description ? <FormText color='muted' className='ml-3'>{description}</FormText> : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const inputArgs: Record<string, any> = {
    value: valueData,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValueData(e.target.value),
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => { setValueData(e.target.value); change(e.target.value); }
  };

  if (['checkbox', 'radio'].includes(type)) {
    inputArgs.defaultChecked = type && valueData,
      inputArgs.onChange = (e: React.ChangeEvent<HTMLInputElement>) => { setValueData(e.target.checked); change(e.target.checked); }

      return (
        <>
          <div className="card mb-2">
            <div className="card-body px-2 py-2">
              <div className="row">
                <div className="col-md-12">
                    <form className="form-inline" role="form">           
                        <Label htmlFor={`editor-${placeholder}`} className='pr-2'><strong>{placeholder}{required ? '*' : ''}</strong></Label>
                        <input type={type} id={`editor-${placeholder}`} />
                        {remove ?
                        <Button title={`Remove ${placeholder}`} className="btn-sm ml-2" color='danger' onClick={() => remove(name.toLowerCase())}><FontAwesomeIcon icon={faMinusSquare} /></Button>
                        : ''}
                    </form>
                </div>
              </div>
            </div>
          </div>
        </>
      );  
  }

  return (
    <>
      <div className="card mb-2">
        <div className="card-body px-2 py-2">
          <div className="row">
            <div className="col-md-12">
                <form className="form-inline" role="form">           
                  <div className="input-group w-100">
                    <Label htmlFor={`editor-${placeholder}`} className='pr-2'><strong>{placeholder}{required ? '*' : ''}</strong></Label>
                    <input type={type} className="form-control" id={`editor-${placeholder}`} />
                    {remove ?
                    <Button title={`Remove ${placeholder}`} className="btn-sm ml-2" color='danger' onClick={() => remove(name.toLowerCase())}><FontAwesomeIcon icon={faMinusSquare} /></Button>
                    : ''}
                  </div>
                </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

KeyValueEditor.defaultProps = {
  description: '',
  options: [],
  placeholder: 'KeyValueEditor',
  type: 'text' as InputType
};

export default KeyValueEditor;
