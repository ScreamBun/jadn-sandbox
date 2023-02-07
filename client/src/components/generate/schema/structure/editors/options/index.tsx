import React, { Component } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';

import {
  OptionTypes, Val, opts2arr, opts2obj
} from './consts';
import TypeOptionsEditor from './type_opts';
import FieldOptionsEditor from './field_opts';
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

interface OptionsModalState {
  field: Record<string|number, string|number|boolean>;
  type: Record<string|number, string|number|boolean>;
}

// Component
class OptionsModal extends Component<OptionsModalProps, OptionsModalState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    fieldOptions: false,
    optionType: ''
  };

  constructor(props: OptionsModalProps) {
    super(props);
    this.saveModal = this.saveModal.bind(this);
    this.saveOptions = this.saveOptions.bind(this);

    const { optionValues } = this.props;
    this.state = this.deserializeOptions(optionValues);
  }

  // convert array into options data state object
  // eslint-disable-next-line class-methods-use-this
  deserializeOptions(options: Array<string>) {
    const opts = opts2obj(options);
    const fieldOpts = OptionTypes.field.filter(opt => opt in opts).map<[string, string|number|boolean]>(opt => [opt, opts[opt]]);
    const typeOpts = OptionTypes.type.filter(opt => opt in opts).map<[string, string|number|boolean]>(opt => [opt, opts[opt]]);
    return {
      field: objectFromTuple(...fieldOpts),
      type: objectFromTuple(...typeOpts)
    };
  }

  // convert options data state object into formatted array
  serializeOptions() {
    const { field, type } = this.state;
    return [
      ...opts2arr(type),  // Type Options
      ...opts2arr(field)  // Field Options
    ];
  }

  saveOptions(state: Val, type: 'field'|'type') {
    this.setState(prevState => ({
      [type]: {
        ...prevState[type],
        [state[0]]: state[1]
      }
    }));
  }

  saveModal() {
    const { saveModal } = this.props;
    saveModal(this.serializeOptions());
  }

  render() {
    const {
      fieldOptions, isOpen, optionType, toggleModal
    } = this.props;
    const { field, type } = this.state;
    return (
      <Modal size="xl" isOpen={ isOpen }>
        <ModalHeader>
          { fieldOptions ? 'Field' : 'Type' }
          &nbsp;
          Options
        </ModalHeader>
        <ModalBody>
          <FieldOptionsEditor
            deserializedState={ field }
            change={ this.saveOptions }
            fieldOptions={ fieldOptions }
          />
          <TypeOptionsEditor
            deserializedState={ type }
            change={ this.saveOptions }
            optionType={ optionType }
          />
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={ this.saveModal }>Save</Button>
          <Button color="secondary" onClick={ toggleModal }>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default OptionsModal;
