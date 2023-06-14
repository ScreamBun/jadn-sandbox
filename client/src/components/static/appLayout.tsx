import React, { useState } from 'react';
import { NavItem, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import { Link, NavLink, Outlet } from 'react-router-dom';

import { ThemeChooser } from 'react-bootswatch-theme-switcher';
import { toast, ToastContainer } from 'react-toastify';
import favicon from '../dependencies/assets/img/jadn-favicon.png';
import { NAV_EXTERNAL_OPENC2_JADN_SRC, NAV_HOME, NAV_CREATE_SCHEMA, NAV_CONVERT_SCHEMA, NAV_CREATE_MESSAGE, NAV_VALIDATE_MESSAGE, NAV_TRANSFORM, NAV_GENERATE, NAV_TRANSLATE, NAV_ABOUT } from 'components/utils/constants';

const AppLayout = () => {

  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [navActive, setNavActive] = useState('home');

  const onToggleNav = () => {
    setIsNavCollapsed(isNavCollapsed => !isNavCollapsed);
  };

  const onNavClick = (navClickEvent: any) => {
    setNavActive(navClickEvent.currentTarget.textContent);
  };

  return (
    <div>
      <nav className='navbar navbar-expand-md navbar-dark bg-primary fixed-top py-0'>
        <button className='navbar-toggler collapsed' type='button' onClick={onToggleNav} data-toggle='collapse' data-target='#navToggle' aria-controls='navToggle' aria-expanded='false' aria-label='Toggle navigation'>
          <span className='navbar-toggler-icon' />
        </button>
        <a className='navbar-brand' href={NAV_EXTERNAL_OPENC2_JADN_SRC} target='_blank' title='JSON Abstract Data Notation Sandbox' rel="noreferrer">
          <img src={favicon} alt='Logo' />
          <span className='font-weight-bold font-italic mx-2'>JADN Sandbox</span>
        </a>
        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id='navToggle'>
          <ul className='nav navbar-nav'>
            <NavItem>
              <NavLink className='nav-link px-0' to={NAV_HOME} onClick={onNavClick}>Home</NavLink>
            </NavItem>
            <UncontrolledDropdown nav inNavbar setActiveFromChild>
              <DropdownToggle className="nav-link px-0" nav caret size='sm' title='Create a JADN Schema or Message'>
                Creation
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem tag={Link} to={NAV_CREATE_SCHEMA} onClick={onNavClick} active={navActive == 'Schema Creation'}>
                  Schema Creation
                </DropdownItem>
                <DropdownItem tag={Link} to={NAV_CREATE_MESSAGE} onClick={onNavClick} active={navActive == 'Message Creation'}>
                  Message Creation
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <NavItem>
              <NavLink className='nav-link px-0' to={NAV_CONVERT_SCHEMA} state={{ navConvertTo: "" }} onClick={onNavClick} title='Convert a Schema into a visual representation'>Visualization</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className='nav-link px-0' to={NAV_TRANSLATE} state={{ navConvertTo: "" }} onClick={onNavClick} title='Translate between JADN Schemas and other data types'>Translation</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className='nav-link px-0' to={NAV_VALIDATE_MESSAGE} onClick={onNavClick} state={{ navMsgFormat: "" }} title='Validate a message against a provided schema'>Validation</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className='nav-link px-0' to={NAV_TRANSFORM} state={{ navConvertTo: "" }} onClick={onNavClick} title='Merge two or more schemas into one'>Transformation</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className='nav-link px-0' to={NAV_GENERATE} onClick={onNavClick} title='Generate example messages based on a provided schema'>Generation</NavLink>
            </NavItem>
          </ul>
          <ul className="nav navbar-nav navbar-right ml-auto">
            <NavItem>
              <NavLink className='nav-link px-0' to={NAV_ABOUT} onClick={onNavClick}>About</NavLink>
            </NavItem>
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

      <ToastContainer position={toast.POSITION.TOP_RIGHT} autoClose={4000} theme='colored' />

    </div>
  );
};

export default AppLayout;
