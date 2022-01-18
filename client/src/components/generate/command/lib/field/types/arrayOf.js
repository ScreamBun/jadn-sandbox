import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, FormGroup, FormText } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import Field from '..';
import { isOptional } from '../..';

function mapStateToProps(state) {
  return {
    schema: state.Generate.selectedSchema,
    baseTypes: state.Generate.types.base
  };
}

function mapDispatchToProps(_dispatch) {
  return {};
}

class ArrayOfField extends Component {
  constructor(props) {
    super(props);
    this.addOpt = this.addOpt.bind(this);
    this.optChange = this.optChange.bind(this);
    this.removeOpt = this.removeOpt.bind(this);
    const { def, parent, schema } = this.props;

    [ this.idx, this.name, this.type, this.args, this.comment ] = def;
    this.opts = {};

    this.typeDef = schema.types.filter((type) => { return type[0] === this.type; });
    this.typeDef = this.typeDef.length === 1 ? this.typeDef[0] : [];
    this.msgName = (parent ? [parent, this.name] : [this.name]).join('.');

    this.state = {
      min: false,
      max: false,
      count: 1,
      opts: {}
    };
  }

  opts2arr(opts) {
    this.opts = {};
    const jadnOpts = {
      // Type Options
      '=': 'compact',
      '[': 'min',
      ']': 'max',
      '*': 'rtype',
      '$': 'pattern',
      '@': 'format'
    };

    opts.forEach(opt => {
      const optChar = opt.charAt(0);
      const optVal = opt.substr(1);

      if (jadnOpts.hasOwnProperty(optChar)) {
          this.opts[jadnOpts[optChar]] = optVal;
      } else {
        console.log('Unknown option', optChar);
      }
    });
  }

  addOpt(e) {
    e.preventDefault();
    const max = this.opts.hasOwnProperty('max') ? this.opts.max : 20;

    this.setState(prevState => {
      const maxBool = prevState.count < max;
      return {
        count: maxBool ? ++prevState.count : prevState.count,
        max: !maxBool
      };
    }, () => {
      const { optChange } = this.props;
      const { opts } = this.state;
      optChange(this.msgName, Array.from(new Set(Object.values(opts))));
    });
  }

  removeOpt(e) {
    e.preventDefault();
    const min = this.opts.hasOwnProperty('min') ? this.opts.min : 0;

    this.setState(prevState => {
      const minBool = prevState.count > min;
      const opts = prevState.opts;
      if (minBool) {
        delete opts[Math.max.apply(Math, Object.keys(opts))];
      }

      return {
        count: minBool ? --prevState.count : prevState.count,
        min: !minBool,
        opts
      };
    }, () => {
      const { optChange } = this.props;
      const { opts } = this.state;
      optChange(this.msgName, Array.from(new Set(Object.values(opts))));
    });
  }

  optChange(k, v, i) {
    this.setState(prevState => ({
      opts: {
        ...prevState.opts,
        [i]: v
      }
    }), () => {
      const { optChange } = this.props;
      const { opts } = this.state;
      optChange(this.msgName, Array.from(new Set(Object.values(opts))));
    });
  }

  render() {
    const { def, schema } = this.props;
    const { count, max, min } = this.state;
    this.opts2arr(this.typeDef[2]);

    let arrDef = schema.types.filter(type => { return type[0] === this.opts.rtype; });
    if (arrDef.length === 1) {
      arrDef = arrDef[0];
      arrDef = [0, arrDef[0].toLowerCase(), arrDef[0], [], arrDef[arrDef.length-2]];
    } else {
      arrDef = [0, arrDef[1], 'String', [], ''];
    }

    const fields = [];
    for (let i=0; i < count; ++i) {
        fields.push(<Field key={ i } def={ arrDef } parent={ this.msgName } optChange={ this.optChange } idx={ i } />);
    }

    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>
          { `${isOptional(def) ? '' : '*'}${this.name}` }
          <Button
            color="danger"
            className={ `float-right p-1${min ? ' disabled' : ''}` }
            onClick={ this.removeOpt }
          >
            <FontAwesomeIcon icon={ faMinusSquare } size="lg" />
          </Button>
          <Button
            color="primary"
            className={ `float-right p-1${max ? ' disabled' : ''}` }
            onClick={ this.addOpt }
          >
            <FontAwesomeIcon icon={ faPlusSquare } size="lg" />
          </Button>
        </legend>
        { this.comment !== '' ? <FormText color="muted">{ this.comment }</FormText> : '' }
        { fields }
      </FormGroup>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ArrayOfField);
