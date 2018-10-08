import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

import favicon from '../dependencies/img/jadn-favicon.png'

class NavItem extends Component {
    constructor(props, context) {
        super(props, context)
        this.external = this.props.external || false
    }

    render() {
        let active = (this.props.href === this.props.active)
        return (
            <li onClick={ this.external ? () => {} : this.props.click } className={ active ? ' active' : '' } >
                <a id={ this.props.id || '' } href={ this.props.href } target={ this.props.target } onClick={ this.external ? () => {} : (e) => { e.preventDefault() } } className="nav-link">
                    { this.props.icon ? <i className={"fa fa-"+this.props.icon}></i> : '' } { this.props.text }
                </a>
            </li>
        );
    }
}

class Nav extends Component {
    constructor(props, context) {
        super(props, context)
        let act = (this.props.history.location.pathname === this.prefix)

        this.state = {
            active: (act ? '/' : this.props.history.location.pathname),
            about_modal: false,
            features_modal: false
        }

        this.toggle = this.toggle.bind(this);
    }

    navigate(e) {
        e.preventDefault()
        if (e.target.href === null || e.target.href === undefined ) { return }
        let href = e.target.href.replace(window.location.origin, '')

        this.props.history.push({
            pathname: href
        })

        this.setState({ active: href })
    }

    toggle(e) {
        console.log(e.target)
    }

    modals() {
        return (
            <div>
                <Modal isOpen={ this.state.about_modal } toggle={ () => this.setState({ about_modal: !this.state.about_modal }) }>
                    <ModalHeader toggle={ () => this.setState({ about_modal: !this.state.about_modal }) }>About</ModalHeader>
                    <ModalBody>
                        <p>OpenC2 is defined using JSON Abstract Schema Notation (JADN). The JADN validator can check messages against any schema.</p>
				        <p>Source is available from the <a href="https://github.com/OpenC2-org/jadn" target="_blank">OpenC2 JADN Github</a> repo.</p>
                    </ModalBody>
                </Modal>
                <Modal isOpen={ this.state.features_modal } toggle={ () => this.setState({ features_modal: !this.state.features_modal }) }>
                    <ModalHeader toggle={ () => this.setState({ features_modal: !this.state.features_modal }) }>Features</ModalHeader>
                    <ModalBody>
                        <ul>
                            <li>JADN validation of messages in
                                <ul>
                                    <li>JSON Format</li>
                                    <li>CBOR Format</li>
                                    <li>XML Format</li>
                                </ul>
                            </li>
                            <li>JADN Schema conversion to
                                <ul>
                                    <li>JADN Format</li>
                                    <li>ProtoBuf3 Format</li>
                                    <li>Relax-NG Format</li>
                                    <li>CDDL Format</li>
                                    <li>MarkDown Format</li>
                                    <li>HTML Format</li>
                                </ul>
                            </li>
                        </ul>
                    </ModalBody>
                </Modal>
            </div>
        )
    }

    render() {
        return (
            <nav className="navbar navbar-expand-sm navbar-light bg-light fixed-top">
	            <div className="navbar-brand">
		            <img src={ favicon } alt="Logo" />
		            <a href="https://github.com/oasis-open/openc2-jadn/" target="_blank">JADN</a>&nbsp;Lint
                </div>

                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navMain">
                    <ul className="navbar-nav mr-auto">

                        <NavItem href="/validate" text="Validate" click={ this.navigate.bind(this) }/>

                        <NavItem href="/convert" text="Convert" click={ this.navigate.bind(this) }/>

			            {/*
			            <NavItem href="/create" text="Create" click={ this.navigate.bind(this) }/>
                        */}

                        <NavItem href="#" text="About" click={ () => this.setState({ about_modal: !this.state.about_modal }) }/>

                        <NavItem href="#" text="Features" click={ () => this.setState({ features_modal: !this.state.features_modal }) }/>
                    </ul>
                </div>
                { this.modals() }
            </nav>
        )
    }
}

function mapStateToProps(state) {
    return {
        site_title: state.Util.site_title
    }
}

function mapDispatchToProps(dispatch) {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Nav)