import React, { memo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { safeGet } from '../../../../../utils';
import { useAppSelector } from 'reducers';
import { getFormatOptions } from 'reducers/format';
import { OptionChange, RequiredOptions, TypeOptionInputArgs, ValidOptions } from './consts';
import KeyValueEditor from '../KeyValueEditor';
import { destructureField } from 'components/create/data/lib/utils';
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

  // Separate checkbox/radio options from others, similar to FieldOptionsEditor
  const validKeys = safeGet(ValidOptions, optionType, []) as Array<keyof typeof TypeOptionInputArgs>;
  const checkboxKeys = validKeys.filter(
    (key) => TypeOptionInputArgs[key]?.type === 'checkbox' || TypeOptionInputArgs[key]?.type === 'radio'
  );
  const otherKeys = validKeys.filter(
    (key) => TypeOptionInputArgs[key]?.type !== 'checkbox' && TypeOptionInputArgs[key]?.type !== 'radio'
  );

  const checkboxOptions = checkboxKeys.map((key) => (
    <div key={String(key)} className="col-md-3">
      <KeyValueEditor
    id={id ?? ''}
        name={String(key)}
        placeholder={String(key)}
        removable={false}
        remove={() => {}}
        options={getOptions(String(key)) as unknown as string[]}
        change={val => change([String(key), val], 'type')}
        value={deserializedState[String(key)]}
        required={RequiredOptions[optionType].includes(String(key))}
        {...TypeOptionInputArgs[key]}
        labelColumns={3}
        fieldColumns={9}
      />
    </div>
  ));

  const otherOptions = otherKeys.map((key) => (
    <div key={String(key)} className="col-md-6">
      <KeyValueEditor
    id={id ?? ''}
        name={String(key)}
        labelColumns={4}
        fieldColumns={7}
        placeholder={String(key)}
        removable={false}
        remove={() => {}}
        options={getOptions(String(key)) as unknown as string[]}
        change={val => change([String(key), val], 'type')}
        value={deserializedState[String(key)]}
        required={RequiredOptions[optionType].includes(String(key))}
        {...TypeOptionInputArgs[key]}
      />
    </div>
  ));

  if (validKeys.length !== 0) {
    return (
      <>
        <div className="d-flex flex-wrap align-items-start mb-2">
          {checkboxOptions}
        </div>
        <div className="d-flex flex-wrap align-items-center mb-2">
          {otherOptions}
        </div>
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