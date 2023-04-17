import React from 'react';
import { OptionChange, RequiredOptions, TypeOptionInputArgs, ValidOptions } from './consts';
import KeyValueEditor from '../KeyValueEditor';
import { safeGet } from '../../../../../utils';
import { useDispatch } from 'react-redux';
import { getValidFormatOpts } from 'actions/format';


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
  const { change, deserializedState, id, optionType, schemaTypes } = props;
  const dispatch = useDispatch();

  const getOptions = (key: string) => {
    switch (key) {
      case 'ktype':
        return [];
      case 'vtype':
        return schemaTypes;
      case 'format':
        var valid_formats: any[] = [];
        dispatch(getValidFormatOpts())
          .then((val: Array<any>) => {
            valid_formats = val;
          })
          .catch((val: any) => {
            console.log("ERROR: " + val);
            valid_formats = [];
          });
        return valid_formats;
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
          required={RequiredOptions[optionType].includes(key) ? true : false}
        />
      );
    });
  };

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