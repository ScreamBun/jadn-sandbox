import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons'

import Field from '../'

import {
    isOptional
} from '../../'

import * as GenActions from '../../../../../actions/generator'


class ArrayOfField extends Component {
    constructor(props, context) {
        super(props, context)

        this.name = this.props.def[1]
        this.type = this.props.def[2]
        this.args = this.props.def[3]
        this.comment = this.props.def[4]
        this.opts = {}

        this.typeDef = this.props.schema.types.filter((type) => { return type[0] == this.type })
        this.typeDef = this.typeDef.length === 1 ? this.typeDef[0] : []

        this.msgName = (this.props.parent ? [this.props.parent, this.name] : [this.name]).join('.')

        this.state = {
            min: false,
            max: false,
            count: 1,
            opts: {}
        }
    }

    opts2arr(opts) {
        this.opts = {}
        let jadn_opts = {
            // Type Options
			'=': 'compact',
			'[': 'min',
			']': 'max',
			'*': 'rtype',
			'$': 'pattern',
			'@': 'format'
		}

		opts.forEach(opt => {
		    let opt_char = opt.charAt(0)
			let opt_val = opt.substr(1)

			if (jadn_opts.hasOwnProperty(opt_char)) {
			    this.opts[jadn_opts[opt_char]] = opt_val
			} else {
				console.log('Unknown option', opt_char)
			}
		})
    }

    addOpt(e) {
        e.preventDefault()
        console.log('Add Option')
        let max = this.opts.hasOwnProperty('max') ? this.opts.max : 1000

        if (this.state.count < max)
            this.setState({
                count: ++this.state.count,
                max: false
            })
        else {
            this.setState({ max: true })
        }
    }

    removeOpt(e) {
        e.preventDefault()
        console.log('Remove Option')
        let min = this.opts.hasOwnProperty('min') ? this.opts.min : 0
        let opts = this.state.opts || {}

        if (this.state.count > min) {
            delete opts[Math.max.apply(Math, Object.keys(opts))]

            this.setState({
                count: --this.state.count,
                min: false,
                opts: opts
            })

            this.props.optChange(this.msgName, Array.from(new Set(Object.values(opts))))
        } else {
            this.setState({
                min: true
            })
        }
    }

    optChange(k, v, i) {
        let opts = {
            ...this.state.opts,
            [i]: v
        }

        this.setState({
            opts: opts
        })

        this.props.optChange(this.msgName, Array.from(new Set(Object.values(opts))))
    }

    render() {
       this.opts2arr(this.typeDef[2])

        let arrDef = this.props.schema.types.filter((type) => { return type[0] == this.opts.rtype })
        if (arrDef.length === 1) {
            arrDef = arrDef[0]
            arrDef = [0, arrDef[0].toLowerCase(), arrDef[0], [], arrDef[arrDef.length-2]]
        } else {
            arrDef = [0, arrDef[1], "String", [], ""]
        }

        let fields = []
        for (let i=0; i < this.state.count; ++i) {
            fields.push(<Field key={ i } def={ arrDef } parent={ this.msgName } optChange={ this.optChange.bind(this) } idx={ i } />)
        }

        return (
            <FormGroup tag="fieldset" className="border border-dark p-2">
                <legend>
                    { (isOptional(this.props.def) ? '' : '*') + this.name }
                    <Button
                        color="danger"
                        className={ 'float-right p-1' + (this.state.min ? ' disabled' : '') }
                        onClick={ this.removeOpt.bind(this) }
                    >
                        <FontAwesomeIcon icon={ faMinusSquare } size="lg"/>
                    </Button>
                    <Button
                        color="primary"
                        className={ 'float-right p-1' + (this.state.max ? ' disabled' : '') }
                        onClick={ this.addOpt.bind(this) }
                    >
                        <FontAwesomeIcon icon={ faPlusSquare } size="lg"/>
                    </Button>
                </legend>
                { this.comment != '' ? <FormText color="muted">{ this.comment }</FormText> : '' }

                { fields }
            </FormGroup>
        )
    }
}

function mapStateToProps(state) {
    return {
        schema: state.Generator.schema,
        baseTypes: state.Generator.types.base
    }
}


function mapDispatchToProps(dispatch) {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ArrayOfField)
