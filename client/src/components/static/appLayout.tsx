import React, { useState } from 'react';
import { NavItem, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import { Link, NavLink, Outlet } from 'react-router-dom';

import { ThemeChooser } from 'react-bootswatch-theme-switcher';
import { toast, ToastContainer } from 'react-toastify';
import {
  NAV_CONVERT_SCHEMA, NAV_EXTERNAL_OPENC2_JADN_SRC, NAV_GENERATE_MESSAGE, NAV_GENERATE_SCHEMA, NAV_HOME, NAV_VALIDATE
} from 'components/utils/constants';
import favicon from '../dependencies/assets/img/jadn-favicon.png';


const AppLayout = () => {

  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [navActive, setNavActive] = useState('home');

  const onToggleNav = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  const onNavClick = (navClickEvent: any) => {
    setNavActive(navClickEvent.currentTarget.textContent);
  };

  return (
    <div>
      <nav className='navbar navbar-expand-md navbar-dark bg-primary fixed-top py-0'>
        <button className='navbar-toggler collapsed' type='button' onClick={ onToggleNav } data-toggle='collapse' data-target='#navToggle' aria-controls='navToggle' aria-expanded='false' aria-label='Toggle navigation'>
          <span className='navbar-toggler-icon' />
        </button>
        <a className='navbar-brand' href={ NAV_EXTERNAL_OPENC2_JADN_SRC } target='_blank' title='JSON Abstract Data Notation Sandbox' rel="noreferrer">
          <img src={ favicon } alt='Logo' />
          <span className='font-weight-bold font-italic mx-2'>JADN Sandbox</span>
        </a>
        <div className={ `${isNavCollapsed ? 'collapse' : ''  } navbar-collapse` } id='navToggle'>
          <ul className='nav navbar-nav mr-auto'>
            <NavItem>
              <NavLink className='nav-link py-1' to={ NAV_HOME } onClick={onNavClick}>Home</NavLink>
            </NavItem>
            <UncontrolledDropdown nav inNavbar setActiveFromChild>
              <DropdownToggle className="nav-link py-1" nav caret size='sm'>
                Schema
              </DropdownToggle>
              <DropdownMenu >
                <DropdownItem tag={Link} to={ NAV_GENERATE_SCHEMA } onClick={onNavClick} active={navActive == 'Generate Schema'}>
                  Generate Schema
                </DropdownItem>
                <DropdownItem tag={Link} to={ NAV_CONVERT_SCHEMA } onClick={onNavClick} active={navActive == 'Convert Schema'}>
                  Convert Schema
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <UncontrolledDropdown nav inNavbar setActiveFromChild>
              <DropdownToggle className="nav-link py-1" nav caret size='sm'>
                Message
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem tag={Link} to={ NAV_GENERATE_MESSAGE } onClick={onNavClick} active={navActive == 'Generate Message'}>
                  Generate Message
                </DropdownItem>
                <DropdownItem tag={Link} to={ NAV_VALIDATE } onClick={onNavClick} active={navActive == 'Validate Message'}>
                  Validate Message
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

      <ToastContainer position={ toast.POSITION.BOTTOM_CENTER } autoClose={ 4000 } theme='colored' />

    </div>
  );
};

export default AppLayout;
