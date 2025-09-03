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

  // Separate checkbox options from others
  const checkboxKeys = Object.keys(FieldOptionInputArgs).filter(
    key => FieldOptionInputArgs[key].type === 'checkbox' || FieldOptionInputArgs[key].type === 'radio'
  );
  const otherKeys = Object.keys(FieldOptionInputArgs).filter(
    key => FieldOptionInputArgs[key].type !== 'checkbox' && FieldOptionInputArgs[key].type !== 'radio'
  );

  const checkboxOptions = checkboxKeys.map(key => (
    <div key={key} className="col-md-3">
      <KeyValueEditor
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
    </div>
  ));

  const otherOptions = otherKeys.map(key => (
    <div key={key} className="col-md-6">
      <KeyValueEditor
        key={key}
        id={id}
        name={key}
        {...FieldOptionInputArgs[key]}
        placeholder={key}
        removable={false}
        change={val => change([key, val], 'field')}
        value={deserializedState[key]}
        labelColumns={4}
        fieldColumns={7}
      />
    </div>
  ));

  if (fieldOptions) {
    return (
      <>
        <div className="d-flex flex-wrap align-items-center mb-2">
          {otherOptions}
        </div>
        <div className="d-flex flex-wrap align-items-start mb-2">
          {checkboxOptions}
        </div>
      </>
    );
  }
  return '';
});

export default FieldOptionsEditor;