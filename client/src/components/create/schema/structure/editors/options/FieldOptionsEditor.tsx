import React, { memo } from 'react';
import { FieldOptionInputArgs, OptionChange } from './consts';
import KeyValueEditor from '../KeyValueEditor';

interface FieldOptionsEditorProps {
  id?: string;
  deserializedState: Record<string, any>;
  change: OptionChange;
  placeholder?: string;
}

const FieldOptionsEditor = memo(function FieldOptionsEditor(props: FieldOptionsEditorProps) {
  const { change, deserializedState, id } = props;

  const validOptions = () => {
    return Object.keys(FieldOptionInputArgs).map(key => {
      return (
          <KeyValueEditor
            key={key}
            id={key}
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

  return (
      <>
        <div className='row'>
          <div className='col-md-12'>
            <strong>{id}</strong>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-12'>
            {validOptions()}  
          </div>
        </div>
      </>
  );
});

FieldOptionsEditor.defaultProps = {
  fieldOptions: false,
  placeholder: 'Set Field Options'
};

export default FieldOptionsEditor;