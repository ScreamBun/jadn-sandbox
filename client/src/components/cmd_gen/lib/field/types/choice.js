import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import Field from '../'

import {
    isOptional
} from '../../'

import * as GenActions from '../../../../../actions/generator'


class ChoiceField extends Component {
    constructor(props, context) {
        super(props, context)

        this.name = this.props.def[1]
        this.type = this.props.def[2]
        this.args = this.props.def[3]
        this.comment = this.props.def[4]

        this.typeDef = this.props.schema.types.filter((type) => { return type[0] == this.type })
        this.typeDef = this.typeDef.length === 1 ? this.typeDef[0] : []

        this.state = {
            selected: -1
        }

        this.msgName = (this.props.parent ? [this.props.parent, this.name] : [this.name]).join('.')
    }

    render() {
        let selectedDef = this.typeDef[this.typeDef.length-1].filter((opt) => { return opt[0] == this.state.selected })
        selectedDef = selectedDef.length === 1 ? selectedDef[0] : []

        return (
            <FormGroup tag="fieldset" className="border border-dark p-2">
                <legend>{ (isOptional(this.props.def) ? '' : '*') + this.name }</legend>
                { this.comment != '' ? <FormText color="muted">{ this.comment }</FormText> : '' }
                <div className="col-12 my-1 px-0">
                    <Input type="select" name={ this.name } title={ this.name } className="selectpicker" onChange={ e => this.setState({selected: e.target.value}) } default={ -1 }>
                        <option data-subtext={ this.name + ' options' } value={ -1 }>{ this.name } options</option>
                        {
                            this.typeDef[this.typeDef.length-1].map(opt => {
                                return <option key={ opt[0] } data-subtext={ opt[2] } value={ opt[0] }>{ opt[1] }</option>
                            })
                        }
                    </Input>
                    <div className="col-12 py-2">
                        {
                            this.state.selected >= 0 ? <Field def={ selectedDef } parent={ this.msgName } optChange={ this.props.optChange } /> : ''
                        }
                    </div>
                </div>
            </FormGroup>
        )
    }
}

function mapStateToProps(state) {
    return {
        schema: state.Generator.schema
    }
}


function mapDispatchToProps(dispatch) {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChoiceField)
