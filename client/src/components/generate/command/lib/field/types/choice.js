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

class ChoiceField extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      selected: -1,
      selectedBase: ''
    };
  }

  handleChange(e) {
    this.setState({
      selected: e.target.value
    }, () => {
      const { def, optChange } = this.props;
      const { selected } = this.state;
      if (selected === -1) {
        optChange(def[1], undefined);
      }
    });
  }

  render() {
    const {
      def, optChange, parent, schema
    } = this.props;
    const { selected } = this.state;
    const [_idx, name, _type, _args, comment] = def;
    const msgName = (parent ? [parent, name] : [name]).join('.');
    
    let typeDef = schema.types.filter(t => t[0] === def[2]);
    typeDef = typeDef.length === 1 ? typeDef[0] : [];
    const defOpts = typeDef[typeDef.length-1].map(opt => <option key={ opt[0] } data-subtext={ opt[2] } value={ opt[0] }>{ opt[1] }</option>);

    this.selectedDef = typeDef[typeDef.length-1].filter(opt => opt[0] === selected );
    this.selectedDef = this.selectedDef.length === 1 ? this.selectedDef[0] : [];

    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>{ `${isOptional(def) ? '' : '*'}${name}` }</legend>
        { comment !== '' ? <FormText color="muted">{ comment }</FormText> : '' }
        <div className="col-12 my-1 px-0">
          <Input type="select" name={ name } title={ name } className="selectpicker" onChange={ this.handleChange } default={ -1 }>
            <option data-subtext={ `${name} options` } value={ -1 }>{ name } options</option>
            { defOpts }
          </Input>
          <div className="col-12 py-2">
            {
              this.state.selected >= 0 ? <Field def={ this.selectedDef } parent={ msgName } optChange={ optChange } /> : ''
            }
          </div>
        </div>
      </FormGroup>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChoiceField);
