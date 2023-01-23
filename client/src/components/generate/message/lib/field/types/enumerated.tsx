import React, { FunctionComponent } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { isOptional } from '../..';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { RootState } from '../../../../../../reducers';

// Interface
interface EnumeratedFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any) => void;
  parent?: string;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  schema: state.Util.selectedSchema as SchemaJADN
});

const connector = connect(mapStateToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type EnumeratedFieldConnectedProps = EnumeratedFieldProps & ConnectorProps;

// Component
const EnumeratedField: FunctionComponent<EnumeratedFieldConnectedProps> = props => {
  const {
    def, optChange, parent, schema
  } = props;
  const [_idx, name, type, _opts, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');

  let typeDef = schema.types.filter(t => t[0] === type);
  typeDef = typeDef.length === 1 ? typeDef[0] : [];

  const defOpts = typeDef[typeDef.length - 1].map(opt => <option key={opt[0]} data-subtext={opt[2]}>{opt[1]}</option>);

  return (
    <div className='form-group'>
      <div className='card'>
        <div className='card-header p-2'>
          <h4 className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</h4>
          {comment ? <small className='card-subtitle text-muted'>{comment}</small>: ''}
        </div>
        <div className='card-body mx-3'>
          <div className="col-12 my-1 px-0">
            <select
              name={name}
              title={name}
              className="custom-select"
              onChange={e => optChange(msgName, e.target.value)}
            >
              <option data-subtext={`${name} options`} value={name} >{`${name} options`}</option>
              {defOpts}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default connector(EnumeratedField);
