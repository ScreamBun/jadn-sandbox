import React from 'react';
import PropTypes from 'prop-types';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.substring(1)

class ThemeChooser extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.onSelect = this.onSelect.bind(this);

        // get themes from context and sort them for display
        this.themes = [];

        context.themes.forEach(theme => {
            this.themes.push(theme);
        });

        this.themes.sort();
    }

    onSelect(e) {
        e.preventDefault();
        let chosenTheme = e.target.getAttribute('data-theme');
        this.context.themeSwitcher.load(chosenTheme);
    }

    render() {
        let style = this.props.style || {};
        let themes = this.themes.map(theme => {
            return (
                <li key={ theme } className={ theme === this.context.currentTheme ? 'active' : '' }>
                    <a href='#' className='dropdown-item' data-theme={ theme } onClick={ this.onSelect }>{ capitalize(theme) }</a>
                </li>
            )
        })

        return (
            <div className='dropdown dropdown-menu-right' style={ style }>
                <button
                    id='theme-menu'
                    className={ 'btn btn-default dropdown-toggle' + (this.props.size === '' ? '' : ' btn-' + this.props.size) }
                    type='button'
                    data-toggle='dropdown'
                    aria-haspopup='true'
                    aria-expanded='true'
                >
                    Theme
                </button>

                <ul className='dropdown-menu'>
                    { themes }
                </ul>
            </div>
        )
    }
}

ThemeChooser.contextTypes = {
    themeSwitcher: PropTypes.object,
    themes: PropTypes.array,
    currentTheme: PropTypes.string
};

ThemeChooser.propTypes = {
    size: PropTypes.oneOf(['sm', 'lg', ''])
};

ThemeChooser.defaultProps = {
    size: ''
};

export default ThemeChooser;