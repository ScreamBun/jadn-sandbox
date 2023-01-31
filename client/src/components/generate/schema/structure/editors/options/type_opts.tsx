import React from 'react';
import { OptionChange, TypeOptionInputArgs, ValidOptions } from './consts';
import KeyValueEditor from '../key_value';
import { safeGet } from '../../../../../utils';
import { useAppSelector } from '../../../../../../reducers';

// Interfaces
interface TypeOptionsEditorProps {
  schemaTypes: Array<string>;
  id: string;
  placeholder?: string;
  change: OptionChange;
  deserializedState: Record<string, any>;
  optionType?: string;
}

// Type Options Editor
const TypeOptionsEditor = (props: TypeOptionsEditorProps) => {
  const { change, deserializedState, id, optionType } = props;
  const schemaTypes = useAppSelector((state) => [...state.Util.types.base, ...Object.keys(state.Util.types.schema)])

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

TypeOptionsEditor.defaultProps = {
  placeholder: 'Set Type Options',
  optionType: ''
};

export default TypeOptionsEditor;