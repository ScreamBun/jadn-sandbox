import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import classname from 'classnames';

// Styles
import '../dependencies/css/toggle-switch.scss';

// Interface
type BootstrapColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'muted' | 'white';
type ToggleSize = 'md' | 'lg' | 'xl';
interface ToggleSwitchProps {
  disabled: boolean;
  defaultChecked:  boolean;
  className?: string;
  onToggle: (t: boolean) => void;
  size?: ToggleSize;
  colors?: {
    checked: BootstrapColor,
    unchecked: BootstrapColor
  };
  icons?: boolean | {
    checked: JSX.Element,
    unchecked: JSX.Element
  };
}
interface ToggleSwitchState {
  disabled: boolean;
  toggled: boolean;
}

// Component
class ToggleSwitch extends Component<ToggleSwitchProps, ToggleSwitchState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    className: '',
    size: 'md',
    colors: {
      checked: 'primary',
      unchecked: 'secondary'
    },
    icons: true
  };

  constructor(props: ToggleSwitchProps) {
    super(props);
    this.toggle = this.toggle.bind(this);
    const { defaultChecked, disabled } = this.props;

    this.state = {
      disabled,
      toggled: defaultChecked
    };
  }

  getColors() {
    const { colors } = this.props;
    if (colors) {
      return colors;
    }
    return {
      checked: 'info',
      unchecked: 'warning'
    };
  }

  getIcons() {
    const { icons } = this.props;
    if (icons) {
      if (typeof(icons) === 'object') {
        return icons;
      }
      return {
        checked: <FontAwesomeIcon icon={ faCheck } />,
        unchecked: <FontAwesomeIcon icon={ faTimes } />
      };
    }
    return {
      checked: null,
      unchecked: null
    };
  }

  toggle() {
    const { disabled, onToggle } = this.props;
    if (!disabled) {
      this.setState(prevState => ({
        toggled: !prevState.toggled
      }), () => {
        const { toggled } = this.state;
        onToggle(toggled);
      });
    }
  }

  render() {
    const { className, size } = this.props;
    const { disabled, toggled } = this.state;
    const { checked: checkedColor, unchecked: uncheckedColor } = this.getColors();
    const { checked: checkedIcon, unchecked: uncheckedIcon } = this.getIcons();
    const color = toggled ? `bg-${checkedColor}` : `bg-${uncheckedColor}`;
    const toggleSize = size ? `wrg-toggle'-${size}` : '';
    const toggleClasses = classname(className, 'wrg-toggle', toggleSize, color, {
      'wrg-toggle--checked': toggled,
      'wrg-toggle--disabled': disabled
    });

    return (
      <div className={ toggleClasses } onClick={ this.toggle } onKeyPress={ this.toggle } >
        <div className="wrg-toggle-container">
          <div className="wrg-toggle-check">
            { checkedIcon }
          </div>
          <div className="wrg-toggle-uncheck">
            { uncheckedIcon }
          </div>
        </div>
        <div className="wrg-toggle-circle" />
        <input className="wrg-toggle-input" type="checkbox" aria-label="Toggle Switch" />
      </div>
    );
  }
}

export default ToggleSwitch;