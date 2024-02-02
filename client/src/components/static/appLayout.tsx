import React, { useContext, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { toast, ToastContainer } from 'react-toastify';
import favicon from '../dependencies/assets/img/jadn-favicon.png';
import { NAV_HOME, NAV_CREATE_SCHEMA, NAV_CONVERT_SCHEMA, NAV_CREATE_MESSAGE, NAV_VALIDATE_MESSAGE, NAV_TRANSFORM, NAV_GENERATE, NAV_TRANSLATE, NAV_ABOUT } from 'components/utils/constants';
import { useAppSelector } from '../../reducers';
import { ThemeContext } from './ThemeProvider';
import { dismissAllToast } from 'components/common/SBToast';

const AppLayout = () => {

  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeChooserOpen, setIsThemeChooserOpen] = useState(false);
  const { theme, setTheme } = useContext(ThemeContext);

  const version_info = useAppSelector((state => state.Util.version_info));
  let toastCount = 0;

  toast.onChange((data) => {
    if (data.id != 'dismiss-all-toast') {
      if (data.status == "added") {
        toastCount++;
      } else {
        toastCount--;
      }
    }
    if (toastCount <= 1 && toast.isActive('dismiss-all-toast')) {
      toast.dismiss('dismiss-all-toast');
    }
    if (toastCount > 1 && !toast.isActive('dismiss-all-toast') && data.status == "added") {
      toast(<div onClick={dismissAllToast}>
        Clear All
      </div>, {
        toastId: 'dismiss-all-toast',
        autoClose: false,
        draggable: false,
        closeOnClick: false,
        closeButton: false,
        className: 'p-1 border border-secondary',
        style: { minHeight: 'auto', borderRadius: '30px', fontSize: '14px', color: 'var(--bs-body-color)', backgroundColor: 'var(--bs-secondary-bg)', cursor: 'pointer' },
        containerId: 'clear-all-toasts'
      });
    }
  })

  const onToggleNav = () => {
    setIsNavCollapsed(isNavCollapsed => !isNavCollapsed);
  };

  const onDropDownClick = () => {
    setIsDropdownOpen(prev => !prev);
  };

  return (
    <div>
      <div className='fixed-top'>
        <nav className='navbar navbar-expand-lg bg-primary py-0 px-2' data-bs-theme="dark">
          <button className='navbar-toggler collapsed' type='button' onClick={onToggleNav} data-toggle='collapse' data-target='#navToggle' aria-controls='navToggle' aria-expanded='false' aria-label='Toggle navigation'>
            <span className='navbar-toggler-icon' />
          </button>
          <a className='navbar-brand' href={NAV_HOME} title='JSON Abstract Data Notation Sandbox' rel="noreferrer">
            <img src={favicon} alt='Logo' />
            <span className='font-weight-bold font-italic mx-2'>JADN Sandbox</span>
          </a>
          <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id='navToggle'>
            <ul className='nav navbar-nav'>
              <li className="nav-item">
                <NavLink className='nav-link px-0' to={NAV_HOME}>Home</NavLink>
              </li>

              <li className="nav-item dropdown"
                onClick={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <NavLink className="nav-link dropdown-toggle px-0"
                  to="create"
                  role="button"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="true"
                  aria-expanded="false"
                  title='Create a JADN Schema or Message'
                  onClick={(e) => e.preventDefault()}
                >
                  Creation
                </NavLink>
                <ul className={`dropdown-menu m-0 ${isDropdownOpen ? 'show' : ''}`}>
                  <li><NavLink className='dropdown-item nav-link' to={NAV_CREATE_SCHEMA} onClick={onDropDownClick}>Schema Creation</NavLink></li>
                  <li><NavLink className='dropdown-item nav-link' to={NAV_CREATE_MESSAGE} onClick={onDropDownClick}>Data Creation</NavLink></li>
                </ul>
              </li>

              <li className="nav-item">
                <NavLink className='nav-link px-0' to={NAV_CONVERT_SCHEMA} title='Convert a Schema into a visual representation'>Visualization</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className='nav-link px-0' to={NAV_TRANSLATE} title='Translate between JADN Schemas and other Schema formats'>Translation</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className='nav-link px-0' to={NAV_VALIDATE_MESSAGE} title='Validate a data instance against a provided schema'>Validation</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className='nav-link px-0' to={NAV_TRANSFORM} title='Merge two or more schemas into one'>Transformation</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className='nav-link px-0' to={NAV_GENERATE} title='Generate example data based on a provided schema'>Generation</NavLink>
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right ms-auto">
              <li className="nav-item">
                <NavLink className='nav-link px-0' to={NAV_ABOUT} >About</NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <Outlet />

      <br />
      <br />
      <br />

      <nav className='navbar bg-secondary fixed-bottom py-0 px-2' style={{ opacity: '.75' }}>

        <div className="btn-group dropup">
          <div id="bd-theme" className="dropdown"
            onClick={() => setIsThemeChooserOpen(true)}
            onMouseLeave={() => setIsThemeChooserOpen(false)}>
            <ul className={`dropdown-menu bottom-0 ${isThemeChooserOpen ? 'show' : ''}`}>
              <li><button type="button" className={`dropdown-item d-flex align-items-center ${theme == "light" ? 'active' : ''}`} data-bs-theme-value="light"
                onClick={() => { setTheme('light'); document.documentElement.setAttribute('data-bs-theme', 'light') }}>Light</button></li>
              <li><button type="button" className={`dropdown-item d-flex align-items-center ${theme == "dark" ? 'active' : ''}`} data-bs-theme-value="dark"
                onClick={() => { setTheme('dark'); document.documentElement.setAttribute('data-bs-theme', 'dark') }}>Dark</button></li>
            </ul>
            <button id="bd-theme-text" className="btn btn-sm btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Theme
            </button>
          </div>
        </div>

        <div className='ms-auto bg-secondary'>
          <small>{version_info}</small>
        </div>
      </nav>

      <ToastContainer enableMultiContainer position={toast.POSITION.BOTTOM_RIGHT} containerId='clear-all-toasts' className='d-flex justify-content-end' theme='colored' />
      <ToastContainer enableMultiContainer position={toast.POSITION.BOTTOM_RIGHT} containerId='notification-toasts' className='mb-5' autoClose={4000} theme='colored' />
    </div>

  );
};

export default AppLayout;
