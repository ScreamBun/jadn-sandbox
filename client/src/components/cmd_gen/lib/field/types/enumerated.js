import React, { Component } from 'react'
import { connect } from 'react-redux'

import { FormGroup, Label, Input, FormText } from 'reactstrap';

import {
    isOptional
} from '../../'

import * as GenActions from '../../../../../actions/generator'

class EnumeratedField extends Component {
    constructor(props, context) {
        super(props, context)

        this.name = this.props.def[1]
        this.type = this.props.def[2]
        this.args = this.props.def[3]
        this.comment = this.props.def[4]

        this.typeDef = this.props.schema.types.filter((type) => { return type[0] == this.type })
        this.typeDef = this.typeDef.length === 1 ? this.typeDef[0] : []

        this.msgName = (this.props.parent ? [this.props.parent, this.name] : [this.name]).join('.')
    }

    render() {
        return (
            <FormGroup tag="fieldset" className="border border-dark p-2">
                <legend>{ (isOptional(this.props.def) ? '' : '*') + this.name }</legend>
                { this.comment != '' ? <FormText color="muted">{ this.comment }</FormText> : '' }
                <Input
                    type="select"
                    name={ this.name }
                    title={ this.name }
                    className="selectpicker"
                    onChange={ e => this.props.optChange(this.msgName, e.target.value) }
                >
                    <option data-subtext={ this.name + ' options' } value='' >{ this.name + ' options' }</option>
                    {
                        this.typeDef[this.typeDef.length-1].map(opt => {
                            return <option key={ opt[0] } data-subtext={ opt[2] }>{ opt[1] }</option>
                        })
                    }
                </Input>
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

export default connect(mapStateToProps, mapDispatchToProps)(EnumeratedField)
