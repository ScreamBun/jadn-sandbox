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
      aboutModal: false
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
      <Modal
        isOpen={ aboutModal }
        toggle={ () => this.setState(
        prevState => ({ aboutModal: !prevState.aboutModal })) }
        { ...this.modalProps }
      >
        <ModalHeader toggle={ () => this.setState(prevState => ({ aboutModal: !prevState.aboutModal })) }>About</ModalHeader>
        <ModalBody>
          <p>
            OpenC2 is defined using JSON Abstract Schema Notation (JADN).
            The JADN validator can check messages against any schema.
          </p>
          <p>
            Source is available from the
            &nbsp;
            <a href="https://github.com/OpenC2-org/jadn" target="_blank" rel="noreferrer">OpenC2 JADN Github</a>
            &nbsp;
            repo.
          </p>
          <hr />
          <h5>Features</h5>
          <p>
            <ul>
              <li>
                JADN validation of messages in
                <ul>
                  <li>JSON</li>
                  <li>CBOR</li>
                  <li>XML</li>
                </ul>
              </li>
              <li>
                JADN Schema conversion to
                <ul>
                  <li>GraphViz</li>
                  <li>HTML</li>
                  <li>JADN</li>
                  <li>JIDN</li>
                  <li>MarkDown</li>
                  <li>XML (Relax)</li>
                </ul>
              </li>
            </ul>
          </p>
        </ModalBody>
      </Modal>
    );
  }

  render() {
    const { active } = this.state;
    return (
      <div>
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark py-1 fixed-top container-fluid">
          <div className="navbar-brand">
            <img src={ favicon } alt="Logo" />
            <a href="https://github.com/oasis-open/openc2-jadn/" title='JSON Abstract Data Notation' className='font-weight-bold' target="_blank" rel="noreferrer">
              JADN Sandbox
            </a>
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
              {/* <NavItem href="/docs" text="API Docs" active={ active } click={ this.navigate } /> */}
              <NavItem href="#" text="About" click={ () => this.setState(prevState => ({ aboutModal: !prevState.aboutModal })) } />
            </ul>
          </div>
        </nav>
        { this.aboutModal() }
      </div>
    );
  }
}

export default connector(Nav);
