import React from 'react'
import {
    KeyArrayEditor,
    KeyObjectEditor,
    KeyValueEditor,
} from './editors'

const metaDef = ({k='key',  v=''}) => {
    return {
        [k]: v
    }
}

// JADN Meta Structure
export default {
    title: {
        key: 'Title',
        edit: (val) => metaDef({k: 'title', v: val}),
        editor: ({...props}) => <KeyValueEditor id='Title' {...props} />
    },
    description: {
        key: 'Description',
        edit: (val) => metaDef({k: 'description', v: val}),
        editor: ({...props}) => <KeyValueEditor id='Description' {...props} />
    },
    module: {
        key: 'Module',
        edit: (val) => metaDef({k: 'module', v: val}),
        editor: ({...props}) => <KeyValueEditor id='Module' {...props} />
    },
    version: {
        key: 'Version',
        edit: (val) => metaDef({k: 'version', v: val}),
        editor: ({...props}) => <KeyValueEditor id='Version' {...props} />
    },
    patch: {
        key: 'Patch',
        edit: (val) => metaDef({k: 'patch', v: val}),
        editor: ({...props}) => <KeyValueEditor id='Patch' {...props} />
    },
    imports: {
        key: 'Imports',
        edit: (val=[]) => metaDef({k: 'imports', v: val}),
        editor: ({...props}) => <KeyObjectEditor id='Imports' {...props} />
    },
    exports: {
        key: 'Exports',
        edit: (val=[]) => metaDef({k: 'exports', v: val}),
        editor: ({...props}) => <KeyArrayEditor id='Exports' {...props} />
    }
}