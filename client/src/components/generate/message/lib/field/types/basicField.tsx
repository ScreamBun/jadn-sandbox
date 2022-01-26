import React, { FunctionComponent } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { FormGroup, Input, FormText } from 'reactstrap';
import { InputType } from 'reactstrap/es/Input';

import Field from '..';
import { isOptional } from '../..';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { RootState } from '../../../../../../reducers';

// Interface
interface BasicFieldProps {
  arr?: any;
  def: StandardFieldArray;
  optChange: (n: string, v: any, i?: number) => void;
  parent?: string;
}

// Redux Connector
function mapStateToProps(state: RootState) {
  return {
    schema: state.Generate.selectedSchema as SchemaJADN
  };
}

const connector = connect(mapStateToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type BasicFieldConnectedProps = BasicFieldProps & ConnectorProps;

// Component
const BasicField: FunctionComponent<BasicFieldConnectedProps> = props =>  {
  const inputOpts = (type: string) => {
    const opts: {
      type: InputType;
      placeholder?: string;
    } = {
      type: 'text'
    };
    switch (type) {
      case 'duration':
        opts.type = 'number';
        opts.placeholder = '0';
        break;
      case 'date-time':
        opts.type = 'datetime';
        opts.placeholder = '2000-01-01T00:00:00-00:00';
        break;
      // no default
    }
    return opts;
  };

  const {
    arr, def, optChange, parent
  } = props;
  const [ _idx, name, type, _opts, comment ] = def;
  const msgName = parent ? [parent, name] : [name];

  if (name >= 0) { // name is type if not field
    return <Field def={ def } parent={ msgName.join('.') } optChange={ optChange } />;
  }
  const opts = inputOpts(type);
  return (
    <FormGroup tag="fieldset" className="border border-dark p-2">
      <legend>{ `${isOptional(def) ? '' : '*'}${name}` }</legend>
      <Input
        type={ opts.type || 'text' }
        placeholder={ opts.placeholder || '' }
        name={ name }
        onChange={ e => optChange(msgName.join('.'), e.target.value, arr) }
      />
      { comment !== '' ? <FormText color="muted">{ comment }</FormText> : '' }
    </FormGroup>
  );
};

export default connector(BasicField);
