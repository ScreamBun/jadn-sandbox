import React, { Component } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  Collapse
} from 'reactstrap';

import { NavLink } from 'react-router-dom';

import favicon from '../../dependencies/img/jadn-favicon.png';
import { RootState } from '../../../reducers';

interface NavState {
  isNavCollapsed: boolean;
  isAboutOpen: boolean;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  site_title: state.Util.site_title
});

const connector = connect(mapStateToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type NavConnectedProps = ConnectorProps;

// Component
class AppNav extends Component<NavConnectedProps, NavState> {

  constructor(props: NavConnectedProps) {
    super(props);

    this.state = {
      isAboutOpen: false,
      isNavCollapsed: false
    };
  }

  aboutModal() {
    const { isAboutOpen } = this.state;
    return (
      <Modal
        isOpen={ isAboutOpen }
        toggle={ () => this.setState(
        prevState => ({ isAboutOpen: !prevState.isAboutOpen })) }
      >
        <ModalHeader toggle={ () => this.setState(prevState => ({ isAboutOpen: !prevState.isAboutOpen })) }>About</ModalHeader>
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
    const { isNavCollapsed } = this.state;
    return (
      <div>
        <Navbar color="dark" dark expand='md' container='fluid' fixed='top' className='py-1'>
          <NavbarBrand href="https://github.com/oasis-open/openc2-jadn/" title='JSON Abstract Data Notation Sandbox' target="_blank">
            <img src={ favicon } alt="Logo" />
            <span className='font-weight-bold font-italic mx-2'>JADN Sandbox</span>
          </NavbarBrand>
          <NavbarToggler onClick={ () => this.setState(prevState => ({ isNavCollapsed: !prevState.isNavCollapsed })) } />
          <Collapse isOpen={ isNavCollapsed } navbar>
            <Nav className='container-fluid' navbar>
              <NavItem>
                <NavLink href="/validate" active className={ ({ isActive }) => (isActive ? 'active' : 'inactive') }>Validate</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/convert">Convert</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/generate-message">Generate Message</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/generate-schema">Generate Schema</NavLink>
              </NavItem>
              <NavItem className="ml-auto">
                <NavLink to="#" text='about' onClick={ () => this.setState(prevState => ({ isAboutOpen: !prevState.isAboutOpen })) }>About</NavLink>
                {/* <NavItem href="/docs" text="API Docs" active={ active } click={ this.navigate } /> */}
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        { this.aboutModal() }
      </div>
    );
  }
}

export default connector(AppNav);
