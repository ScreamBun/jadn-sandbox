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

  const validOptions = () => {
    return Object.keys(FieldOptionInputArgs).map((key: string) => {
      return (
        <KeyValueEditor
          key={key}
          id={id}
          name={key}
          {...FieldOptionInputArgs[key]}
          placeholder={key}
          removable={false}
          change={val => change([key, val], 'field')}
          value={deserializedState[key]}
        />
      );
    });
  };

  if (fieldOptions) {
    return (
      <>
        {validOptions()}
      </>
    );
  }
  return '';
});

export default FieldOptionsEditor;