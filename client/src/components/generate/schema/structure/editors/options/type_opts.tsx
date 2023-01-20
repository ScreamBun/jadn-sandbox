import React, { FunctionComponent } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { OptionChange, TypeOptionInputArgs, ValidOptions } from './consts';
import KeyValueEditor from '../key_value';
import { safeGet } from '../../../../../utils';
import { RootState } from '../../../../../../reducers';

// Interfaces
interface TypeOptionsEditorProps {
  schemaTypes: Array<string>;
  id: string;
  placeholder?: string;
  change: OptionChange;
  deserializedState: Record<string, any>;
  optionType?: string;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  schemaTypes: [...state.Util.types.base, ...Object.keys(state.Util.types.schema)]
});

const connector = connect(mapStateToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type TypeOptionsEditorConnectedProps = TypeOptionsEditorProps & ConnectorProps;

const defaultProps = {
  placeholder: 'Set Type Options',
  optionType: ''
};

// Type Options Editor
const TypeOptionsEditor: FunctionComponent<TypeOptionsEditorConnectedProps> = props => {
  const {
    change, deserializedState, id, optionType, schemaTypes
  } = props;

  const getOptions = (key: string) => {
    switch (key) {
      case 'ktype':
        return [];
      case 'vtype':
        return schemaTypes;
      default:
        return [];
    }
  };

  const validOptions = () => {
    return safeGet(ValidOptions, optionType, []).map(key => {
      return (
        <KeyValueEditor
          key={key}
          id={key}
          {...TypeOptionInputArgs[key]}
          placeholder={key}
          removable={false}
          options={getOptions(key)}
          change={val => change([key, val], 'type')}
          value={deserializedState[key]}
        />
      );
    });
  };

  console.log(validOptions())
  if (validOptions().length != 0) {
    return (
      <div className="border m-1 p-1">
        <p className="col-sm-4 my-1"><strong>{id}</strong></p>
        <div className="col-12 m-0">
          {validOptions()}
        </div>
      </div>
    );
  } else if (optionType == "Boolean") {
    return (<div className="border m-1 p-1">
      <div className="col-12 m-0"> No type options available </div>
    </div>);
  }
  return '';
};

TypeOptionsEditor.defaultProps = defaultProps;

export default connector(TypeOptionsEditor);