import React, { Component } from 'react'
import { toast } from 'react-toastify'


class Error extends Component {
    constructor(props) {
        super(props)
        console.log('Whoop, there\'s an issue here!')
    }

    goBack() {
        if (this.props.history.length === 1) {
            console.log('Cant Go Back!!')
            toast(<p>Looks like this is a new tab, try closing it instead of going back</p>, {type: toast.TYPE.WARNING})

        } else {
            console.log('Go Back!!')
            this.props.history.goBack()
        }
    }

    render() {
        return (
            <div className="jumbotron well col-md-10 col-12 mx-auto">
                <h1>Whoops</h1>
                <h3>This isn't a valid page, are you sure this is where you wanted to go?</h3>
                <button className='btn btn-primary' onClick={ () => { this.goBack() } }>Go Back</button>
            </div>
        )
    }
}

export default Error
