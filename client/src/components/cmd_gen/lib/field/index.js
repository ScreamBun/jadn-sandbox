import React, { Component } from 'react'
import { connect } from 'react-redux'

import JSONPretty from 'react-json-pretty'

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import BasicField from './types/basicField'
import EnumeratedField from './types/enumerated'
import ChoiceField from './types/choice'
import RecordField from './types/record'
import MapField from './types/map'
import ArrayOfField from './types/arrayOf'


class Field extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        let props_update = this.props != nextProps
        let state_update = this.state != nextState
        return props_update || state_update
    }

    render() {
        let typeDef = this.props.schema.types.filter((type) => { return type[0] == this.props.def[2] })
        typeDef = typeDef.length === 1 ? typeDef[0] : []

        let parent = this.props.parent || ''

        switch(typeDef[1]) {
            case 'Enumerated':
			    return <EnumeratedField def={ this.props.def } parent={ parent } optChange={ (k, v) => this.props.optChange(k, v, this.props.idx) } />
            case 'Choice':
			    return <ChoiceField def={ this.props.def } parent={ parent } optChange={ (k, v) => this.props.optChange(k, v, this.props.idx) } />
            case 'Record':
			    return <RecordField def={ this.props.def } parent={ parent } optChange={ (k, v) => this.props.optChange(k, v, this.props.idx) } />
			case 'Map':
			    return <MapField def={ this.props.def } parent={ parent } optChange={ (k, v) => this.props.optChange(k, v, this.props.idx) } />
			case 'ArrayOf':
			    return <ArrayOfField def={ this.props.def } parent={ parent } optChange={ (k, v) => this.props.optChange(k, v, this.props.idx) } />
			case 'Array':
			    return <FormText>Array: { this.props.def[1] }</FormText>
			default:
			    return <BasicField def={ this.props.def } parent={ parent } optChange={ (k, v) => this.props.optChange(k, v, this.props.idx) } />
        }
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

export default connect(mapStateToProps, mapDispatchToProps)(Field)

