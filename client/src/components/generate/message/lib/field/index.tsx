import React, { Component } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { FormText } from 'reactstrap';

import {
  BasicField, EnumeratedField, ChoiceField, RecordField, MapField, ArrayOfField
} from './types';
import {
  SchemaJADN, StandardFieldArray
} from '../../../schema/interface';
import { RootState } from '../../../../../reducers';

// Interfaces
interface FieldProps {
  def: StandardFieldArray;
  optChange: (k: string, v: any, i?: number) => void;
  idx?: number;
  parent?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface FieldState {}

// Redux Connector
function mapStateToProps(state: RootState) {
  return {
    schema: state.Generate.selectedSchema as SchemaJADN
  };
}

const connector = connect(mapStateToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type FieldConnectedProps = FieldProps & ConnectorProps;

// Component
class Field extends Component<FieldConnectedProps> {
  shouldComponentUpdate(nextProps: FieldConnectedProps, nextState: FieldState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;
    return propsUpdate || stateUpdate;
  }

  render() {
    const {
      def, idx, optChange, parent, schema
    } = this.props;
    const parentName = parent || '';
    const typeDefs = schema.types.filter(t => t[0] === def[2] );
    const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];

    // console.log(parentName, def);
    const args = {
      def,
      parent: parentName,
      optChange: (k: string, v: any) => optChange(k, v, idx)
    };


    switch (typeDef[1]) {
      case 'Enumerated':
			  return <EnumeratedField { ...args } />;
      case 'Choice':
			  return <ChoiceField { ...args } />;
      case 'Record':
			  return <RecordField { ...args } />;
			case 'Map':
			    return <MapField { ...args } />;
			case 'ArrayOf':
			    return <ArrayOfField { ...args } />;
			case 'Array':
          const [ arr ] = def;
          // eslint-disable-next-line react/jsx-one-expression-per-line
			    return <FormText>Array: { arr }</FormText>;
			default:
			    return <BasicField { ...args } />;
    }
  }
}

export default connector(Field);

