import React, { FunctionComponent } from 'react';
import { FieldOptions, OptionChange } from './consts';
import KeyValueEditor from '../key_value';

// Interfaces
interface FieldOptionsEditorProps {
  id: string;
  fieldOptions?: boolean;
  deserializedState: Record<string, any>;
  change: OptionChange;
  placeholder?: string;
}

const defaultProps = {
  fieldOptions: false,
  placeholder: 'Set Field Options'
};

// Field Options Editor
const FieldOptionsEditor: FunctionComponent<FieldOptionsEditorProps> = props => {
  const {
    change, deserializedState, fieldOptions, id
  } = props;

  const validOptions = () => {
    return Object.keys(FieldOptions).map(key => {
      return (
        <KeyValueEditor
          key={ key }
          id={ key }
          { ...FieldOptions[key] }
          placeholder={ key }
          removable={ false }
          change={ val => change([key, val], 'field') }
          value={ deserializedState[key] }
        />
      );
    });
  };

  if (fieldOptions) {
    return (
      <div className="border m-1 p-1">
        <div className="border-bottom mb-2">
          <p className="col-sm-4 my-1"><strong>{ id }</strong></p>
        </div>
        <div className="col-12 m-0">
          { validOptions() }
        </div>
      </div>
    );
  }
  return '';
};

FieldOptionsEditor.defaultProps = defaultProps;

export default FieldOptionsEditor;
