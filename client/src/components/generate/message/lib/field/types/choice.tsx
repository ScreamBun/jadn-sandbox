import React, { ChangeEvent, Component } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import Field from '..';
import { isOptional } from '../..';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { RootState } from '../../../../../../reducers';

// Interface
interface ChoiceFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any) => void;
  parent?: string;
}

interface ChoiceFieldState {
  selected: number;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  schema: state.Util.selectedSchema as SchemaJADN
});

const connector = connect(mapStateToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type ChoiceFieldConnectedProps = ChoiceFieldProps & ConnectorProps;

// Component
class ChoiceField extends Component<ChoiceFieldConnectedProps, ChoiceFieldState> {
  constructor(props: ChoiceFieldConnectedProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      selected: -1
    };
  }

  handleChange(e: ChangeEvent<HTMLSelectElement>) {
    this.setState({
      selected: parseInt(e.target.value, 10)
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
    const defOpts = typeDef[typeDef.length - 1].map(opt => <option key={opt[0]} data-subtext={opt[2]} value={opt[0]}>{opt[1]}</option>);

    let selectedDef = typeDef[typeDef.length - 1].filter(opt => opt[0] === selected);
    selectedDef = selectedDef.length === 1 ? selectedDef[0] : [];

    return (
      <div className='form-group'>
        <div className='card'>
          <div className='card-header p-2'>
            <h4 className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</h4>
            {comment && <small className='card-subtitle text-muted'>{comment}</small>}
          </div>
          <div className='card-body mx-3'>
            <div className="col-12 my-1 px-0">
              <select name={name} title={name} className="custom-select" onChange={this.handleChange}>
                <option data-subtext={`${name} options`}> {name} options </option>
                {defOpts}
              </select>
            </div>
            <div className="col-12 py-2">
              {
                selected >= 0 ? <Field def={selectedDef} parent={msgName} optChange={optChange} /> : ''
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connector(ChoiceField);
