import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { InfoConfig } from '../../interface';
import { ConfigOptions } from './consts';
import { sbToastInfo } from 'components/common/SBToast';
import KeyValueEditor from './KeyValueEditor';

// Interfaces
interface ConfigObjectEditorProps {
  id: string;
  name: string;
  placeholder?: string;
  description?: string;
  value: Record<string, any>;
  change: (_v: Record<string, any>) => void;
  remove: (_id: string) => void;
  config: InfoConfig;
}

// Config Editor
const ConfigObjectEditor = memo(function ConfigObjectEditor(props: ConfigObjectEditorProps) {
  const { name, description = '', value, change, remove, config } = props;

  const onChange = (k: string, v: any) => {
    const tmpValues = { ...value };
    //if value is empty, reset to default
    if (v === '') {
      tmpValues[k] = config[k];
      sbToastInfo('Resetting config value ' + k + ' to default');
      change(tmpValues);
    } else {
      const parsedVal = /\d+$/.test(v) ? parseInt(v) : v;
      tmpValues[k] = parsedVal;
      change(tmpValues);
    }
  }

  const removeAll = () => {
    remove(name.toLowerCase());
  }

  const keys = Object.keys(ConfigOptions).map(k => {
    const key = k as keyof typeof ConfigOptions;
    const keyProps = {
      ...ConfigOptions[key],
      placeholder: key,
      value: value[key],
      change: (v: any) => onChange(k, v),
      removable: false,
      required: false,
      id: 'config-props',
      labelColumns: 2,
      fieldColumns: 10
    };
    return <KeyValueEditor key={k} name={k} {...keyProps} />;
  });

  return (
    <>
      <div className="card border-secondary mb-2" id={name.toLowerCase()}>
        <div className="card-header px-2 py-2">
          <div className='row no-gutters'>
            <div className='col'>
              <span>{name} <small style={{ fontSize: '10px' }}> {description} </small></span>
            </div>
            <div className='col'>
              <button type="button" className="btn btn-sm btn-danger float-end" onClick={removeAll} >
                <FontAwesomeIcon
                  icon={faMinusCircle}
                />
              </button>
            </div>
          </div>
        </div>
        <div className="card-body px-2 py-2">
          <div className="row m-0">
            <div className="col-12 m-0">
              {keys}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default ConfigObjectEditor;

