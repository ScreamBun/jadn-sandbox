import React, { useState } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import {
  OptionTypes, Val, opts2arr, opts2obj
} from './consts';
import TypeOptionsEditor from './TypeOptionsEditor';
import FieldOptionsEditor from './FieldOptionsEditor';
import { objectFromTuple } from '../../../../../utils';

// Interface
interface OptionsModalProps {
  toggleModal: (e: React.MouseEvent<HTMLButtonElement>) => void;
  saveModal: (_v: Array<string>) => void;
  isOpen: boolean;
  fieldOptions?: boolean;
  optionValues: Array<string>;
  optionType?: string;
}

// convert array into options data state object
const deserializeOptions = (options: Array<string>) => {
  const opts = opts2obj(options);
  const fieldOpts = OptionTypes.field.filter(opt => opt in opts).map<[string, string | number | boolean]>(opt => [opt, opts[opt]]);
  const typeOpts = OptionTypes.type.filter(opt => opt in opts).map<[string, string | number | boolean]>(opt => [opt, opts[opt]]);
  return {
    field: objectFromTuple(...fieldOpts),
    type: objectFromTuple(...typeOpts)
  };
}

// convert options data state object into formatted array
const serializeOptions = (type: Record<string | number, string | number | boolean>, field: Record<string | number, string | number | boolean>) => {
  return [
    ...opts2arr(type),  // Type Options
    ...opts2arr(field)  // Field Options
  ];
}

// Component
const OptionsModal = (props: OptionsModalProps) => {

  const { optionValues, saveModal, fieldOptions, isOpen, optionType, toggleModal } = props;
  const [data, setData] = useState(deserializeOptions(optionValues));

  const saveOptions = (state: Val, type: 'field' | 'type') => {
    setData(data => ({
      ...data,
      [type]: {
        ...data[type],
        [state[0]]: state[1]
      }
    }))
  }

  const saveData = () => {
    saveModal(serializeOptions(data['type'], data['field']))
  }

  return (
    <Modal size="xl" isOpen={isOpen}>
      <ModalHeader>
        {fieldOptions ? 'Field' : 'Type'}
        &nbsp;
        Options
      </ModalHeader>
      <ModalBody>
        <FieldOptionsEditor
          deserializedState={data['field']}
          change={saveOptions}
          fieldOptions={fieldOptions}
        />
        <TypeOptionsEditor
          deserializedState={data['type']}
          change={saveOptions}
          optionType={optionType}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="success" onClick={saveData}>Save</Button>
        <Button color="secondary" onClick={toggleModal}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}

OptionsModal.defaultProps = {
  fieldOptions: false,
  optionType: ''
};

export default OptionsModal;
