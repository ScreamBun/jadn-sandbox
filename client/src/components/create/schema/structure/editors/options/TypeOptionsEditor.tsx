import React, { memo, useEffect, useState } from 'react';
import { OptionChange, RequiredOptions, TypeOptionInputArgs, ValidOptions } from './consts';
import KeyValueEditor from '../KeyValueEditor';
import { safeGet } from '../../../../../utils';
import { useDispatch } from 'react-redux';
import { getValidFormatOpts } from 'actions/format';
import { useAppSelector } from 'reducers';

// Interfaces
interface TypeOptionsEditorProps {
  id: string;
  placeholder?: string;
  change: OptionChange;
  deserializedState: Record<string, any>;
  optionType?: string;
}

// Type Options Editor
const TypeOptionsEditor = memo(function TypeOptionsEditor(props: TypeOptionsEditorProps) {
  const { change, deserializedState, id, optionType } = props;
  const dispatch = useDispatch();
  const [formatOpts, setFormatOpts] = useState<string[]>([]);
  const schemaTypes = useAppSelector((state) => ({
    base: state.Util.types.base,
    schema: Object.keys(state.Util.types.schema) || {}
  }));

  useEffect(() => {
    if (optionType != undefined) {
      dispatch(getValidFormatOpts(optionType))
        //TODO: get format options based on type
        .then((val) => {
          setFormatOpts(val.payload.format_options.map(obj => obj.name));
        })
        .catch((val) => {
          console.log("ERROR: " + val.payload.err);
          setFormatOpts([]);
        })
    }
  }, []);

  const getOptions = (key: string) => {
    switch (key) {
      case 'ktype':
        return schemaTypes;
      case 'vtype':
        return schemaTypes;
      case 'format':
        //get only applicable formats based on type 
        return formatOpts;
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
      <div className="border m-0 p-1">
        <p className="col-sm-4 my-1"><strong>{id}</strong></p>
        <div className="col-12 m-0">
          {validOptions()}
        </div>
      </div>
    );
  } else if (optionType == "Boolean") {
    return (<div className="border m-0 p-1">
      <div className="col-12 m-0"> No type options available </div>
    </div>);
  }
  return '';
});

TypeOptionsEditor.defaultProps = {
  placeholder: 'Set Type Options',
  optionType: ''
};

export default TypeOptionsEditor;