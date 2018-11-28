import React, { Component } from 'react'

import { Button, ButtonGroup, Collapse, FormGroup, Input, Label } from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faMinus,
    faMinusCircle,
    faMinusSquare,
    faPlus,
    faPlusSquare
} from '@fortawesome/free-solid-svg-icons'

import FieldEditor, { StandardField, EnumeratedField } from './field'

// Structure Editor
class StructureEditor extends Component {
    constructor(props, context) {
        super(props, context)

        this.removeAll = this.removeAll.bind(this)
        this.onChange = this.onChange.bind(this)
        this.toggleFields = this.toggleFields.bind(this)
        this.addField = this.addField.bind(this)

        this.state = {
            fieldCollapse: false,
            values: {
                name: '',
                type: '',
                options: [],
                comment: '',
                fields: []
            }
        }

        this.fieldStyles = {
            maxHeight: 20+'em',
            overflowY: 'scroll'
        }
    }

    componentDidMount() {
        this.initState()
    }

    initState() {
        if (this.props.value && typeof(this.props.value) === 'object') {
            let updateValues = {}
            if (this.props.value[0] !== this.state.values.name) updateValues.name = this.props.value[0]
            if (this.props.value[1] !== this.state.values.type) updateValues.type = this.props.value[1]
            if (this.props.value[2] !== this.state.values.options) updateValues.options = this.props.value[2]
            if (this.props.value[3] !== this.state.values.comment) updateValues.comment = this.props.value[3]
            if (this.props.value[4] !== this.state.values.fields) updateValues.fields = this.props.value[4]

            if (Object.keys(updateValues).length > 0) {
                this.setState(prevState => ({
                    values: {
                        ...prevState.values,
                        ...updateValues
                    }
                }))
            }
        }
    }

    removeAll(e) {
        this.props.remove(this.props.dataIndex)
    }

    addField() {
        console.log('Add Field', this.state.values.type)
        let field = Object.values(((this.state.values.type.toLowerCase() === 'enumerated') ? EnumeratedField : StandardField))
        console.log(field)

        this.setState(prevState => {
            let tmpFields = [ ...prevState.values.fields, field ]
            console.log(tmpFields)
            return {
                fieldCollapse: true,
                values: {
                    ...prevState.values,
                    fields: tmpFields
                }
            }
        }, () => {
            this.props.change(this.state.values, this.props.dataIndex)
        })
    }

    onChange(e) {
        let key = e.target.placeholder.toLowerCase()
        let value = e.target.value
        if (key === 'options') {
            value = value.split(/,\s+?/)
        }

        this.setState(prevState => ({
            values: {
                ...prevState.values,
                [key]: value
            }
        }), () => {
            if (this.props.change) {
                this.props.change(this.state.values, this.props.dataIndex)
            }
        })
    }

    toggleFields() {
        this.setState({
            fieldCollapse: !this.state.fieldCollapse
        })
    }

    render() {
        setTimeout(() => this.initState(), 100)
        let structureFields = (this.state.values.fields || []).map((f, i) => (
            <FieldEditor
                key={ i }
                dataIndex={ i }
                enumerated={ this.state.values.type.toLowerCase() === 'enumerated' }
                value={ f }
                change={ (val, idx) => this.setState((prevState) => {
                    let tmpFields = [ ...prevState.values.fields ]
                    tmpFields[idx] = val
                    return {
                        values: {
                            ...prevState.values,
                            fields: tmpFields
                        }
                    }
                }, () => {
                    if (this.props.change) {
                        this.props.change(this.state.values, this.props.dataIndex)
                    }
                })}
                remove={ (idx) => {
                    if (this.state.values.fields.length >= idx) {
                        this.setState((prevState) => {
                            let tmpFields = [ ...prevState.values.fields ]
                            tmpFields.splice(idx, 1)
                            return {
                                values: {
                                    ...prevState.values,
                                    fields: tmpFields
                                }
                            }
                        }, () => {
                            if (this.props.change) {
                                this.props.change(this.state.values, this.props.dataIndex)
                            }
                        })
                    }
                }}
            />
        ))

        return (
            <div className='border m-1 p-1'>
                <ButtonGroup size='sm' className='float-right'>
                    <Button color='danger' onClick={ this.removeAll } >
                        <FontAwesomeIcon
                            icon={ faMinusCircle }
                        />
                    </Button>
                 </ButtonGroup>

                <div className='border-bottom mb-2'>
                    <h3 className='col-sm-10 my-1'>{ this.state.values.type } - { this.state.values.name }</h3>
                </div>

                <div className='row m-0'>
                    <FormGroup className='col-md-4'>
                        <Label>Name</Label>
                        <Input type='string' placeholder='Name' value={ this.state.values.name } onChange={ this.onChange } />
                    </FormGroup>

                    <FormGroup className='col-md-4'>
                        <Label>Options</Label>
                        <Input type='string' placeholder='Options' value={ this.state.values.options.join(', ') } onChange={ this.onChange } />
                    </FormGroup>

                    <FormGroup className='col-md-4'>
                        <Label>Comment</Label>
                        <Input type='textarea' placeholder='Comment' rows={ 1 } value={ this.state.values.comment } onChange={ this.onChange } />
                    </FormGroup>

                    <FormGroup tag='fieldset' className='col-12 border'>
                        <legend>
                            Fields
                            <ButtonGroup size='sm' className='float-right'>
                                <Button color='primary' onClick={ this.addField } >
                                    <FontAwesomeIcon
                                        icon={ faPlus }
                                    /> Field
                                </Button>
                                <Button color={ this.state.fieldCollapse ? 'warning' : 'success' } onClick={ this.toggleFields } >
                                    <FontAwesomeIcon
                                        icon={ this.state.fieldCollapse ? faMinus : faPlus }
                                    />
                                </Button>
                            </ButtonGroup>
                        </legend>

                        <Collapse isOpen={ this.state.fieldCollapse }>
                            { structureFields }
                        </Collapse>
                        {
                            !this.state.fieldCollapse && structureFields.length > 0 ? (
                                <p>Expand to view/edit fields</p>
                            ) : ''

                        }
                    </FormGroup>
                </div>
            </div>
        )
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
        console.log(vals, idx)
    },
    remove: (idx) => {
        console.log(idx)
    }
}

export default StructureEditor