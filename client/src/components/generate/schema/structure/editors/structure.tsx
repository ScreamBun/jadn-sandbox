import React, { ChangeEvent, Component } from 'react';
import equal from 'fast-deep-equal';
import {
  Button, ButtonGroup, Collapse, FormGroup, Input, InputGroup, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import { PrimitiveTypeObject, TypeKeys } from './consts';
import OptionsModal from './options';
import FieldEditor from './field';
import {
  EnumeratedFieldArray, FieldArray, StandardFieldArray, TypeArray
} from '../../interface';
import { zip } from '../../../../utils';

// Interface
interface StructureEditorProps {
  dataIndex: number;
  value: TypeArray;
  change: (v: PrimitiveTypeObject, i: number) => void;
  remove: (i: number) => void;
}

interface StructureEditorState {
  fieldCollapse: boolean;
  value: {
    name: string;
    type: string;
    options: Array<string>;
    comment: string;
    fields: Array<FieldArray>
  };
  modal: boolean;
}

// Structure Editor
class StructureEditor extends Component<StructureEditorProps, StructureEditorState> {
  constructor(props: StructureEditorProps) {
    super(props);
    this.addField = this.addField.bind(this);
    this.onChange = this.onChange.bind(this);
    this.removeAll = this.removeAll.bind(this);
    this.saveModal = this.saveModal.bind(this);
    this.toggleFields = this.toggleFields.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    const { value } = this.props;
    this.state = {
      fieldCollapse: false,
      value: zip(TypeKeys, value) as StructureEditorState['value'],
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

  addField() {
    const { value } = this.state;
    const { fields } = value;
    if (fields.some(f => f[1] !== 'name') || fields.length === 0) {
      let field: EnumeratedFieldArray|StandardFieldArray;
      if (value.type.toLowerCase() === 'enumerated') {
        field = [fields.length+1, 'name', 'comment'] as EnumeratedFieldArray;
      } else {
        field = [fields.length+1, 'name', 'type', [], 'comment'] as StandardFieldArray;
      }

      this.setState(prevState => {
        return {
          fieldCollapse: true,
          value: {
            ...prevState.value,
            fields: [ ...prevState.value.fields, field ]
          }
        };
      }, () => {
        const { change, dataIndex } = this.props;
        // eslint-disable-next-line react/destructuring-assignment
        change(this.state.value, dataIndex);
      });
    }
  }

  toggleFields() {
    this.setState(prevState => ({
      fieldCollapse: !prevState.fieldCollapse
    }));
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

  makeFields() {
    const fieldChange = (val: FieldArray, idx: number) => this.setState(prevState => {
      const tmpFields = [ ...prevState.value.fields ];
      tmpFields[idx] = val;
      return {
        value: {
          ...prevState.value,
          fields: tmpFields
        }
      };
    }, () => {
      const { change, dataIndex } = this.props;
      console.log('Field change', this.state.value); // eslint-disable-line react/destructuring-assignment
      change(this.state.value, dataIndex);  // eslint-disable-line react/destructuring-assignment
    });

    const fieldRemove = (idx: number) => {
      if (this.state.value.fields.length >= idx) {  // eslint-disable-line react/destructuring-assignment
        this.setState(prevState => {
          const tmpFields = [ ...prevState.value.fields ];
          tmpFields.splice(idx, 1);
          return {
            value: {
              ...prevState.value,
              fields: tmpFields
            }
          };
        }, () => {
          const { change, dataIndex } = this.props;
          change(this.state.value, dataIndex);  // eslint-disable-line react/destructuring-assignment
        });
      }
    };

    // eslint-disable-next-line react/destructuring-assignment
    const { fields, name, type } = this.state.value;
    return fields?.map((f, i) => {
      return (
        <FieldEditor
          key={ `${name}.${f[1]}` }
          dataIndex={ i }
          enumerated={ type.toLowerCase() === 'enumerated' }
          value={ f }
          change={ fieldChange }
          remove={ fieldRemove }
        />
      );
    });
  }

  render() {
    const { fieldCollapse, modal, value } = this.state;
    const structureFields = this.makeFields();

    return (
      <div className="border m-1 p-1">
        <ButtonGroup size="sm" className="float-right">
          <Button color="danger" onClick={ this.removeAll } >
            <FontAwesomeIcon icon={ faMinusCircle } />
          </Button>
        </ButtonGroup>

        <div className="border-bottom mb-2">
          <h3 className="col-sm-10 my-1">{ `${value.name}(${value.type})` }</h3>
        </div>

        <div className="row m-0">
          <FormGroup className="col-md-4">
            <Label>Name</Label>
            <Input type="text" placeholder="Name" value={ value.name } onChange={ this.onChange } />
          </FormGroup>

          <FormGroup className="col-md-2">
            <Label>&nbsp;</Label>
            <InputGroup>
              <Button outline color="info" onClick={ this.toggleModal }>Type Options</Button>
              <OptionsModal
                optionValues={ value.options }
                isOpen={ modal }
                optionType={ value.type }
                toggleModal={ this.toggleModal }
                saveModal={ this.saveModal }
              />
            </InputGroup>
          </FormGroup>

          <FormGroup className="col-md-6">
            <Label>Comment</Label>
            <Input type="textarea" placeholder="Comment" rows={ 1 } value={ value.comment } onChange={ this.onChange } />
          </FormGroup>

          <FormGroup tag="fieldset" className="col-12 border">
            <legend>
              Fields
              <ButtonGroup className="float-right">
                <Button color={ fieldCollapse ? 'warning' : 'success' } onClick={ this.toggleFields } >
                  <FontAwesomeIcon icon={ fieldCollapse ? faMinusCircle : faPlusCircle } />
                  &nbsp;
                  { fieldCollapse ? ' Hide' : ' Show' }
                </Button>
                <Button color="primary" onClick={ this.addField } >
                  <FontAwesomeIcon icon={ faPlusSquare } />
                  &nbsp;
                  Add
                </Button>
              </ButtonGroup>
            </legend>

            <Collapse isOpen={ fieldCollapse }>
              { structureFields }
            </Collapse>
            { !fieldCollapse && structureFields.length > 0 ? <p>Expand to view/edit fields</p> : '' }
          </FormGroup>
        </div>
      </div>
    );
  }
}

export default StructureEditor;
