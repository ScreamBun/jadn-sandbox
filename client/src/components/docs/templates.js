import React from 'react'

import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardSubtitle,
    CardText,
    CardTitle,
    Table
} from 'reactstrap';


export const under_escape = (val) => val.replace(/\./g, '_')

const JADN_Table = (props) => (
    <Table hover striped responsive size="sm">
        { props.children }
    </Table>
)


export const Toggle_Template = ({header=''}={}) => {
    let esc_header = under_escape(header)
	return (
	    <span>
            { header }
            <Button
                className="float-right"
                color="info"
                type="button"
                data-toggle="collapse"
                data-target={ '#' + esc_header + '-api' }
                aria-expanded="false"
                aria-controls={ esc_header + '-api' }
            >
                API
            </Button>
        </span>
	)
}

export const Card_Template = ({id=null, header='', title=null, text=null, body=null}={}) => {
    let card_args = {
        className: "mb-3 w-100"
    }
    if (id != null) {
        card_args.id = under_escape(id)
        card_args.className += ' collapse'
    }

    return (
        <Card { ...card_args } >
            <CardHeader><h3>{ header }</h3></CardHeader>
            <CardBody>
                { title != null ? <CardTitle>{ title }</CardTitle> : '' }
                { text != null ? text.map((t, i) => <CardText key={ i }>{ t}</CardText>) : '' }
                { body != null ? body : '' }
            </CardBody>
        </Card>
    )
}

export const Constructor_Template = ({def='', info=null}={}) => {
    return (
        <div className="m-0 p-0 w-100">
            <h5 className="mt-4">Constructor</h5>
            <JADN_Table>
                <thead>
                    <tr>
                        <th scope="col">Constructor and Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <p><strong>{ def }</strong></p>
                            { info ? info.map((t, i) => <p key={ i }>{ t }</p>) : '' }
                        </td>
                    </tr>
                </tbody>
            </JADN_Table>
        </div>
    )
}

export const Enum_Template = ({name='', en=null}={}) => {
    return (
        <div className="m-0 p-0 w-100">
            <h5 className="mt-4">Enumeration</h5>
            <JADN_Table>
                <thead>
                    <tr>
                        <th scope="col">Name</th>
				        <th scope="col">Value and Info</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        en.map((e, i) => (
                            <tr key={ i }>
                                <td>
                                    { e.name ? <p><strong>{ e.name }</strong></p> : '' }
                                </td>
                                <td>
                                    { e.info.value ? <p><strong>{ e.info.value }</strong></p> : '' }
                                    { e.info.info ? e.info.info.map((t, k) => <p key={ k }>{ t }</p>) : ''}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </JADN_Table>
        </div>
    )
}

export const Function_Template = ({fun=null}={}) => {
    return (
        <div className="m-0 p-0 w-100">
            <h5 className="mt-4">Functions</h5>
            <JADN_Table>
                <thead>
                    <tr>
                        <th scope="col">Return type and Info</th>
                        <th scope="col">Function and Description</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        fun.map((f, i) => (
                            <tr key={ i }>
                                <td>
                                    { f.return.type ? <p><strong>{ f.return.type }</strong></p> : '' }
                                    { f.return.info ? f.return.info.map((t, j) => <p key={ j }>{ t }</p>) : ''}
                                </td>
                                <td>
                                    <p><strong>{ f.fun_desc.def }</strong></p>
                                     { f.fun_desc.info ? f.fun_desc.info.map((t, k) => <p key={ k }>{ t }</p>) : ''}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </JADN_Table>
        </div>
    )
}