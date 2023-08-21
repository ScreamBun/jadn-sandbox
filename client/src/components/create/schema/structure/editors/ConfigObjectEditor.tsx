import React, { memo } from 'react';
import { Button, FormText } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { ConfigOptions } from './consts';
import KeyValueEditor from './KeyValueEditor';
import { InfoConfig } from '../../interface';
import { sbToastInfo } from 'components/common/SBToast';

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
  const { name, description, value, change, remove, config } = props;

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
      removable: false
    };
    return <KeyValueEditor key={k} name={k} {...keyProps} />;
  });

  return (
    <div className="border m-1 p-1">
      <Button color="danger" size="sm" className="float-right" onClick={removeAll} >
        <FontAwesomeIcon
          icon={faMinusCircle}
        />
      </Button>
      <div className="border-bottom mb-2">
        <p className="col-sm-4 my-1"><strong>{name}</strong></p>
        {description ? <FormText color='muted' className='ml-3'>{description}</FormText> : ''}
      </div>
      <div className="col-12 m-0">
        {keys}
      </div>
    </div>
  );
});

ConfigObjectEditor.defaultProps = {
  placeholder: 'ConfigObjectEditor',
  description: ''
};

export default ConfigObjectEditor;

