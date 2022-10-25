import React, { FunctionComponent } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { FormGroup, Input, FormText } from 'reactstrap';

import { isOptional } from '../..';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { RootState } from '../../../../../../reducers';

// Interface
interface EnumeratedFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any) => void;
  parent?: string;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  schema: state.Generate.selectedSchema as SchemaJADN
});

const connector = connect(mapStateToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type EnumeratedFieldConnectedProps = EnumeratedFieldProps & ConnectorProps;

// Component
const EnumeratedField: FunctionComponent<EnumeratedFieldConnectedProps> = props => {
  const {
    def, optChange, parent, schema
  } = props;
  const [ _idx, name, type, _opts, comment ] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');

  let typeDef = schema.types.filter(t => t[0] === type );
  typeDef = typeDef.length === 1 ? typeDef[0] : [];

  const defOpts = typeDef[typeDef.length-1].map(opt => <option key={ opt[0] } data-subtext={ opt[2] }>{ opt[1] }</option>);

  return (
    <FormGroup tag="fieldset" className="border border-dark p-2">
      <legend>{ `${isOptional(def) ? '' : '*'}${name}` }</legend>
      { comment !== '' ? <FormText color="muted">{ comment }</FormText> : '' }
      <Input
        type="select"
        name={ name }
        title={ name }
        className="selectpicker"
        onChange={ e => optChange(msgName, e.target.value) }
      >
        <option data-subtext={ `${name} options` } value='' >{ `${name} options` }</option>
        { defOpts }
      </Input>
    </FormGroup>
  );
};

export default connector(EnumeratedField);
