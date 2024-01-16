import React, { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  OptionTypes, Val, opts2arr, opts2obj, RequiredOptions
} from './consts';
import { objectFromTuple } from '../../../../../utils';
import { ModalSize } from './ModalSize';
import { sbToastError } from 'components/common/SBToast';
import TypeOptionsEditor from './TypeOptionsEditor';
import FieldOptionsEditor from './FieldOptionsEditor';

// Interface
interface OptionsModalProps {
  id: string;
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

  const { id, optionValues, saveModal, fieldOptions = false, isOpen, optionType = '', toggleModal, modalSize = ModalSize.md } = props;
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
        if (collectionType[i] in data['type'] && data['type'][collectionType[i]] == true) {
          collectionCount += 1;
          if (collectionCount > 1) {
            sbToastError('MUST NOT include more than one collection option (set, unique, or unordered)');
            return;
          }
        }
      }
    }

    //do not allow user to select regex format if pattern exists
    if (Object.keys(data['type']).includes('format') && Object.keys(data['type']).includes('pattern') &&
      (data['type']['pattern'] != undefined) && (data['type']['format'] == 'regex')) {
      sbToastError('May only allow one of the following type options: pattern or format of regex.');
      return;
    }

    saveModal(serializeOptions(data['type'], data['field']))
  }

  const toggleModalhere = () => {
    setData(tmpData);
    toggleModal();
  }

  const clearData = () => {
    setData(deserializeOptions([]));
  }

  return (
    <>
      {createPortal(<div id="optionsModal" className={`modal fade ${isOpen ? 'show d-block' : 'd-none'}`} tabIndex={-1} role='dialog'>
        <div className={`modal-dialog modal-dialog-centered ${modalSize}`} role='document'>
          <div className='modal-content p-2'>
            <div className="modal-header">
              <h5 className='modal-title'>
                {fieldOptions ? 'Field' : 'Type'} Options
              </h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' title='Close' onClick={toggleModalhere} />
            </div>
            <div className="modal-body">
              <FieldOptionsEditor
                id={id}
                deserializedState={data['field']}
                change={saveOptions}
                fieldOptions={fieldOptions}
              />
              <TypeOptionsEditor
                id={id}
                deserializedState={data['type']}
                change={saveOptions}
                optionType={optionType}
              />
            </div>
            <hr />
            <div className='row'>
              <div className='col-sm-12 p2'>
                <button type="button" className='btn btn-secondary float-start' onClick={clearData}>Clear</button>
                <button type='button' className='btn btn-success float-end' onClick={saveData}>Save</button>
                <button type='button' className='btn btn-secondary float-end mx-2' data-bs-dismiss='modal' onClick={toggleModalhere}>Close</button>
              </div>
            </div>
          </div>
        </div>
        <div className={`modal-backdrop fade ${isOpen ? 'show' : ''}`} style={{
          zIndex: -1
        }}></div>
      </div>,
        document.body)}
    </>
  );
});

export default OptionsModal;
