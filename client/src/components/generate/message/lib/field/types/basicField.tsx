import React, { FunctionComponent } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { Input } from 'reactstrap';
import { InputType } from 'reactstrap/es/Input';
import dayjs from 'dayjs'
import Field from '..';
import { isOptional } from '../..';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { RootState } from '../../../../../../reducers';

// Interface
interface BasicFieldProps {
  arr?: any;
  def: StandardFieldArray;
  optChange: (n: string, v: any, i?: number) => void;
  parent?: string;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  schema: state.Generate.selectedSchema as SchemaJADN
});

const connector = connect(mapStateToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type BasicFieldConnectedProps = BasicFieldProps & ConnectorProps;

// Component
const BasicField: FunctionComponent<BasicFieldConnectedProps> = props => {
  const inputOpts = (type: string) => {
    const opts: {
      type: InputType;
      placeholder?: string;
    } = {
      type: 'text'
    };
    switch (type) {
      case 'Duration':
        opts.type = 'number';
        opts.placeholder = '0';
        break;
      case 'Date-Time':
        opts.type = 'datetime';
        opts.placeholder = '2000-01-01T00:00:00-00:00';
        break;
      // no default
    }
    return opts;
  };

  const {
    arr, def, optChange, parent
  } = props;
  const [_idx, name, type, _opts, comment] = def;
  const msgName = parent ? [parent, name] : [name];

  if (name >= 0) { // name is type if not field
    return <Field def={def} parent={msgName.join('.')} optChange={optChange} />;
  }
  const opts = inputOpts(type);
  if (opts.type == 'datetime') {
    return (
      <div className='form-group'>
        <div className='card'>
          <div className='card-header p-2'>
            <h4 className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</h4>
            {comment ? <small className='card-subtitle text-muted'>{comment}</small> : ''}
          </div>
          <div className='card-body mx-3'>
            <Input
              name={name}
              type="datetime-local"
              step="any"
              min={dayjs().format('YYYY-MM-DD HH:mm:ss')}
              pattern='/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/'
              onChange={e => optChange(msgName.join('.'), e.target.value, arr)}
            />
          </div>
        </div>
      </div>
    );

  } else {
    return (
      <div className='form-group'>
        <div className='card'>
          <div className='card-header p-2'>
            <h4 className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</h4>
            {comment ? <small className='card-subtitle text-muted'>{comment}</small> : ''}
          </div>
          <div className='card-body mx-3'>
            <Input
              type={opts.type}
              placeholder={opts.placeholder}
              name={name}
              onChange={e => optChange(msgName.join('.'), e.target.value, arr)}
            />
          </div>
        </div>
      </div>
    );
  }
};

export default connector(BasicField);
