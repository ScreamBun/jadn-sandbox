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
  const schemaTypesArr = Object.values(schemaTypesObject).map(arr => arr[0]);
  const primitiveTypes = useAppSelector((state) => (state.Util.types.primitive), shallowEqual);

  const types = {
    base: baseTypes,
    schema: schemaTypes
  };

  const primitiveAndSchemaTypes = {
    primitive: primitiveTypes,
    schema: schemaTypesArr
  }

  const getOptions = (key: string) => {
    switch (key) {
      case 'ktype':
        return primitiveAndSchemaTypes
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
      case 'pointer':
        const filteredPointer = Object.values(schemaTypesObject).filter((type) => {
          return (type.length == 5 && Array.isArray(type[4]) && type[4].length != 0)
        }).map((type) => {
          return type[0]
        })
        return filteredPointer;
      default:
        return [];
    }
  };

  const validOptionsList = safeGet(ValidOptions, optionType, []); // Overarching list of valid options for the type

  const validCheckboxOptions = validOptionsList.filter((opt: keyof typeof TypeOptionInputArgs) => { // Group checkbox options together
    return TypeOptionInputArgs[opt] && TypeOptionInputArgs[opt].type === 'checkbox';
  }).map((key: string) => {
    return (
        <KeyValueEditor
          key={key}
          id={id}
          name={key}
          labelColumns={8}
          //fieldColumns={2}
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

  const validNumberOptions = validOptionsList.filter((opt: keyof typeof TypeOptionInputArgs) => { // Group number options together
    return TypeOptionInputArgs[opt] && TypeOptionInputArgs[opt].type === 'number';
  }).map((key: string) => {
    return (
        <KeyValueEditor
          key={key}
          id={id}
          name={key}
          labelColumns={6}
          //fieldColumns={6}
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
  
  const validSelectOptions = validOptionsList.filter((opt: keyof typeof TypeOptionInputArgs) => { // Group select options together
    return TypeOptionInputArgs[opt] && (TypeOptionInputArgs[opt].type === 'SBSelect' || TypeOptionInputArgs[opt].type === 'SBCreatableSelect');
  }).map((key: string) => {
    return (
        <KeyValueEditor
          key={key}
          id={id}
          name={key}
          labelColumns={3}
          fieldColumns={9}
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

  const validOtherOptions = validOptionsList.filter((opt: keyof typeof TypeOptionInputArgs) => { // Group rest of options together
    return !['checkbox', 'number', 'SBSelect', 'SBCreatableSelect'].includes(TypeOptionInputArgs[opt].type);
  }).map((key: string) => {
    return (
        <KeyValueEditor
          key={key}
          id={id}
          name={key}
          labelColumns={3}
          fieldColumns={9}
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

  if (validOptionsList.length != 0) {
    return (
      <>
        {validNumberOptions.length != 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '1rem'
            }}
          >
            {validNumberOptions}
          </div>
        ) : null}
        {validSelectOptions.length != 0 ? validSelectOptions : null}
        {validCheckboxOptions.length != 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '1rem'
            }}
          >
            {validCheckboxOptions}
          </div>
        ) : null}
        {validOtherOptions.length != 0 ? validOtherOptions : null}
      </>
    );
  } else if (optionType == "Boolean") {
    return (
      <>
        No type options available
      </>
    );
  }
  return '';
});

export default TypeOptionsEditor;