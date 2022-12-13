import React, { Component } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { NavItem } from 'reactstrap';

import { NavLink, Outlet } from 'react-router-dom';

import { ThemeChooser } from 'react-bootswatch-theme-switcher';
import { toast, ToastContainer } from 'react-toastify';
import favicon from '../dependencies/img/jadn-favicon.png';
import { RootState } from '../../reducers';
import { NAV_CONVERT, NAV_EXTERNAL_OPENC2_JADN, NAV_GENERATE_MESSAGE, NAV_GENERATE_SCHEMA, NAV_HOME, NAV_VALIDATE } from 'components/utils/constants';

interface NavState {
  isNavCollapsed: boolean;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  site_title: state.Util.site_title
});

const connector = connect(mapStateToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type NavConnectedProps = ConnectorProps;


class AppLayout extends Component<NavConnectedProps, NavState> {

  constructor(props: NavConnectedProps) {
    super(props);

    this.state = {
      isNavCollapsed: false
    };
  }

  render() {
    const { isNavCollapsed } = this.state;
    return (
      <div>
        <nav className='navbar navbar-expand-md navbar-dark bg-dark fixed-top py-1'>
          <button className='navbar-toggler collapsed' type='button' data-bs-toggle='collapse' data-bs-target='#jadn-sandbox-nav-toggle' aria-controls='jadn-sandbox-nav-toggle' aria-expanded='false' aria-label='Toggle navigation'>
            <span className='navbar-toggler-icon' />
          </button>
          <a className='navbar-brand' href={ NAV_EXTERNAL_OPENC2_JADN } target='_blank' title='JSON Abstract Data Notation Sandbox' rel="noreferrer">
            <img src={ favicon } alt='Logo' />
            <span className='font-weight-bold font-italic mx-2'>JADN Sandbox</span>
          </a>
          <div className='navbar-collapse collapse' id='jadn-sandbox-nav-toggle'>
            <ul className='nav navbar-nav mr-auto mt-2 mt-lg-0'>
              <NavItem>
                <NavLink className='nav-link' to={ NAV_HOME }>Home</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className='nav-link' to={ NAV_VALIDATE }>Validate</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className='nav-link' to={ NAV_CONVERT }>Convert</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className='nav-link' to={ NAV_GENERATE_MESSAGE }>Generate Message</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className='nav-link' to={ NAV_GENERATE_SCHEMA }>Generate Schema</NavLink>
              </NavItem>
            </ul>
          </div>
        </nav>

        <Outlet />

        <nav className='navbar navbar-dark bg-dark fixed-bottom py-1'>
          <ThemeChooser size='sm' />
        </nav>

        <ToastContainer position={ toast.POSITION.BOTTOM_CENTER } autoClose={ 5000 } />

      </div>
    );
  }
}

export default connector(AppLayout);
