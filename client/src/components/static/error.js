import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';


class Error extends Component {
  iconGeneral = {
    display: 'inline-block',
    width: '1em',
    height: '1em',
    fontSize: '4em',
    textAlign: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    MozAnimationDuration: '5s',
    OAnimationDuration: '5s',
    WebkitAnimationDuration: '5s',
    animationDuration: '5s'
  }

  reverseAnimation = {
    MozAnimationDirection: 'reverse',
    OAnimationDirection: 'reverse',
    WebkitAnimationDirection: 'reverse',
    animationDirection: 'reverse'
  }

  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this);

    console.log('Whoop, there\'s an issue here!');
  }

  goBack() {
    const { history } = this.props;
    if (history.length === 1) {
      console.log('Cant Go Back!!');
      toast(<p>Looks like this is a new tab, try closing it instead of going back</p>, {type: toast.TYPE.WARNING});
    } else {
      console.log('Go Back!!');
      history.goBack();
    }
  }

  render() {
    return (
      <div className="jumbotron well col-md-10 col-12 mx-auto">
        <h1>Whoops</h1>
        <h3>This isn&apos;t a valid page, are you sure this is where you wanted to go?</h3>
        <div className='mx-auto' style={{
          height: '9em',
          width: '9em',
          fontSize: '1em',
          position: 'relative'
        }}>
          <FontAwesomeIcon
            icon={ faCog }
            spin
            style={ this.iconGeneral }
          />
          <FontAwesomeIcon
            icon={ faCog }
            spin
            style={{
              ...this.iconGeneral,
              ...this.reverseAnimation,
              fontSize: '6em',
              top: '0.53em',
              left: '0.25em'
            }}
          />
          <FontAwesomeIcon
            icon={ faCog }
            spin
            style={{
              ...this.iconGeneral,
              fontSize: '3em',
              top: '0.25em',
              left: '1.7em'
            }}
          />
        </div>
        <button className='btn btn-primary' onClick={ this.goBack }>Go Back</button>
      </div>
    );
  }
}

export default Error;
