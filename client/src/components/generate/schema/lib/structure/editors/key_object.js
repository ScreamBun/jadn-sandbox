import React, { Component } from 'react'

import { Button, ButtonGroup, FormGroup, Input, Label } from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faMinusCircle,
    faMinusSquare,
    faPlusSquare
} from '@fortawesome/free-solid-svg-icons'

// Key Object Editor
const KeyObjectEditor = (props) => {
    const removeAll = (e) => props.remove(props.id.toLowerCase())

    const removeIndex = (e) => {
        if (props.value.length > 1) {
            console.log('WHOOT')
            let index = e.currentTarget.attributes.getNamedItem('data-index').value.split(',')[0]
            let tmpValue = [ ...props.value ]
            tmpValue.splice(index, 1)
            props.change(tmpValue)
        } else {
            console.log('cant remove')
        }
    }

    const addIndex = () => {
        let tmpValue = [ ...props.value ]
        tmpValue.push(['', ''])
        props.change(tmpValue)
    }

    const onChange = (e) => {
        let index = e.target.attributes.getNamedItem('data-index').value.split(',')
        let value = e.target.value

        let tmpValue = [ ...props.value ]
        if (!tmpValue[index[0]]) {
            tmpValue[index[0]] = ['', '']
        }
        tmpValue[index[0]][index[1]] = value
        props.change(tmpValue)
    }

    let indices = props.value.map((obj, i) => (
        <div className="input-group col-sm-12 mb-1" key={ i }>
            <Input
                type="text"
                className="form-control"
                data-index={ [i,0] }
                placeholder={ props.placeholder }
                value={ obj[0] || '' }
                onChange={ onChange }
            />
            <Input
                type="text"
                className="form-control"
                data-index={ [i,1] }
                placeholder={ props.placeholder }
                value={ obj[1] || '' }
                onChange={ onChange }
            />
            <div className="input-group-append">
                <Button color='danger' onClick={ removeIndex } data-index={ i }>
                    <FontAwesomeIcon
                        icon={ faMinusSquare }
                    />
                </Button>
            </div>
        </div>
    ))

    return (
        <div className='border m-1 p-1'>
            <ButtonGroup size='sm' className='float-right'>
                <Button color='info' onClick={ addIndex } >
                    <FontAwesomeIcon
                        icon={ faPlusSquare }
                    />
                </Button>
                <Button color='danger' onClick={ removeAll } >
                    <FontAwesomeIcon
                        icon={ faMinusCircle }
                    />
                </Button>
            </ButtonGroup>

            <div className='border-bottom mb-2'>
                <p className='col-sm-4 my-1'><strong>{ props.id }</strong></p>
            </div>

            <div className='row m-0 indices'>
                { indices }
            </div>
        </div>
    )
}

KeyObjectEditor.defaultProps = {
    id: 'KeyObjectEditor',
    placeholder: 'KeyObjectEditor',
    value: [],
    change: (val) => {
        console.log(val)
    },
    remove: (id) => {
        console.log(id)
    }
}

export default KeyObjectEditor