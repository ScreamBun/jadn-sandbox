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
  change?: (_v: boolean | number | string) => void;
  remove?: (_id: string | number) => void;
  required: boolean;
  removable?: boolean;
  labelColumns?: number;
  fieldColumns?: number;
}

// Key Value Editor
const KeyValueEditor = memo(function KeyValueEditor(props: KeyValueEditorProps) {
  const { 
    name, 
    value, 
    description, 
    options, 
    placeholder, 
    type, 
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
        <div className="row m-0 no-gutters">
            <div className='col'>
              <div className='mb-0'>
                <Label htmlFor={`editor-${placeholder}`}><strong>{name}{required ? '*' : ''}</strong></Label>
                <div className="input-group col-sm-12">
                  <SBCreatableSelect id={`editor-${placeholder}`}
                    placeholder={`Please select a ${placeholder}...`}
                    data={options}
                    onChange={onSelectChange}
                    value={val}
                    isGrouped={Array.isArray(options) ? false : true}
                  />
                  {description ? <FormText color='muted'>{description}</FormText> : ''}
                  {removable ?
                    <div className="input-group-append">
                      <Button color='danger' onClick={() => remove(name.toLowerCase())}>
                        <FontAwesomeIcon icon={faMinusSquare} />
                      </Button>
                    </div> : ''}
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
      {removable ?
        <>
          <div className="row form-group">
            <div className={`col-md-${labelColumns}`}>
              <label htmlFor={`editor-${placeholder}`} className={`pl-2 col-form-label font-weight-bold`}>{name}{required ? '*' : ''}</label>
            </div>
            <div className={`col-md-${fieldColumns}`}>
              <div className = "input-group input-group-sm">
                <SBSelect id={`editor-${placeholder}`}
                      placeholder={`Please select a ${placeholder}...`}
                      data={options}
                      onChange={onSelectChange}
                      value={val}
                      isGrouped={Array.isArray(options) ? false : true}
                    />
                  {description ? <FormText color='muted'>{description}</FormText> : ''}
                <div className="input-group-append">
                  <button title={`Remove ${placeholder}`} className='btn btn-danger' onClick={() => remove(name.toLowerCase())}><FontAwesomeIcon icon={faMinusSquare} /></button>
                </div>                    
              </div>
            </div>
          </div>
        </>      
        :
        <>
          <div className="row form-group">
              <label htmlFor={`editor-${placeholder}`} className={`col-md-${labelColumns} col-form-label font-weight-bold`}>{name}{required ? '*' : ''}</label>
              <div className={`col-md-${fieldColumns}`}>
                <SBSelect id={`editor-${placeholder}`}
                  placeholder={`Please select a ${placeholder}...`}
                  data={options}
                  onChange={onSelectChange}
                  value={val}
                  isGrouped={Array.isArray(options) ? false : true}
                />
                {description ? <FormText color='muted'>{description}</FormText> : ''}
              </div>
          </div>        
        </>
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
      inputArgs.onChange = (e: React.ChangeEvent<HTMLInputElement>) => { setValueData(e.target.checked); change(e.target.checked); }
      return (
        <>
        { removable ?
          <div className="row">
            <div className="col-md-12">
              <div className="row">
                <label htmlFor={`editor-${placeholder}`} className={`col-md-${labelColumns} col-form-label font-weight-bold`}>
                    <span>{name} {required ? '*' : ''}</span>
                </label>
                <div className={`col-md-${fieldColumns} col-form-label`}>
                  <input type={type} id={`editor-${placeholder}`} className={type} {...inputArgs} />
                  <Button title={`Remove ${placeholder}`} className="btn-sm ml-2" color='danger' onClick={() => remove(name.toLowerCase())}><FontAwesomeIcon icon={faMinusSquare} /></Button>
                </div>
              </div>
            </div>
          </div>  
          :
          <div className="row">
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
        { removable ?
          <div className="row form-group">
            <div className={`col-md-${labelColumns}`}>
              <label htmlFor={`editor-${placeholder}`} className={`pl-2 col-form-label font-weight-bold`}>{name}{required ? '*' : ''}</label>
            </div>
            <div className={`col-md-${fieldColumns}`}>
              <div className = "input-group input-group-sm">
                <input type={type} className="form-control" id={`editor-${placeholder}`} {...inputArgs} />
                <div className="input-group-append">
                  <button title={`Remove ${placeholder}`} className='btn btn-danger' onClick={() => remove(name.toLowerCase())}><FontAwesomeIcon icon={faMinusSquare} /></button>
                </div>                    
              </div>
            </div>
          </div>
          :                   
          <div className="row form-group">
              <label htmlFor={`editor-${placeholder}`} className={`col-md-${labelColumns} col-form-label font-weight-bold`}>{name}{required ? '*' : ''}</label>
              <div className={`col-md-${fieldColumns}`}>
                <input type={type} className="form-control form-control-sm" id={`editor-${placeholder}`} {...inputArgs} />
              </div>
          </div>                  
        }
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
