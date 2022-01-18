import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  DropdownMenu, DropdownToggle, Modal, ModalHeader, ModalBody, UncontrolledDropdown
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckDouble, faTimes } from '@fortawesome/free-solid-svg-icons';

import NavItem from './navItem';
import favicon from '../../dependencies/img/jadn-favicon.png';


function mapStateToProps(state) {
  return {
    site_title: state.Util.site_title
  };
}

function mapDispatchToProps(_dispatch) {
  return {};
}

class Nav extends Component {
  constructor(props) {
    super(props);
    this.navigate = this.navigate.bind(this);
    this.toggle = this.toggle.bind(this);

    const { history } = this.props;
    const act = history.location.pathname === this.prefix;
    this.state = {
      active: (act ? '/' : history.location.pathname),
      about_modal: false,
      features_modal: false,
      state_modal: false
    };
  }

  navigate(e) {
    const { history } = this.props;
    const { href } = e.target;
    e.preventDefault();
    if (href === null || href === undefined ) {
      return;
    }
    const path = href.replace(window.location.origin, '');

    history.push({
      pathname: path
    });

    this.setState({ active: path });
  }

  toggle(e) {
    console.log(e.target);
  }

  modals() {
    const { about_modal, features_modal, state_modal } = this.state;
    return (
      <div>
        <Modal isOpen={ about_modal } toggle={ () => this.setState(prevState => ({ about_modal: !prevState.about_modal })) }>
          <ModalHeader toggle={ () => this.setState(prevState => ({ about_modal: !prevState.about_modal })) }>About</ModalHeader>
          <ModalBody>
            <p>OpenC2 is defined using JSON Abstract Schema Notation (JADN). The JADN validator can check messages against any schema.</p>
            <p>
              Source is available from the
              &nsbp;
              <a href="https://github.com/OpenC2-org/jadn" target="_blank" rel="noreferrer">OpenC2 JADN Github</a>
              &nsbp;
              repo.
            </p>
          </ModalBody>
        </Modal>
        <Modal isOpen={ features_modal } toggle={ () => this.setState(prevState => ({ features_modal: !prevState.features_modal })) }>
          <ModalHeader toggle={ () => this.setState(prevState => ({ features_modal: !prevState.features_modal })) }>Features</ModalHeader>
          <ModalBody>
            <ul>
              <li>
                JADN validation of messages in
                <ul>
                  <li>JSON Format</li>
                  <li>CBOR Format</li>
                  <li>XML Format</li>
                </ul>
              </li>
              <li>
                JADN Schema conversion to
                <ul>
                  <li>JADN Format</li>
                  <li>ProtoBuf3 Format</li>
                  <li>Relax-NG Format</li>
                  <li>CDDL Format</li>
                  <li>MarkDown</li>
                  <li>HTML/PDF</li>
                </ul>
              </li>
            </ul>
          </ModalBody>
        </Modal>
        <Modal isOpen={ state_modal } toggle={ () => this.setState(prevState => ({ state_modal: !prevState.state_modal })) }>
          <ModalHeader toggle={ () => this.setState(prevState => ({ state_modal: !prevState.state_modal })) }>Components State</ModalHeader>
          <ModalBody>
            <ul className='fa-ul'>
              <li>
                <span className='fa-li'><FontAwesomeIcon icon={ faCheck } /></span>
                <a href="https://github.com/OpenC2-org/jadn" target="_blank" rel="noreferrer">OpenC2 JADN Libs</a>
              </li>
              {/*
              <li>
                <span className='fa-li'><FontAwesomeIcon icon={ faCheck }/></span>
                Message Converter
              </li>
              */}
              <li>
                <span className='fa-li'><FontAwesomeIcon icon={ faCheck } /></span>
                Message Validator
              </li>
              <li>
                <span className='fa-li'><FontAwesomeIcon icon={ faCheck } /></span>
                Message Creator
              </li>
              <li>
                <span className='fa-li'><FontAwesomeIcon icon={ faCheck } /></span>
                Schema Conversions
                <ul className='fa-ul'>
                  <li>
                    <span className='fa-li'><FontAwesomeIcon icon={ faCheckDouble } /></span>
                    JADN
                  </li>
                  <li>
                    <span className='fa-li'><FontAwesomeIcon icon={ faCheckDouble } /></span>
                    ProtoBuf3 Format
                  </li>
                  <li>
                    <span className='fa-li'><FontAwesomeIcon icon={ faCheckDouble } /></span>
                    Relax-NG Format
                  </li>
                  <li>
                    <span className='fa-li'><FontAwesomeIcon icon={ faCheckDouble } /></span>
                    CDDL Format
                  </li>
                  <li>
                    <span className='fa-li'><FontAwesomeIcon icon={ faCheckDouble } /></span>
                    MarkDown
                  </li>
                  <li>
                    <span className='fa-li'><FontAwesomeIcon icon={ faCheckDouble } /></span>
                    HTML
                  </li>
                  <li>
                    <span className='fa-li'><FontAwesomeIcon icon={ faCheck } /></span>
                    PDF
                  </li>
                </ul>
              </li>
              <li>
                <span className='fa-li'><FontAwesomeIcon icon={ faCheck } /></span>
                Schema Validator
              </li>
              <li>
                <span className='fa-li'><FontAwesomeIcon icon={ faTimes } /></span>
                Schema Creator
              </li>
            </ul>
            <div>
              <p className='pb-0 mb-1'>Key:</p>
              <ul className='fa-ul'>
                <li>
                  <span className='fa-li'><FontAwesomeIcon icon={ faTimes } /></span>
                  Untested
                </li>
                <li>
                  <span className='fa-li'><FontAwesomeIcon icon={ faCheck } /></span>
                  Stable/Known Bugs
                </li>
                <li>
                  <span className='fa-li'><FontAwesomeIcon icon={ faCheckDouble } /></span>
                  Public Ready
                </li>
              </ul>
            </div>
          </ModalBody>
        </Modal>
      </div>
    );
  }

  render() {
    const { active } = this.state;
    return (
      <nav className="navbar navbar-expand-sm navbar-light bg-light py-2 fixed-top" style={{ paddingLeft: '3.5em'}}>
        <div className="navbar-brand">
          <img src={ favicon } alt="Logo" />
          &nbsp;&nbsp;
          <a href="https://github.com/oasis-open/openc2-jadn/" target="_blank" rel="noreferrer">JADN</a>
          &nbsp;
          Lint
        </div>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navMain">
          <ul className="navbar-nav mr-auto">
            <NavItem href="/" text="Validate" active={ active } click={ this.navigate } />
            <NavItem href="/convert" text="Convert" active={ active } click={ this.navigate } />
            <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>Generate</DropdownToggle>
                <DropdownMenu right>
                  <NavItem dropdown href="/generate/message" text='Message' active={ active } click={ this.navigate } />
                  <NavItem dropdown href="/generate/schema" text='Schema' active={ active } click={ this.navigate } />
                  </DropdownMenu>
              </UncontrolledDropdown>
            <NavItem href="/docs" text="API Docs" active={ active } click={ this.navigate } />
            <NavItem href="#" text="About" click={ () => this.setState(prevState => ({ about_modal: !prevState.about_modal })) } />
            <NavItem href="#" text="Features" click={ () => this.setState(prevState => ({ features_modal: !prevState.features_modal })) } />
            <NavItem href="#" text="State" click={ () => this.setState(prevState => ({ state_modal: !prevState.state_modal })) } />
          </ul>
        </div>
        { this.modals() }
      </nav>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Nav);
