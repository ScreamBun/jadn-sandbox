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
  dataIndex: number; //index changes based on obj in arr (tracks the parent index)
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
  fields: Array<JSX.Element>;
  modal: boolean;
}

// Structure Editor
class StructureEditor extends Component<StructureEditorProps, StructureEditorState> {
  constructor(props: StructureEditorProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.addField = this.addField.bind(this);
    this.removeAll = this.removeAll.bind(this);
    this.toggleFields = this.toggleFields.bind(this);
    this.saveModal = this.saveModal.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    const { value } = this.props;
    this.state = {
      fieldCollapse: false,
      value: zip(TypeKeys, value) as StructureEditorState['value'],
      fields: [],
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
        this.setState(prevState => ({
          fields: prevState.value.fields.map((f, i) => this.makeField(f, i))
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
    let field: EnumeratedFieldArray | StandardFieldArray;
    const uid = new Date().getTime();
    if (value.type.toLowerCase() === 'enumerated') {
      field = [uid, '', ''] as EnumeratedFieldArray;
    } else {
      field = [uid, 'field name', 'Null', [], ''] as StandardFieldArray;
    }

    this.setState(prevState => {
      return {
        fieldCollapse: true,
        value: {
          ...prevState.value,
          fields: [...prevState.value.fields, field]
        },
        fields: [
          ...prevState.fields,
          this.makeField(field, prevState.fields.length)
        ]
      };
    }, () => {
      const { change, dataIndex } = this.props;
      // eslint-disable-next-line react/destructuring-assignment
      change(this.state.value, dataIndex);
    });
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

  makeField(field: FieldArray, field_idx: number) {
    const fieldChange = (val: FieldArray, idx: number) => this.setState(prevState => {
      const tmpFields = [...prevState.value.fields];
      tmpFields[idx] = val; //add field to end of arr
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

    const fieldRemove = (idx: number) => {
      if (this.state.value.fields.length >= idx) {
        // eslint-disable-line react/destructuring-assignment
        this.setState(prevState => {
          const tmpFieldValues = [...prevState.value.fields];
          const tmpFields = [...prevState.fields];

          if (idx + 1 == this.state.value.fields.length) {
            tmpFieldValues.pop();
          } else {
            tmpFieldValues.splice(idx, 1);
          }

          //remove at dataindex instead if index of array 
          tmpFields.filter((field) => field.props.dataIndex != idx)

          return {
            value: {
              ...prevState.value,
              fields: tmpFieldValues
            },
            fields: tmpFields
          };
        }, () => {
          const { change, dataIndex } = this.props;
          change(this.state.value, dataIndex);  // eslint-disable-line react/destructuring-assignment
        });
      }
    };

    // eslint-disable-next-line react/destructuring-assignment
    const { value } = this.state;
    const { type } = value;

    return (
      <FieldEditor
        key={field[0]}
        dataIndex={field_idx}
        enumerated={type.toLowerCase() === 'enumerated'}
        value={field}
        change={fieldChange}
        remove={fieldRemove}
      />
    );
  }

  render() {
    const {
      fieldCollapse, fields, modal, value
    } = this.state;

    if (fields.length !== value.fields.length) {
      setTimeout(() => {
        this.setState(prevState => ({
          fields: prevState.value.fields.map((f, i) => this.makeField(f, i))
        }));
      }, 250);
    }

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
            <Input type="textarea" placeholder="Comment" rows={1} value={value.comment} onChange={this.onChange} />
          </FormGroup>

          <FormGroup tag="fieldset" className="col-12 border">
            <legend>
              Fields
              <ButtonGroup className="float-right">
                <Button color={fieldCollapse ? 'warning' : 'success'} onClick={this.toggleFields} >
                  <FontAwesomeIcon icon={fieldCollapse ? faMinusCircle : faPlusCircle} />
                  &nbsp;
                  {fieldCollapse ? ' Hide' : ' Show'}
                </Button>
                <Button color="primary" onClick={this.addField} >
                  <FontAwesomeIcon icon={faPlusSquare} />
                  &nbsp;
                  Add
                </Button>
              </ButtonGroup>
            </legend>

            <Collapse isOpen={fieldCollapse}>
              {fields}
            </Collapse>
            {!fieldCollapse && fields.length > 0 ? <p>Expand to view/edit fields</p> : ''}
          </FormGroup>
        </div>
      </div>
    );
  }
}

export default StructureEditor;
