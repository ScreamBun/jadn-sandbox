import React, { useState } from 'react';
import { NavItem, Dropdown, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import { NavLink, Outlet } from 'react-router-dom';

import { ThemeChooser } from 'react-bootswatch-theme-switcher';
import { toast, ToastContainer } from 'react-toastify';
import {
  NAV_CONVERT_SCHEMA, NAV_EXTERNAL_OPENC2_JADN_SRC, NAV_GENERATE_MESSAGE, NAV_GENERATE_SCHEMA, NAV_HOME, NAV_VALIDATE
} from 'components/utils/constants';
import favicon from '../dependencies/assets/img/jadn-favicon.png';


const AppLayout = () => {

  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const onToggleNav = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  return (
    <div>
      <nav className='navbar navbar-expand-md navbar-dark bg-primary fixed-top py-1'>
        <button className='navbar-toggler collapsed' type='button' onClick={ onToggleNav } data-toggle='collapse' data-target='#navToggle' aria-controls='navToggle' aria-expanded='false' aria-label='Toggle navigation'>
          <span className='navbar-toggler-icon' />
        </button>
        <a className='navbar-brand' href={ NAV_EXTERNAL_OPENC2_JADN_SRC } target='_blank' title='JSON Abstract Data Notation Sandbox' rel="noreferrer">
          <img src={ favicon } alt='Logo' />
          <span className='font-weight-bold font-italic mx-2'>JADN Sandbox</span>
        </a>
        <div className={ `${isNavCollapsed ? 'collapse' : ''  } navbar-collapse` } id='navToggle'>
          <ul className='nav navbar-nav mr-auto mt-2 mt-lg-0'>
            <NavItem>
              <NavLink className='nav-link' to={ NAV_HOME }>Home</NavLink>
            </NavItem>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Schema
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem>
                  <NavLink className='nav-link' to={ NAV_GENERATE_SCHEMA }>Generate Schema</NavLink>
                </DropdownItem>
                <DropdownItem>
                  <NavLink className='nav-link' to={ NAV_CONVERT_SCHEMA }>Convert Schema</NavLink>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Message
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem>
                  <NavLink className='nav-link' to={ NAV_GENERATE_MESSAGE }>Generate Message</NavLink>
                </DropdownItem>
                <DropdownItem>
                  <NavLink className='nav-link' to={ NAV_VALIDATE }>Validate Message</NavLink>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>                      
          </ul>
        </div>
      </nav>

      <Outlet />

      <br />
      <br />
      <br />

      <nav className='navbar navbar-dark bg-secondary fixed-bottom py-1'>
        <ThemeChooser size='sm' />
        <small>v1.0.0</small>
      </nav>

      <ToastContainer position={ toast.POSITION.BOTTOM_CENTER } autoClose={ 5000 } theme='colored' />

    </div>
  );
};

export default AppLayout;
