import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormGroup, FormText } from 'reactstrap';

import Field from '..';
import { isOptional } from '../..';


function mapStateToProps(state) {
  return {
    schema: state.Generate.selectedSchema
  };
}

function mapDispatchToProps(_dispatch) {
  return {};
}

class MapField extends Component {
  render() {
    const {
      def, optChange, parent, schema
    } = this.props;
    const [_idx, name, _type, _args, comment] = def;

    let typeDef = schema.types.filter(t => t[0] === def[2]);
    typeDef = typeDef.length === 1 ? typeDef[0] : [];

    const msgName = (parent ? [parent, name] : [name]).join('.');

    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>{ `${isOptional(def) ? '' : '*'}${name}` }</legend>
        { comment !== '' ? <FormText color="muted">{ comment }</FormText> : '' }
        <div className="col-12 my-1 px-0">
          {
            typeDef[typeDef.length - 1].map((d, i) => <Field key={ i } def={ d } parent={ msgName } optChange={ optChange } />)
          }
        </div>
      </FormGroup>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapField);
