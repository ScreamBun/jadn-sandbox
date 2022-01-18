import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormText } from 'reactstrap';

import BasicField from './types/basicField';
import EnumeratedField from './types/enumerated';
import ChoiceField from './types/choice';
import RecordField from './types/record';
import MapField from './types/map';
import ArrayOfField from './types/arrayOf';


function mapStateToProps(state) {
  return {
    schema: state.Generate.selectedSchema
  };
}

function mapDispatchToProps(_dispatch) {
  return {};
}

class Field extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;
    return propsUpdate || stateUpdate;
  }

  render() {
    const {
      def, idx, optChange, parent, schema
    } = this.props;
    const parentName = parent || '';
    let typeDef = schema.types.filter(type => { return type[0] === def[2]; });
    typeDef = typeDef.length === 1 ? typeDef[0] : [];


    switch (typeDef[1]) {
      case 'Enumerated':
			  return <EnumeratedField def={ def } parent={ parentName } optChange={ (k, v) => optChange(k, v, idx) } />;
      case 'Choice':
			  return <ChoiceField def={ def } parent={ parentName } optChange={ (k, v) => optChange(k, v, idx) } />;
      case 'Record':
			  return <RecordField def={ def } parent={ parentName } optChange={ (k, v) => optChange(k, v, idx) } />;
			case 'Map':
			    return <MapField def={ def } parent={ parentName } optChange={ (k, v) => optChange(k, v, idx) } />;
			case 'ArrayOf':
			    return <ArrayOfField def={ def } parent={ parentName } optChange={ (k, v) => optChange(k, v, idx) } />;
			case 'Array':
          const [ arr ] = def;
			    return <FormText>Array: { arr }</FormText>;
			default:
			    return <BasicField def={ def } parent={ parentName } optChange={ (k, v) => optChange(k, v, idx) } />;
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Field);

