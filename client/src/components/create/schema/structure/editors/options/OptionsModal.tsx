import React, { memo, useState } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import {
  OptionTypes, Val, opts2arr, opts2obj, RequiredOptions
} from './consts';
import TypeOptionsEditor from './TypeOptionsEditor';
import FieldOptionsEditor from './FieldOptionsEditor';
import { objectFromTuple } from '../../../../../utils';
import { sbToastError } from 'components/common/SBToast';
import { ModalSize } from './ModalSize';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

// Interface
interface OptionsModalProps {
  toggleModal: () => void;
  saveModal: (_v: Array<string>) => void;
  isOpen: boolean;
  fieldOptions?: boolean;
  optionValues: Array<string>;
  optionType?: string;
  modalSize?: string;
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
const OptionsModal = memo(function OptionsModal(props: OptionsModalProps) {

  const { optionValues, saveModal, fieldOptions, isOpen, optionType, toggleModal, modalSize = ModalSize.md } = props;
  const [data, setData] = useState(deserializeOptions(optionValues));
  const tmpData = { ...deserializeOptions(optionValues) };

  const saveOptions = (state: Val, type: 'field' | 'type') => {
    let typeOptVal: string | undefined;
    state[1] == '' ? typeOptVal = undefined : typeOptVal = state[1];

    //TODO: remove key from data if undefined
    const updatedData = {
      ...data,
      [type]: {
        ...data[type],
        [state[0]]: typeOptVal
      }
    }

    //MUST NOT include more than one collection option (set, unique, or unordered)
    const collectionType = ['unique', 'set', 'unordered'];
    let collectionCount = 0;
    if (optionType == 'ArrayOf') {
      for (let i = 0; i < collectionType.length; i++) {
        if (collectionType[i] in updatedData['type'] && updatedData['type'][collectionType[i]] != undefined) {
          collectionCount += 1;
        }
      }
      if (collectionCount > 1) {
        sbToastError('MUST NOT include more than one collection option (set, unique, or unordered)');
        return;
      }
    }

    setData(updatedData);
  }

  const saveData = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    //check for required fields
    let errCount = 0;

    if (RequiredOptions[optionType] && optionType in RequiredOptions) {
      for (let i = 0; i < RequiredOptions[optionType].length; i++) {
        if ((!Object.keys(data['type']).includes(RequiredOptions[optionType][i])) || (Object.keys(data['type']).includes(RequiredOptions[optionType][i]) && data['type'][RequiredOptions[optionType][i]] == undefined)) {
          sbToastError(RequiredOptions[optionType][i] + ' is required');
          errCount += 1;
        }
      }
    }
    if (errCount >= 1) {
      return;
    }

    //MUST NOT include more than one collection option (set, unique, or unordered)
    const collectionType = ['unique', 'set', 'unordered'];
    let collectionCount = 0;
    if (optionType == 'ArrayOf') {
      for (let i = 0; i < collectionType.length; i++) {
        if (collectionType[i] in data['type'] && data['type'][collectionType[i]] != undefined) {
          collectionCount += 1;
          if (collectionCount > 1) {
            sbToastError('MUST NOT include more than one collection option (set, unique, or unordered)');
            return;
          }
        }
      }
    }

    saveModal(serializeOptions(data['type'], data['field']))
  }

  const toggleModalhere = () => {
    setData(tmpData);
    toggleModal();
  }

  return (
    <Modal className={modalSize} isOpen={isOpen}>
      <ModalHeader>
        <div className='float-left'>
          {fieldOptions ? 'Field' : 'Type'} Options
        </div>
        <div className='float-right'>
          <Button color="secondary" className='float-right btn-sm' title='Close' onClick={toggleModalhere}>
            <FontAwesomeIcon icon={faClose} />
          </Button>
        </div>
      </ModalHeader>
      <ModalBody>
      { fieldOptions ?
        <FieldOptionsEditor
          deserializedState={data['field']}
          change={saveOptions}
          fieldOptions={fieldOptions} 
        />
        : 
        <TypeOptionsEditor
          deserializedState={data['type']}
          change={saveOptions}
          optionType={optionType}
        />
      }
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggleModalhere}>Close</Button>
        <Button color="success" onClick={saveData}>Save</Button>
      </ModalFooter>
    </Modal>
  );
});

OptionsModal.defaultProps = {
  fieldOptions: false,
  optionType: ''
};

export default OptionsModal;
