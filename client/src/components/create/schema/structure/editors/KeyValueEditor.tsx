import React, { memo, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faQuestion } from '@fortawesome/free-solid-svg-icons';
import SBSelect, { Option } from 'components/common/SBSelect';
import isRegExpString from '@stdlib/assert-is-regexp-string';
import { sbToastError, sbToastSuccess } from 'components/common/SBToast';

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
    id,
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

  useEffect(() => {
    if (!value) {
      if (type == "checkbox") {
        setValueData(false)
      }
      else if (type == "SBSelect" || type == "SBCreatableSelect") {
        setVal(value ? { value: value, label: value } : '')
      }
      else {
        setValueData(value)
      }
    }
  }, [value])

  const [val, setVal] = useState(value ? { value: value, label: value } : ''); //for select

  const inputArgs: Record<string, any> = {
    value: valueData,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValueData(e.target.value),
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => { setValueData(e.target.value); change(e.target.value); }
  };

  const onSelectChange = (e: Option) => {
    if (e == null) {
      setVal('');
      change('');
    } else {
      setVal(e);
      change(e.value);
    }
  }

  const onECMACheck = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const isRegex = isRegExpString( valueData );

    if (isRegex) {
      sbToastSuccess("Valid regex");
    } else {
      sbToastError("Invalid regex");
      // TODO: More details would be nice....
    }
  }  

  if (type === 'SBCreatableSelect' && options) {
    return (
      <>
        {removable ?
          <div className="row form-group" id={`${name.toLowerCase()}-${id}`}>
            <div className={`col-md-${labelColumns}`}>
              <label htmlFor={`editor-${placeholder}`} className={`pl-2 col-form-label font-weight-bold`}>
                <span title={description}>{name}{required ? '*' : ''}</span>
              </label>
            </div>
            <div className={`col-md-${fieldColumns}`}>
              <div className="input-group">
                <SBSelect id={`editor-${placeholder}-${id}`}
                  placeholder={`Please select a ${placeholder}...`}
                  data={options}
                  onChange={onSelectChange}
                  value={val}
                  isGrouped={Array.isArray(options) ? false : true}
                  isCreatable
                  isClearable />
                <button type="button" title={`Remove ${placeholder}`} className='btn btn-sm btn-danger ' onClick={() => remove(name.toLowerCase())}><FontAwesomeIcon icon={faMinusSquare} /></button>
              </div>
            </div>
          </div>
          :
          <div className="row form-group" id={`${name.toLowerCase()}-${id}`}>
            <label htmlFor={`editor-${placeholder}`} className={`col-md-${labelColumns} col-form-label font-weight-bold`}>
              <span title={description}>{name}{required ? '*' : ''}</span>
            </label>
            <div className={`col-md-${fieldColumns}`}>
              <SBSelect id={`editor-${placeholder}-${id}`}
                placeholder={`Please select a ${placeholder}...`}
                data={options}
                onChange={onSelectChange}
                value={val}
                isGrouped={Array.isArray(options) ? false : true}
                isCreatable
                isClearable />
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

          <div className="row form-group" id={`${name.toLowerCase()}-${id}`}>
            <div className={`col-md-${labelColumns}`}>
              <label htmlFor={`editor-${placeholder}`} className={`pl-2 col-form-label font-weight-bold`}>
                <span title={description}>{name}{required ? '*' : ''}</span>
              </label>
            </div>
            <div className={`col-md-${fieldColumns}`}>
              <div className="input-group">
                <SBSelect id={`editor-${placeholder}-${id}`}
                  placeholder={`Please select a ${placeholder}...`}
                  data={options}
                  onChange={onSelectChange}
                  value={val}
                  isGrouped={Array.isArray(options) ? false : true}
                  isClearable />
                <button type="button" title={`Remove ${placeholder}`} className='btn btn-sm btn-danger' onClick={() => remove(name.toLowerCase())}><FontAwesomeIcon icon={faMinusSquare} /></button>
              </div>
            </div>
          </div>
          :
          <div className="row form-group" id={`${name.toLowerCase()}-${id}`}>
            <label htmlFor={`editor-${placeholder}`} className={`col-md-${labelColumns} col-form-label font-weight-bold`}>
              <span title={description}>{name}{required ? '*' : ''}</span>
            </label>
            <div className={`col-md-${fieldColumns}`}>
              <SBSelect id={`editor-${placeholder}-${id}`}
                placeholder={`Please select a ${placeholder}...`}
                data={options}
                onChange={onSelectChange}
                value={val}
                isGrouped={Array.isArray(options) ? false : true}
                isClearable />
            </div>
          </div>
        }
      </>
    );
  }

  if (type === 'WithRegex' && options) {
      return (
          <div className="row form-group" id={`${name.toLowerCase()}-${id}`}>
            <div className={`col-md-${labelColumns}`}>
              <label htmlFor={`editor-${placeholder}`} className={`pl-2 col-form-label font-weight-bold`}>
                <span title={description}>{name}{required ? '*' : ''}</span>
              </label>
            </div>
            <div className={`col-md-${fieldColumns}`}>
              <div className="input-group">
                <span>type: {type}</span>
                <input id={id + "_input"} name={id + "_input"} type={type} className="form-control" {...inputArgs} placeholder='Enter Regex String' />
                <button id="check_regex" type="button" title='check pattern validity' className="btn btn-sm btn-primary" onClick={onECMACheck}>
                    <FontAwesomeIcon icon={faQuestion}></FontAwesomeIcon>
                </button>
              </div>
            </div>
          </div>
    );
  }; 

  if (['checkbox', 'radio'].includes(type)) {
    inputArgs.checked = type && valueData,
      inputArgs.onChange = (e: React.ChangeEvent<HTMLInputElement>) => { setValueData(e.target.checked); },
      inputArgs.onBlur = (e: React.FocusEvent<HTMLInputElement>) => { setValueData(e.target.value); change(e.target.checked); }
    return (
      <>
        {removable ?
          <div className="row" id={`${name.toLowerCase()}-${id}`}>
            <div className="col-md-12">
              <div className="row">
                <label htmlFor={`editor-${placeholder}`} className={`col-md-${labelColumns} col-form-label font-weight-bold`}>
                  <span title={description}>{name} {required ? '*' : ''}</span>
                </label>
                <div className={`col-md-${fieldColumns} col-form-label d-flex align-items-start`}>
                  <input type={type} id={`editor-${placeholder}-${id}`} className={'w-auto'} {...inputArgs} />
                  <button type="button" title={`Remove ${placeholder}`} className="btn btn-sm btn-danger ms-2" onClick={() => remove(name.toLowerCase())}><FontAwesomeIcon icon={faMinusSquare} /></button>
                </div>
              </div>
            </div>
          </div>
          :
          <div className="row" id={`${name.toLowerCase()}-${id}`}>
            <div className="col-md-12">
              <div className="row">
                <label htmlFor={`editor-${placeholder}`} className={`col-md-${labelColumns} col-form-label font-weight-bold`}>
                  <span title={description}>{name} {required ? '*' : ''}</span>
                </label>
                <div className={`col-md-${fieldColumns} col-form-label d-flex align-items-start`}>
                  <input type={type} id={`editor-${placeholder}-${id}`} className={'w-auto'} {...inputArgs} />
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
        <div className="row form-group" id={`${name.toLowerCase()}-${id}`}>
          <div className={`col-md-${labelColumns}`}>
            <label htmlFor={`editor-${placeholder}`} className={`pl-2 col-form-label font-weight-bold`}>
              <span title={description}>{name}{required ? '*' : ''}</span>
            </label>
          </div>
          <div className={`col-md-${fieldColumns}`}>
            <div className="input-group">
              <input type={type} className="form-control" id={`editor-${placeholder}-${id}`} {...inputArgs} />
              <button type="button" title={`Remove ${placeholder}`} className='btn btn-sm btn-danger' onClick={() => remove(name.toLowerCase())}><FontAwesomeIcon icon={faMinusSquare} /></button>
            </div>
          </div>
        </div>
        :
        <div className="row form-group" id={`${name.toLowerCase()}-${id}`}>
          <label htmlFor={`editor-${placeholder}`} className={`col-md-${labelColumns} col-form-label font-weight-bold`}>
            <span title={description}>{name}{required ? '*' : ''}</span>
          </label>
          <div className={`col-md-${fieldColumns}`}>
            <input type={type} className="form-control" id={`editor-${placeholder}-${id}`} {...inputArgs} />
          </div>
        </div>
      }
    </>
  );
});

export default KeyValueEditor;
