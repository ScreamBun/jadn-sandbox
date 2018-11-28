import React from 'react'

import { Button, ButtonGroup, FormGroup, Input, Label } from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faMinusSquare
} from '@fortawesome/free-solid-svg-icons'

// Key Value Editor
const KeyValueEditor = (props) => (
    <FormGroup row className='border m-1 p-1'>
        <Label for={ 'editor-' + props.id } sm={ 2 } ><strong>{ props.id }</strong></Label>
        <div className="input-group col-sm-10">
            <Input
                type="text"
                id={ 'editor-' + props.id }
                className="form-control"
                placeholder={ props.placeholder }
                value={ props.value }
                onChange={ e => props.change(e.target.value) }
            />
            <div className="input-group-append">
                <Button color='danger' onClick={ () => props.remove(props.id.toLowerCase()) }>
                    <FontAwesomeIcon
                        icon={ faMinusSquare }
                    />
                </Button>
            </div>
        </div>
    </FormGroup>
)

KeyValueEditor.defaultProps = {
    id: 'KeyValueEditor',
    placeholder: 'KeyValueEditor',
    value: '',
    change: (val) => {
        console.log(val)
    },
    remove: (id) => {
        console.log(id)
    }
}

export default KeyValueEditor