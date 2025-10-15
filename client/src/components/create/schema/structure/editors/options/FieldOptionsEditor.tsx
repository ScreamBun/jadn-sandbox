import React, { memo } from 'react';
import { FieldOptionInputArgs, OptionChange } from './consts';
import KeyValueEditor from '../KeyValueEditor';

interface FieldOptionsEditorProps {
  id?: string;
  deserializedState: Record<string, any>;
  placeholder?: string;
  fieldOptions: boolean;
  change: OptionChange;
}

const FieldOptionsEditor = memo(function FieldOptionsEditor(props: FieldOptionsEditorProps) {
  const { id, change, deserializedState, fieldOptions } = props;

  // Group field options by input type
  const optionKeys = Object.keys(FieldOptionInputArgs);

  const validCheckboxOptions = optionKeys.filter(
    key => FieldOptionInputArgs[key].type === 'checkbox'
  ).map(key => (
    <KeyValueEditor
      key={key}
      id={id}
      name={key}
      {...FieldOptionInputArgs[key]}
      placeholder={key}
      removable={false}
      change={val => change([key, val], 'field')}
      value={deserializedState[key]}
      labelColumns={8}
      //fieldColumns={9}
    />
  ));

  const validNumberOptions = optionKeys.filter(
    key => FieldOptionInputArgs[key].type === 'number'
  ).map(key => (
    <KeyValueEditor
      key={key}
      id={id}
      name={key}
      {...FieldOptionInputArgs[key]}
      placeholder={key}
      removable={false}
      change={val => change([key, val], 'field')}
      value={deserializedState[key]}
      labelColumns={6}
      //fieldColumns={9}
    />
  ));

  const validSelectOptions = optionKeys.filter(
    key => FieldOptionInputArgs[key].type === 'SBSelect' || FieldOptionInputArgs[key].type === 'SBCreatableSelect'
  ).map(key => (
    <KeyValueEditor
      key={key}
      id={id}
      name={key}
      {...FieldOptionInputArgs[key]}
      placeholder={key}
      removable={false}
      change={val => change([key, val], 'field')}
      value={deserializedState[key]}
      labelColumns={3}
      fieldColumns={9}
    />
  ));

  const validOtherOptions = optionKeys.filter(
    key => !['checkbox', 'number', 'SBSelect', 'SBCreatableSelect'].includes(FieldOptionInputArgs[key].type)
  ).map(key => (
    <KeyValueEditor
      key={key}
      id={id}
      name={key}
      {...FieldOptionInputArgs[key]}
      placeholder={key}
      removable={false}
      change={val => change([key, val], 'field')}
      value={deserializedState[key]}
      labelColumns={3}
      fieldColumns={9}
    />
  ));

  if (fieldOptions) {
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
              gridTemplateColumns: 'repeat(5, 1fr)',
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
  }
  return '';
});

export default FieldOptionsEditor;