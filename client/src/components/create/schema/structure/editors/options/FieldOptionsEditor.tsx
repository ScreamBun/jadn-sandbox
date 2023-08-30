import React, { memo } from 'react';
import { FieldOptionInputArgs, OptionChange } from './consts';
import KeyValueEditor from '../KeyValueEditor';

interface FieldOptionsEditorProps {
  id: string;
  fieldOptions?: boolean;
  deserializedState: Record<string, any>;
  change: OptionChange;
  placeholder?: string;
}

const FieldOptionsEditor = memo(function FieldOptionsEditor(props: FieldOptionsEditorProps) {
  const { change, deserializedState, fieldOptions, id } = props;

  const validOptions = () => {
    return Object.keys(FieldOptionInputArgs).map(key => {
      return (
        <KeyValueEditor
          key={key}
          id={key}
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
  }
  return '';
});

FieldOptionsEditor.defaultProps = {
  fieldOptions: false,
  placeholder: 'Set Field Options'
};

export default FieldOptionsEditor;