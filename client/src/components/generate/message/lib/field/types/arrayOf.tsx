import React, { Component, MouseEvent } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { Button, FormGroup, FormText } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import Field from '..';
import { isOptional } from '../..';
import { SchemaJADN, StandardFieldArray, TypeArray } from '../../../../schema/interface';
import { opts2obj } from '../../../../schema/structure/editors/options/consts';
import { hasProperty } from '../../../../../utils';
import { RootState } from '../../../../../../reducers';

// Interface
interface ArrayOfFieldProps {
  arr?: any;
  def: StandardFieldArray;
  optChange: (n: string, v: any, i?: number) => void;
  parent?: string;
}

interface ArrayOfFieldState {
  min: boolean;
  max: boolean;
  count: number;
  opts: Record<string, boolean|number|string>
}

// Redux Connector
function mapStateToProps(state: RootState) {
  return {
    schema: state.Generate.selectedSchema as SchemaJADN,
    baseTypes: state.Generate.types.base
  };
}

const connector = connect(mapStateToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type ArrayOfFieldConnectedProps = ArrayOfFieldProps & ConnectorProps;

// Component
class ArrayOfField extends Component<ArrayOfFieldConnectedProps, ArrayOfFieldState> {
  msgName: string;
  opts: Record<string, any>;
  typeDef?: TypeArray;

  constructor(props: ArrayOfFieldConnectedProps) {
    super(props);
    this.addOpt = this.addOpt.bind(this);
    this.optChange = this.optChange.bind(this);
    this.removeOpt = this.removeOpt.bind(this);
    const { def, parent, schema } = this.props;

    const [ _idx, name, type, _args, _comment ] = def;
    this.opts = {};

    const typeDef = schema.types.filter(t => { return t[0] === type; });
    this.typeDef = typeDef.length === 1 ? typeDef[0] : undefined;
    this.msgName = (parent ? [parent, name] : [name]).join('.');

    this.state = {
      min: false,
      max: false,
      count: 1,
      opts: {}
    };
  }

  addOpt(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const max = hasProperty(this.opts, 'max') ? this.opts.max : 20;

    this.setState(prevState => {
      const maxBool = prevState.count < max;
      return {
        count: maxBool ? prevState.count+1 : prevState.count,
        max: !maxBool
      };
    }, () => {
      const { optChange } = this.props;
      const { opts } = this.state;
      optChange(this.msgName, Array.from(new Set(Object.values(opts))));
    });
  }

  removeOpt(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const min = hasProperty(this.opts, 'min') ? this.opts.min : 0;

    this.setState(prevState => {
      const { count, opts } = prevState;
      const minBool = count > min;
      if (minBool) {
        delete opts[Math.max.apply(Math, Object.keys(opts))];
      }

      return {
        count: minBool ? count-1 : count,
        min: !minBool,
        opts
      };
    }, () => {
      const { optChange } = this.props;
      const { opts } = this.state;
      optChange(this.msgName, Array.from(new Set(Object.values(opts))));
    });
  }

  optChange(_k: string, v: any, i: number) {
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
    const [ _idx, name, _type, _args, comment ] = def;
    if (this.typeDef) {
      this.opts = opts2obj(this.typeDef[2]);
    }

    let arrDef = schema.types.filter(t => t[0] === this.opts.rtype);
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
          { `${isOptional(def) ? '' : '*'}${name}` }
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
        { comment && <FormText color="muted">{ comment }</FormText> }
        { fields }
      </FormGroup>
    );
  }
}

export default connector(ArrayOfField);
