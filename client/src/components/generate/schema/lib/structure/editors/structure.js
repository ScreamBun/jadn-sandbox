import React, { Component } from 'react';
import {
  Button, ButtonGroup, Collapse, FormGroup, Input, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faMinusCircle, faPlus } from '@fortawesome/free-solid-svg-icons';

import FieldEditor, { StandardField, EnumeratedField } from './field';

// Structure Editor
class StructureEditor extends Component {
  fieldStyles = {
    maxHeight: '20em',
    overflowY: 'scroll'
  }

  constructor(props) {
    super(props);
    this.addField = this.addField.bind(this);
    this.onChange = this.onChange.bind(this);
    this.removeAll = this.removeAll.bind(this);
    this.toggleFields = this.toggleFields.bind(this);

    this.state = {
      fieldCollapse: false,
      values: {
        name: '',
        type: '',
        options: [],
        comment: '',
        fields: []
      }
    };
  }

  componentDidMount() {
    this.initState();
  }

  onChange(e) {
    const { placeholder, value } = e.target;
    const key = placeholder.toLowerCase();
    let val = value;
    if (key === 'options') {
      val = value.split(/,\s+?/);
    }

    this.setState(prevState => ({
      values: {
        ...prevState.values,
        [key]: val
      }
    }), () => {
      const { change, dataIndex } = this.props;
      const { values } = this.state;
      if (change) {
        change(values, dataIndex);
      }
    });
  }

  initState() {
    const { value } = this.props;
    const { values } = this.state;
    if (value && typeof(value) === 'object') {
      const [ name, type, options, comments, fields ] = value;
      const updateValues = {};
      if (name !== values.name) updateValues.name = name;
      if (type !== values.type) updateValues.type = type;
      if (options !== values.options) updateValues.options = options;
      if (comments !== values.comment) updateValues.comment = comments;
      if (fields !== values.fields) updateValues.fields = fields;

      if (Object.keys(updateValues).length > 0) {
        this.setState(prevState => ({
          values: {
            ...prevState.values,
            ...updateValues
          }
        }));
      }
    }
  }

  removeAll(_e) {
    const { dataIndex, remove } = this.props;
    remove(dataIndex);
  }

  addField() {
    const { change, dataIndex } = this.props;
    const { values } = this.state;
    console.log('Add Field', values.type);
    const field = Object.values(((values.type.toLowerCase() === 'enumerated') ? EnumeratedField : StandardField));
    console.log(field);

    this.setState(prevState => {
      const tmpFields = [ ...prevState.values.fields, field ];
      console.log(tmpFields);
      return {
        fieldCollapse: true,
        values: {
          ...prevState.values,
          fields: tmpFields
        }
      };
    }, () => {
      change(values, dataIndex);
    });
  }

  toggleFields() {
    this.setState(prevState => ({
      fieldCollapse: !prevState.fieldCollapse
    }));
  }

  render() {
    const { change, dataIndex } = this.props;
    const { fieldCollapse, values } = this.state;
    setTimeout(() => this.initState(), 100);
    const structureFields = (values.fields || []).map((f, i) => (
      <FieldEditor
        key={ i }
        dataIndex={ i }
        enumerated={ values.type.toLowerCase() === 'enumerated' }
        value={ f }
        change={ (val, idx) => this.setState(prevState => {
          const tmpFields = [ ...prevState.values.fields ];
          tmpFields[idx] = val;
          return {
            values: {
              ...prevState.values,
              fields: tmpFields
            }
          };
        }, () => {
          if (change) {
            change(values, dataIndex);
          }
        }) }
        remove={ idx => {
          if (this.state.values.fields.length >= idx) {
            this.setState(prevState => {
              const tmpFields = [ ...prevState.values.fields ];
              tmpFields.splice(idx, 1);
              return {
                values: {
                  ...prevState.values,
                  fields: tmpFields
                }
              };
            }, () => {
              if (change) {
                change(values, dataIndex);
              }
            });
          }
        } }
      />
    ));

    return (
      <div className='border m-1 p-1'>
        <ButtonGroup size='sm' className='float-right'>
          <Button color='danger' onClick={ this.removeAll } >
            <FontAwesomeIcon icon={ faMinusCircle } />
          </Button>
        </ButtonGroup>
        <div className='border-bottom mb-2'>
          <h3 className='col-sm-10 my-1'>{ values.type } - { values.name }</h3>
        </div>
        <div className='row m-0'>
          <FormGroup className='col-md-4'>
            <Label>Name</Label>
            <Input type='string' placeholder='Name' value={ values.name } onChange={ this.onChange } />
          </FormGroup>
          <FormGroup className='col-md-4'>
            <Label>Options</Label>
            <Input type='string' placeholder='Options' value={ values.options.join(', ') } onChange={ this.onChange } />
          </FormGroup>
          <FormGroup className='col-md-4'>
            <Label>Comment</Label>
            <Input type='textarea' placeholder='Comment' rows={ 1 } value={ values.comment } onChange={ this.onChange } />
          </FormGroup>
          <FormGroup tag='fieldset' className='col-12 border'>
            <legend>
              Fields
              <ButtonGroup size='sm' className='float-right'>
                <Button color='primary' onClick={ this.addField } >
                  <FontAwesomeIcon icon={ faPlus } />
                  &nbsp;
                  Field
                </Button>
                <Button color={ fieldCollapse ? 'warning' : 'success' } onClick={ this.toggleFields } >
                  <FontAwesomeIcon icon={ fieldCollapse ? faMinus : faPlus } />
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

StructureEditor.defaultProps = {
  dataIndex: -1,
  values: {
    name: '',
    type: '',
    options: [],
    comment: '',
    fields: []
  },
  change: (vals, idx) => {
    console.log(vals, idx);
  },
  remove: idx => {
    console.log(idx);
  }
};

export default StructureEditor;
