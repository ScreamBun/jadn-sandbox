import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { safeGet } from '../../../../../utils';
import { useAppSelector } from 'reducers';
import { getFormatOptions } from 'reducers/format';
import { OptionChange, RequiredOptions, TypeOptionInputArgs, ValidOptions } from './consts';
import KeyValueEditor from '../KeyValueEditor';

interface TypeOptionsEditorProps {
  id?: string;
  placeholder?: string;
  change: OptionChange;
  deserializedState: Record<string, any>;
  optionType?: string;
}

const TypeOptionsEditor = memo(function TypeOptionsEditor(props: TypeOptionsEditorProps) {
  const { change, deserializedState, id, optionType = '' } = props;
  const schemaTypes = useAppSelector((state) => ({
    base: state.Util.types.base,
    schema: Object.keys(state.Util.types.schema) || {}
  }));

  const formatTypes = useSelector(getFormatOptions);

  const getOptions = (key: string) => {
    switch (key) {
      case 'ktype':
        return schemaTypes;
      case 'vtype':
        return schemaTypes;
      case 'format':
        //get only applicable formats based on type 
        let formats_returned = [];
        for (const format of formatTypes) {
          if (format.type.toLowerCase() == optionType?.toLowerCase()) {
            formats_returned.push(format.name)
          }
        }
        return formats_returned;
      default:
        return [];
    }
  };

  const validOptions = () => {
    return safeGet(ValidOptions, optionType, []).map((key: string) => {
      return (
        <KeyValueEditor
          key={key}
          id={id}
          name={key}
          {...TypeOptionInputArgs[key]}
          labelColumns={2}
          fieldColumns={10}
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
      <>
        {validOptions()}
      </>
    );
  } else if (optionType == "Boolean") {
    return (
      <>
        No type options available
      </>);
  }
  return '';
});

export default TypeOptionsEditor;