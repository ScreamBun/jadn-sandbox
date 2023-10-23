import React, { memo, useState } from 'react';
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
  type?: string;
  options?: Array<string>; // only for type='select'
  change: (v: boolean | number | string) => void;
  remove: (id: string) => void;
  required: boolean;
  removable?: boolean;
  labelColumns?: number;
  fieldColumns?: number;
}

// Key Value Editor
const KeyValueEditor = memo(function KeyValueEditor(props: KeyValueEditorProps) {
  const {
    name,
    value = '',
    description = '',
    options = [],
    placeholder,
    type = 'text',
    change,
    remove,
    required,
    removable,
    labelColumns = 2,
    fieldColumns = 10
  } = props;
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
        {removable ?
          <div className="row form-group" id={name.toLowerCase()}>
            <div className={`col-md-${labelColumns}`}>
              <label htmlFor={`editor-${placeholder}`} className={`pl-2 col-form-label font-weight-bold`}>{name}{required ? '*' : ''}</label>
            </div>
            <div className={`col-md-${fieldColumns}`}>
              <div className="input-group">
                <SBCreatableSelect id={`editor-${placeholder}`}
                  placeholder={`Please select a ${placeholder}...`}
                  data={options}
                  onChange={onSelectChange}
                  value={val}
                  isGrouped={Array.isArray(options) ? false : true}
                />
                {description ? <small className="text-muted">{description}</small> : ''}
                <div className="input-group-append">
                  <button type="button" title={`Remove ${placeholder}`} className='btn btn-danger' onClick={() => remove(name.toLowerCase())}><FontAwesomeIcon icon={faMinusSquare} /></button>
                </div>
              </div>
            </div>
          </div>
          :
          <div className="row form-group" id={name.toLowerCase()}>
            <label htmlFor={`editor-${placeholder}`} className={`col-md-${labelColumns} col-form-label font-weight-bold`}>{name}{required ? '*' : ''}</label>
            <div className={`col-md-${fieldColumns}`}>
              <SBCreatableSelect id={`editor-${placeholder}`}
                placeholder={`Please select a ${placeholder}...`}
                data={options}
                onChange={onSelectChange}
                value={val}
                isGrouped={Array.isArray(options) ? false : true}
              />
              {description ? <small className="text-muted">{description}</small> : ''}
            </div>
          </div>
        }
      </>
    );
  }

  if (type === 'SBSelect' && options) {
    return (
      <>
        {removable ?

          <div className="row form-group" id={name.toLowerCase()}>
            <div className={`col-md-${labelColumns}`}>
              <label htmlFor={`editor-${placeholder}`} className={`pl-2 col-form-label font-weight-bold`}>{name}{required ? '*' : ''}</label>
            </div>
            <div className={`col-md-${fieldColumns}`}>
              <div className="input-group">
                <SBSelect id={`editor-${placeholder}`}
                  placeholder={`Please select a ${placeholder}...`}
                  data={options}
                  onChange={onSelectChange}
                  value={val}
                  isGrouped={Array.isArray(options) ? false : true}
                />
                {description ? <small className="text-muted">{description}</small> : ''}
                <div className="input-group-append">
                  <button type="button" title={`Remove ${placeholder}`} className='btn btn-danger' onClick={() => remove(name.toLowerCase())}><FontAwesomeIcon icon={faMinusSquare} /></button>
                </div>
              </div>
            </div>
          </div>
          :
          <div className="row form-group" id={name.toLowerCase()}>
            <label htmlFor={`editor-${placeholder}`} className={`col-md-${labelColumns} col-form-label font-weight-bold`}>{name}{required ? '*' : ''}</label>
            <div className={`col-md-${fieldColumns}`}>
              <SBSelect id={`editor-${placeholder}`}
                placeholder={`Please select a ${placeholder}...`}
                data={options}
                onChange={onSelectChange}
                value={val}
                isGrouped={Array.isArray(options) ? false : true}
              />
              {description ? <small className="text-muted">{description}</small> : ''}
            </div>
          </div>
        }
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
      inputArgs.onChange = (e: React.ChangeEvent<HTMLInputElement>) => { setValueData(e.target.checked); },
      inputArgs.onBlur = (e: React.FocusEvent<HTMLInputElement>) => { setValueData(e.target.value); change(e.target.checked); }
    return (
      <>
        {removable ?
          <div className="row" id={name.toLowerCase()}>
            <div className="col-md-12">
              <div className="row">
                <label htmlFor={`editor-${placeholder}`} className={`col-md-${labelColumns} col-form-label font-weight-bold`}>
                  <span>{name} {required ? '*' : ''}</span>
                </label>
                <div className={`col-md-${fieldColumns} col-form-label`}>
                  <input type={type} id={`editor-${placeholder}`} className={type} {...inputArgs} />
                  <button type="button" title={`Remove ${placeholder}`} className="btn btn-danger ml-2" onClick={() => remove(name.toLowerCase())}><FontAwesomeIcon icon={faMinusSquare} /></button>
                </div>
              </div>
            </div>
          </div>
          :
          <div className="row" id={name.toLowerCase()}>
            <div className="col-md-12">
              <div className="row">
                <label htmlFor={`editor-${placeholder}`} className={`col-md-${labelColumns} col-form-label font-weight-bold`}>
                  <span>{name} {required ? '*' : ''}</span>
                </label>
                <div className={`col-md-${fieldColumns} col-form-label`}>
                  <input type={type} id={`editor-${placeholder}`} className={type} {...inputArgs} />
                </div>
              </div>
            </div>
          </div>
        }
      </>
    );
  }

  return (
    <>
      {removable ?
        <div className="row form-group" id={name.toLowerCase()}>
          <div className={`col-md-${labelColumns}`}>
            <label htmlFor={`editor-${placeholder}`} className={`pl-2 col-form-label font-weight-bold`}>{name}{required ? '*' : ''}</label>
          </div>
          <div className={`col-md-${fieldColumns}`}>
            <div className="input-group">
              <input type={type} className="form-control" id={`editor-${placeholder}`} {...inputArgs} />
              <div className="input-group-append">
                <button type="button" title={`Remove ${placeholder}`} className='btn btn-danger' onClick={() => remove(name.toLowerCase())}><FontAwesomeIcon icon={faMinusSquare} /></button>
              </div>
            </div>
          </div>
        </div>
        :
        <div className="row form-group" id={name.toLowerCase()}>
          <label htmlFor={`editor-${placeholder}`} className={`col-md-${labelColumns} col-form-label font-weight-bold`}>{name}{required ? '*' : ''}</label>
          <div className={`col-md-${fieldColumns}`}>
            <input type={type} className="form-control" id={`editor-${placeholder}`} {...inputArgs} />
          </div>
        </div>
      }
    </>
  );
});

export default KeyValueEditor;
