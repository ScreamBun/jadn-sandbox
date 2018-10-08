import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import * as GenActions from '../../../../../actions/generator'

import MapField from './map'

class RecordField extends MapField {
}

function mapStateToProps(state) {
    return {
        schema: state.Generator.schema
    }
}


function mapDispatchToProps(dispatch) {
    return {
        setOpt: (key, val) => dispatch(GenActions.setMessageOpt(key, val))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RecordField)