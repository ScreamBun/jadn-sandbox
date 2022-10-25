import React, { FunctionComponent, MouseEvent } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { DropdownItem, NavItem, NavLink } from 'reactstrap';

// Interfaces
type MouseEventFun = (e: MouseEvent<HTMLElement>) => void;

interface NavElmProps {
  active?: string;
  href: string;
  click?: MouseEventFun;
  dropdown?: boolean;
  external?: boolean;
  icon?: IconProp;
  itemClasses?: string;
  linkClasses?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  text?: string;
}

const defaultProps = {
  // active: '',
  // href: '#',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  click: (_e: MouseEvent<HTMLElement>) => {},
  dropdown: false,
  external: false,
  icon: undefined,
  itemClasses: '',
  linkClasses: '',
  target: '_self',
  text: ''
};

// Component
const NavElm: FunctionComponent<NavElmProps> = (props) => {
  const {
    active, click, dropdown, external, href, icon, itemClasses, linkClasses, target, text
  } = {...defaultProps, ...props};
  const classSet = new Set<string>((itemClasses || '').split(' '));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const itemClick: MouseEventFun = (external ? _e => {} : click) || (_e => {});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const linkClick: MouseEventFun = external ? _e => {} : e => { e.preventDefault(); };
  const linkHref = (href || '').endsWith('/') ? href : `${href}/`;
  if (linkHref === active) {
    classSet.add('active');
  }

  if (dropdown) {
    return (
      <DropdownItem className={ linkClasses } href={ linkHref } target={ target } onClick={ itemClick } >
        { icon ? <FontAwesomeIcon icon={ icon } size='lg' /> : '' }
        { icon ? ' ' : '' }
        { text }
      </DropdownItem>
    );
  }

  return (
    <NavItem className={ classNames( ...classSet ) } onClick={ itemClick } >
      <NavLink className={ linkClasses } href={ linkHref } target={ target } onClick={ linkClick } >
        { icon ? <FontAwesomeIcon icon={ icon } size='lg' /> : '' }
        { icon ? ' ' : '' }
        { text }
      </NavLink>
    </NavItem>
  );
};

export default NavElm;
