import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormGroup, Input, FormText } from 'reactstrap';

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

class BasicField extends Component {
  inputOpts(type) {
    switch (type) {
      case 'duration':
        return {
          type: 'number',
          placeholder: 0
        };
      case 'date-time':
        return {
          type: 'datetime',
          placeholder: '2000-01-01T00:00:00-00:00'
        };
      default:
        return {
          type: 'text'
        };
    }
  }

  render() {
    const {
      arr, def, optChange, parent
    } = this.props;
    const [ _idx, name, type, _opts, comment ] = def;
    const msgName = parent ? [parent, name] : [name];

    if ( name >= 0) { // name is type if not field
      return <Field def={ def } parent={ msgName.join('.') } optChange={ optChange } />;
    }
    const opts = this.inputOpts(type);
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BasicField);
