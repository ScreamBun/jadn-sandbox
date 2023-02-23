import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { TabContent, TabPane, Button, FormText } from 'reactstrap'
import { Field, delMultiKey, setMultiKey } from 'components/create/message/lib/GenMsgLib'
import { getSelectedSchema } from 'reducers/util'
import { StandardFieldArray } from 'components/create/schema/interface'
import { faFileDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { sbToastError } from 'components/common/SBToast'
import SBCopyToClipboard from 'components/common/SBCopyToClipboard'
import SBEditor from 'components/common/SBEditor'

const ExampleCreator = (props: any) => {
    const { generatedMessage, setGeneratedMessage } = props

    const [activeView, setActiveView] = useState('creator');

    let schemaObj = useSelector(getSelectedSchema);


    const handleSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setGeneratedMessage({});
    }

    const msgDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (generatedMessage != '{}') {
            try {
                const data = JSON.stringify(generatedMessage, null, 2);
                const filename = `message.json`;

                const blob = new Blob([data], { type: "application/json" });
                const elem = document.createElement('a');
                elem.href = URL.createObjectURL(blob);
                elem.download = filename;
                document.body.appendChild(elem);
                elem.click();

                elem.remove();
                URL.revokeObjectURL(elem.href);
            } catch (err) {
                console.log(err);
                sbToastError(`File cannot be downloaded`);
            }
        } else {
            sbToastError(`No Message Generated`);
        }
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                a header ...
            </div>
            <div className='card-body p-0' style={{ height: '40em', overflowY: 'auto' }}>
                Display a list of generated messages.
                make collapsible.
                copy and download buttons.
            </div>
        </div >)
}
export default ExampleCreator 