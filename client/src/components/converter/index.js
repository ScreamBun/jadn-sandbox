import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import {
    Redirect
} from 'react-router-dom'

import { Button, ButtonGroup, Form, FormGroup, Label, Input, FormText, Tooltip, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';


class Converter extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            conv_tooltip: false,
            schema_opts_dropdown: false
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        let props_update = this.props != nextProps
        let state_update = this.state != nextState
        return props_update || state_update
    }

    submitForm(e) {
        e.preventDefault()

        return false
    }

    format(t) {}

    minify(t) {}

    downloadFile() {}

    viewPage() {}

    render() {
        let schema_opts = [] //<option value="{{ opt }}" {% if request.form['schema-list'] == opt %}selected=""{% endif %}>{{ opt }}</option>
        let convert_opts = [] //<option value="{{ options.convs[conv] }}" {% if request.form['convert-to'] == options.convs[conv] %}selected=""{% endif %}>{{ conv }}</option>

        return (
            <div className='row mx-auto'>
                <Form className="mx-auto col-12" onSubmit={ this.submitForm.bind(this) }>
                    <div className="form-row">
                        <fieldset className="col-6 p-0 float-left">
                            <legend>JADN Schema</legend>

                            <textarea className="form-control border" placeholder="Paste JADN schema here" id="schema" name="schema" rows="25" required="" />

                            <div className="col-12 m-1"></div>

                            <ButtonDropdown isOpen={ this.state.schema_opts_dropdown } toggle={ () => this.setState({ schema_opts_dropdown: !this.state.schema_opts_dropdown }) } className="float-right">
                                 <DropdownToggle caret color="info" size="sm">
                                    Schema Options
                                </DropdownToggle>
                                <DropdownMenu>
                                     <DropdownItem onClick={ () => this.format('schema') }>Format</DropdownItem>
                                     <DropdownItem onClick={ () => this.format('schema') }>Verbose</DropdownItem>
                                     <DropdownItem onClick={ () => this.minify('schema') }>Minify</DropdownItem>
                                     <DropdownItem onClick={ () => this.props.verifySchema(this.state.schema) }>Verify</DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>

                            <div className="form-row">
                                <div className="form-group col-md-4 pr-1 pl-1">
                                    <select id="schema-list" name="schema-list" className="form-control" default="empty">
                                        <option value="empty">Schema</option>
                                        { schema_opts }
                                        <option disabled="">──────────</option>
                                        <option value="file">File...</option>
                                        <option value="">URL...</option>
                                    </select>
                                </div>

                                <div id="schema-file-group" className="form-group col-md-3 d-none pr-1 pl-1">
                                    <input type="file" className="form-control-file" id="schema-file" name="schema-file" accept=".jadn" />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="col-6 p-0 float-left">
                            <legend>Converted Schema</legend>

                            <textarea className="form-control border" placeholder="Converted JADN schema" id="convert" name="convert" rows="25" />

                            <div className="col-12 m-1"></div>

                            <a className="btn btn-sm btn-primary float-right" href="#" target="_blank" id="download-link" onClick={ this.downloadFile.bind(this) }>Download</a>

                            <a className="btn btn-sm btn-secondary float-right d-none mr-2" href="#" target="_blank" id="view-page" onClick={ this.viewPage.bind(this) }>View Page</a>
                        </fieldset>
                    </div>

                    <div className="col-12"></div>

                    <div className="form-group">
                        <div className="form-group col-md-3 pr-1 pl-1">
                            <select id="convert-to" name="convert-to" className="form-control">
                                <option value="empty">Convert To...</option>
                                { convert_opts }
                            </select>
                        </div>

                        <Button outline color="primary" type="submit" id="conv_tooltip">Convert</Button>
                        <Tooltip placement="bottom" isOpen={ this.state.conv_tooltip } target="conv_tooltip" toggle={ () => this.setState({ conv_tooltip: !this.state.conv_tooltip }) }>
                            Convert the given JADN schema to the selected format
                        </Tooltip>
                        <Button outline color="danger" type="reset">Reset</Button>
                    </div>
                </Form>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
    }
}


function mapDispatchToProps(dispatch) {
    return {
        verifySchema: (s) => {}
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Converter)
