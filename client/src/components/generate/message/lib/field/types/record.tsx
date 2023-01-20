import React, { FunctionComponent } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import Field from '..';
import { isOptional } from '../..';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { RootState } from '../../../../../../reducers';

// Interface
interface RecordFieldProps {
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
type RecordFieldConnectedProps = RecordFieldProps & ConnectorProps;

// Component
const RecordField: FunctionComponent<RecordFieldConnectedProps> = props => {
  const {
    def, optChange, parent, schema
  } = props;
  const [_idx, name, _type, _args, comment] = def;

  let typeDef = schema.types.filter(t => t[0] === def[2]);
  typeDef = typeDef.length === 1 ? typeDef[0] : [];

  const msgName = (parent ? [parent, name] : [name]).join('.');

  return (
    <div className='form-group'>
      <div className='card'>
        <div className='card-header p-2'>
          <h4 className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</h4>
          {comment ? <small className='card-subtitle text-muted'>{comment}</small>: ''}
        </div>

        <div className='card-body mx-3'>
          <div className="col-12 my-1 px-0">
            {typeDef[typeDef.length - 1].map(d => <Field key={d[0]} def={d} parent={msgName} optChange={optChange} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default connector(RecordField);
