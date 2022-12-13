import React, { ChangeEvent, Component } from 'react';
import equal from 'fast-deep-equal';
import {
  Button, ButtonGroup, FormGroup, Input, InputGroup, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

import { StandardFieldKeys, StandardFieldObject, PrimitiveTypeObject, TypeKeys } from './consts';
import OptionsModal from './options';
import { zip } from '../../../../utils';

// Interface
interface PrimitiveEditorProps {
  dataIndex: number;
  value: Array<any>;
  change: (v: any, i: number) => void;
  remove: (i: number) => void;
}

interface PrimitiveEditorState {
  value: StandardFieldObject | PrimitiveTypeObject;
  modal: boolean;
}

// Primitive Editor
class PrimitiveEditor extends Component<PrimitiveEditorProps, PrimitiveEditorState> {
  constructor(props: PrimitiveEditorProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.removeAll = this.removeAll.bind(this);
    this.saveModal = this.saveModal.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    const { value } = this.props;
    let valueObj: StandardFieldObject | PrimitiveTypeObject;
    if (Number.isInteger(value[0])) {
      valueObj = zip(StandardFieldKeys, value) as StandardFieldObject;
    } else {
      valueObj = zip(TypeKeys, value) as PrimitiveTypeObject;
    }

    this.state = {
      value: valueObj,
      modal: false
    };
  }

  componentDidMount() {
    this.initState();
  }

  onChange(e: ChangeEvent<HTMLInputElement>) {
    const { placeholder, value } = e.target;
    const key = placeholder.toLowerCase();

    this.setState(prevState => ({
      value: {
        ...prevState.value,
        [key]: value
      }
    }), () => {
      const { change, dataIndex } = this.props;
      // eslint-disable-next-line react/destructuring-assignment
      change(this.state.value, dataIndex);
    });
  }

  initState() {
    const { value } = this.props;
    if (value && Array.isArray(value)) {
      const updatevalue = zip(TypeKeys, value);

      // eslint-disable-next-line react/destructuring-assignment
      if (!equal(updatevalue, this.state.value)) {
        this.setState(prevState => ({
          value: {
            ...prevState.value,
            ...updatevalue
          }
        }));
      }
    }
  }

  removeAll() {
    const { dataIndex, remove } = this.props;
    remove(dataIndex);
  }

  toggleModal() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  saveModal(data: Array<string>) {
    this.toggleModal();

    this.setState(prevState => ({
      value: {
        ...prevState.value,
        options: data
      }
    }), () => {
      const { change, dataIndex } = this.props;
      // eslint-disable-next-line react/destructuring-assignment
      change(this.state.value, dataIndex);
    });
  }

  render() {
    const { modal, value } = this.state;

    return (
      <div className="border m-1 p-1">
        <ButtonGroup size="sm" className="float-right">
          <Button color="danger" onClick={this.removeAll} >
            <FontAwesomeIcon icon={faMinusCircle} />
          </Button>
        </ButtonGroup>

        <div className="border-bottom mb-2">
          <h3 className="col-sm-10 my-1">{`${value.name}(${value.type})`}</h3>
        </div>

        <div className="row m-0">
          <FormGroup className="col-md-4">
            <Label>Name</Label>
            <Input type="text" placeholder="Name" value={value.name} onChange={this.onChange} />
          </FormGroup>

          <FormGroup className="col-md-2">
            <Label>&nbsp;</Label>
            <InputGroup>
              <Button outline color="info" onClick={this.toggleModal}>Type Options</Button>
              <OptionsModal
                optionValues={value.options}
                isOpen={modal}
                optionType={value.type}
                toggleModal={this.toggleModal}
                saveModal={this.saveModal}
              />
            </InputGroup>
          </FormGroup>

          <FormGroup className="col-md-6">
            <Label>Comment</Label>
            <Input
              type="textarea"
              placeholder="Comment"
              rows={1}
              value={value.comment}
              onChange={this.onChange}
            />
          </FormGroup>
        </div>
      </div>
    );
  }
}

export default PrimitiveEditor;
