import React, { memo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
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
  const baseTypes = useAppSelector((state) => (state.Util.types.base), shallowEqual);
  const schemaTypesObject = useAppSelector((state) => (state.Util.types.schema), shallowEqual);
  const formatTypes = useSelector(getFormatOptions);
  const schemaTypes = Object.keys(schemaTypesObject);
  const types = {
    base: baseTypes,
    schema: schemaTypes
  };

  const getOptions = (key: string) => {
    switch (key) {
      case 'ktype':
        //SHOULD be a Defined type, 
        //either an enumeration or a type with constraints such as a pattern 
        //or semantic valuation keyword that specify a fixed subset of values that belong to a category.
        const schemaTypesArr = Object.values(schemaTypesObject);
        const keyTypesArr = schemaTypesArr.filter((arr) => arr[1].toLowerCase() == "enumerated" || arr[1].toLowerCase() == "string");
        const keyTypes = keyTypesArr.map(arr => arr[0]);
        return keyTypes;
      case 'vtype':
        return types;
      case 'enum':
        //An Enumerated type defined with the enum option has fields copied 
        //from the type referenced in the option rather than being listed individually in the definition. 
        const filtered = Object.values(schemaTypesObject).filter((type) => {
          return (type.length == 5 && Array.isArray(type[4]) && type[4].length != 0)
        }).map((type) => {
          return type[0]
        })
        return filtered;
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
          labelColumns={2}
          fieldColumns={10}
          placeholder={key}
          removable={false}
          options={getOptions(key)}
          change={val => change([key, val], 'type')}
          value={deserializedState[key]}
          required={RequiredOptions[optionType].includes(key) ? true : false}
          {...TypeOptionInputArgs[key]}
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