import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import Field from '../'

import {
    isOptional
} from '../../'

import * as GenActions from '../../../../../actions/generator'


class MapField extends Component {
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
                <div className="col-12 my-1 px-0">
                    {
                        this.typeDef[this.typeDef.length - 1].map((def, i) => <Field key={ i } def={ def } parent={ this.msgName } optChange={ this.props.optChange } />)
                    }
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

export default connect(mapStateToProps, mapDispatchToProps)(MapField)
