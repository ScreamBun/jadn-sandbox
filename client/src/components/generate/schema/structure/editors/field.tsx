import React, { ChangeEvent, Component } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import equal from 'fast-deep-equal';
import {
  Button, ButtonGroup, FormGroup, Input, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import {
  FieldObject, EnumeratedFieldObject, EnumeratedFieldKeys, StandardFieldKeys, StandardFieldObject
} from './consts';
import OptionsModal from './options';
import { EnumeratedFieldArray, FieldArray, StandardFieldArray } from '../../interface';
import { objectValues, splitCamel, zip } from '../../../../utils';
import { RootState } from '../../../../../reducers';

// Interface
interface FieldEditorProps {
  enumerated?: boolean;
  dataIndex: number;
  value: EnumeratedFieldArray|StandardFieldArray;
  change: (_v: EnumeratedFieldArray|StandardFieldArray, _i: number) => void;
  remove: (_i: number) => void;
}

interface FieldEditorState {
  modal: boolean;
  value: FieldObject;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  allTypes: [...state.Generate.types.base, ...Object.keys(state.Generate.types.schema)],
  types: {
    base: state.Generate.types.base,
    schema: Object.keys(state.Generate.types.schema)
  }
});

const connector = connect(mapStateToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type FieldEditorConnectedProps = FieldEditorProps & ConnectorProps;

// Field Editor
class FieldEditor extends Component<FieldEditorConnectedProps, FieldEditorState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    enumerated: false
  };

  fieldKeys: Array<string>;

  constructor(props: FieldEditorConnectedProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.removeAll = this.removeAll.bind(this);
    this.saveModal = this.saveModal.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    const { enumerated, value } = this.props;
    this.fieldKeys = enumerated ? EnumeratedFieldKeys : StandardFieldKeys;

    this.state = {
      value: zip(this.fieldKeys, value) as FieldObject,
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
      change(objectValues(this.state.value as Record<string, any>) as FieldArray, dataIndex);  // eslint-disable-line react/destructuring-assignment
    });
  }

  onSelectChange(e: ChangeEvent<HTMLInputElement>) {
    const { target } = e.nativeEvent;
    if (target) {
      const { value } = e.target;
      const key = target.name.toLowerCase();

      this.setState(prevState => ({
        value: {
          ...prevState.value,
          [key]: value
        }
      }), () => {
        const { change, dataIndex } = this.props;
        // eslint-disable-next-line react/destructuring-assignment
        change(objectValues(this.state.value as Record<string, any>)as FieldArray, dataIndex);
      });
    }
  }

  initState() {
    const { value } = this.props;
    if (value && Array.isArray(value)) {
      const updatevalue = zip(this.fieldKeys, value);

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
      const { value } = this.state;
      // eslint-disable-next-line react/destructuring-assignment
      change(objectValues(value as Record<string, any>), dataIndex);
    });
  }

  makeOptions() {
    const { allTypes, enumerated, types } = this.props;
    const { modal, value } = this.state;

    if (enumerated) {
      const val = value as EnumeratedFieldObject;
      return (
        <FormGroup className="col-md-4">
          <Label>Value</Label>
          <Input type="text" placeholder="Value" value={ val.value } onChange={ this.onChange } />
        </FormGroup>
      );
    }

    const options = Object.keys(types).map(optGroup => (
      <optgroup key={ optGroup } label={ splitCamel(optGroup) } >
        { types[optGroup as 'base'|'schema'].map(opt => <option key={ opt } value={ opt } >{ opt }</option> ) }
      </optgroup>
    ));
    const val = value as StandardFieldObject;
    const v = allTypes.includes(val.type) ? val.type : 'Null';

    return (
      <div className="col-md-10 p-0 m-0">
        <FormGroup className="col-md-4 d-inline-block">
          <Label>Name</Label>
          <Input type="text" placeholder="Name" value={ val.name } onChange={ this.onChange } />
        </FormGroup>

        <FormGroup className="col-md-4 d-inline-block">
          <Label>Type</Label>
          <Input type="select" name="Type" value={ v } onChange={ this.onSelectChange } >
            { options }
          </Input>
        </FormGroup>

        <FormGroup className="col-md-4 d-inline-block">
          <Button outline color="info" onClick={ this.toggleModal }>Field Options</Button>
          <OptionsModal
            optionValues={ val.options }
            isOpen={ modal }
            saveModal={ this.saveModal }
            toggleModal={ this.toggleModal }
            optionType={ val.type }
            fieldOptions
          />
        </FormGroup>
      </div>
    );
  }

  render() {
    const { enumerated } = this.props;
    const { value } = this.state;
    let key: number|string = '';
    if (enumerated) {
      key = (value as EnumeratedFieldObject).value;
    } else {
      key = (value as StandardFieldObject).name;
    }

    return (
      <div className="col-sm-12 border m-1 p-1">
        <ButtonGroup size="sm" className="float-right">
          <Button color="danger" onClick={ this.removeAll } >
            <FontAwesomeIcon icon={ faMinusCircle } />
          </Button>
        </ButtonGroup>

        <div className="border-bottom mb-2">
          <p className="col-sm-4 my-1"><strong>{ key }</strong></p>
        </div>

        <div className="row m-0">
          <FormGroup className={ enumerated ? 'col-md-3' : 'col-md-2' }>
            <Label>ID</Label>
            <Input type="number" placeholder="ID" value={ value.id } onChange={ this.onChange } />
          </FormGroup>

          { this.makeOptions() }

          <FormGroup className={ enumerated ? 'col-md-4' : 'col-md-12' }>
            <Label>Comment</Label>
            <Input
              type="textarea"
              placeholder="Comment"
              rows={ 1 }
              value={ value.comment }
              onChange={ this.onChange }
            />
          </FormGroup>
        </div>
      </div>
    );
  }
}

export default connector(FieldEditor);
