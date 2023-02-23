import React, { useState } from 'react';
import { NavItem, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import { Link, NavLink, Outlet } from 'react-router-dom';

import { ThemeChooser } from 'react-bootswatch-theme-switcher';
import { toast, ToastContainer } from 'react-toastify';
import favicon from '../dependencies/assets/img/jadn-favicon.png';
import { NAV_EXTERNAL_OPENC2_JADN_SRC, NAV_HOME, NAV_GENERATE_SCHEMA, NAV_CONVERT_SCHEMA, NAV_GENERATE_MESSAGE, NAV_VALIDATE_MESSAGE, NAV_SCHEMA_CONFORMANCE, NAV_ABOUT } from 'components/utils/constants';


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
              <DropdownToggle className="nav-link px-0" nav caret size='sm'>
                Creation
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem tag={Link} to={NAV_GENERATE_SCHEMA} onClick={onNavClick} active={navActive == 'Schema Creation'}>
                  Schema Creation
                </DropdownItem>
                <DropdownItem tag={Link} to={NAV_GENERATE_MESSAGE} onClick={onNavClick} active={navActive == 'Message Creation'}>
                  Message Creation
                </DropdownItem>                
              </DropdownMenu>
            </UncontrolledDropdown>
            <NavItem>
              <NavLink className='nav-link px-0' to={NAV_CONVERT_SCHEMA} onClick={onNavClick} state={{ navConvertTo: "", title: "Schema Conversion" }}>Conversion</NavLink>
            </NavItem>              
            <NavItem>
              <NavLink className='nav-link px-0' to={NAV_CONVERT_SCHEMA} onClick={onNavClick} state={{ navConvertTo: "", title: "Schema Translation" }}>Translation</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className='nav-link px-0' to={NAV_VALIDATE_MESSAGE} onClick={onNavClick} state={{ navMsgFormat: "" }}>Validation</NavLink>
            </NavItem>                      
            <NavItem>
              <NavLink className='nav-link px-0' to={NAV_HOME} onClick={onNavClick}>Transformation</NavLink>
            </NavItem>
            <NavItem>
              <NavLink className='nav-link px-0' to={NAV_HOME} onClick={onNavClick}>Generation</NavLink>
            </NavItem>                                               
          </ul>
          <ul className="nav navbar-nav navbar-right ml-auto">
            <NavItem>
              <NavLink className='nav-link' to={NAV_ABOUT} onClick={onNavClick}>About</NavLink>
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
