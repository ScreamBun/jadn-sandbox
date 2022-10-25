/* eslint @typescript-eslint/lines-between-class-members: 0 */
import React, { Component } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { History } from 'history';
import {
  DropdownMenu, DropdownToggle, Modal, ModalHeader, ModalBody, UncontrolledDropdown
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckDouble, faTimes } from '@fortawesome/free-solid-svg-icons';

import NavItem from './navItem';
import { safeGet } from '../../utils';
import favicon from '../../dependencies/img/jadn-favicon.png';
import { RootState } from '../../../reducers';

// Interfaces
interface NavProp {
  history: History;
}

interface NavState {
  active: string;
  aboutModal: boolean;
  featuresModal: boolean;
  statusModal: boolean;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  site_title: state.Util.site_title
});

const connector = connect(mapStateToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type NavConnectedProps = NavProp & ConnectorProps;

// Component
class Nav extends Component<NavConnectedProps, NavState> {
  modalProps = {
    centered: true
  };

  constructor(props: NavConnectedProps) {
    super(props);
    this.navigate = this.navigate.bind(this);

    const { history } = this.props;
    this.state = {
      active: history.location.pathname,
      aboutModal: false,
      featuresModal: false,
      statusModal: false
    };
  }

  navigate(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    const { history } = this.props;
    const href = safeGet(e.target as Record<string, any>, 'href', null);
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

  aboutModal() {
    const { aboutModal } = this.state;
    return (
      <Modal isOpen={ aboutModal } toggle={ () => this.setState(prevState => ({ aboutModal: !prevState.aboutModal })) } { ...this.modalProps } >
        <ModalHeader toggle={ () => this.setState(prevState => ({ aboutModal: !prevState.aboutModal })) }>About</ModalHeader>
        <ModalBody>
          <p>OpenC2 is defined using JSON Abstract Schema Notation (JADN). The JADN validator can check messages against any schema.</p>
          <p>
            Source is available from the
            &nbsp;
            <a href="https://github.com/OpenC2-org/jadn" target="_blank" rel="noreferrer">OpenC2 JADN Github</a>
            &nbsp;
            repo.
          </p>
        </ModalBody>
      </Modal>
    );
  }

  featuresModal() {
    const { featuresModal } = this.state;
    return (
      <Modal isOpen={ featuresModal } toggle={ () => this.setState(prevState => ({ featuresModal: !prevState.featuresModal })) } { ...this.modalProps } >
        <ModalHeader toggle={ () => this.setState(prevState => ({ featuresModal: !prevState.featuresModal })) }>Features</ModalHeader>
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
    );
  }

  statusModal() {
    const { statusModal } = this.state;
    return (
      <Modal isOpen={ statusModal } toggle={ () => this.setState(prevState => ({ statusModal: !prevState.statusModal })) } { ...this.modalProps } >
        <ModalHeader toggle={ () => this.setState(prevState => ({ statusModal: !prevState.statusModal })) }>Components Status</ModalHeader>
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
            <NavItem href="/" text="Create Schema" active={ active } click={ this.navigate } />
            <NavItem href="/convert" text="Convert" active={ active } click={ this.navigate } />
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>Generate</DropdownToggle>
              <DropdownMenu right>
                <NavItem dropdown href="/generate/message" text='Message' active={ active } click={ this.navigate } />
                <NavItem dropdown href="/generate/schema" text='Schema' active={ active } click={ this.navigate } />
              </DropdownMenu>
            </UncontrolledDropdown>
            <NavItem href="/docs" text="API Docs" active={ active } click={ this.navigate } />
            <NavItem href="#" text="About" click={ () => this.setState(prevState => ({ aboutModal: !prevState.aboutModal })) } />
            <NavItem href="#" text="Features" click={ () => this.setState(prevState => ({ featuresModal: !prevState.featuresModal })) } />
            <NavItem href="#" text="State" click={ () => this.setState(prevState => ({ statusModal: !prevState.statusModal })) } />
          </ul>
        </div>
        { this.aboutModal() }
        { this.featuresModal() }
        { this.statusModal() }
      </nav>
    );
  }
}

export default connector(Nav);
