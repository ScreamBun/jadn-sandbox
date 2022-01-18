import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormGroup, Input, FormText } from 'reactstrap';
import { isOptional } from '../..';

function mapStateToProps(state) {
  return {
    schema: state.Generate.selectedSchema
  };
}

function mapDispatchToProps(_dispatch) {
  return {};
}

class EnumeratedField extends Component {
  render() {
    const {
      def, optChange, parent, schema
    } = this.props;
    const [_idx, name, _type, _args, comment] = def;
    const msgName = (parent ? [parent, name] : [name]).join('.');

    let typeDef = schema.types.filter(t => t[0] === def[2] );
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EnumeratedField);
