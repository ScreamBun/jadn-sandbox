import React, { FunctionComponent } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { FormGroup, FormText } from 'reactstrap';

import Field from '..';
import { isOptional } from '../..';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { RootState } from '../../../../../../reducers';

// Interface
interface MapFieldProps {
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
type MapFieldConnectedProps = MapFieldProps & ConnectorProps;

// Component
const MapField: FunctionComponent<MapFieldConnectedProps> = props => {
  const {
    def, optChange, parent, schema
  } = props;
  const [_idx, name, _type, _args, comment] = def;

  let typeDef = schema.types.filter(t => t[0] === def[2]);
  typeDef = typeDef.length === 1 ? typeDef[0] : [];

  const msgName = (parent ? [parent, name] : [name]).join('.');

  return (
    <FormGroup tag="fieldset" className="border border-dark p-2">
      <legend>{ `${isOptional(def) ? '' : '*'}${name}` }</legend>
      { comment && <FormText color="muted">{ comment }</FormText> }
      <div className="col-12 my-1 px-0">
        { typeDef[typeDef.length - 1].map(d => <Field key={ d[0] } def={ d } parent={ msgName } optChange={ optChange } />) }
      </div>
    </FormGroup>
  );
};

export default connector(MapField);
