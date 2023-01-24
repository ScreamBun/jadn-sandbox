import React, { useState } from 'react'
import JSONPretty from 'react-json-pretty'
import { useSelector } from 'react-redux'
import { TabContent, TabPane, Button, FormText } from 'reactstrap'
import { Field, delMultiKey, setMultiKey } from './lib'
import { getSelectedSchema } from 'reducers/util'
import { StandardFieldArray } from '../schema/interface'
import { faFileDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { sbToastError } from 'components/common/SBToast'
import SBCopyToClipboard from 'components/common/SBCopyToClipboard'

const MessageCreator = (props: any) => {
    const { generatedMessage, setGeneratedMessage, commandType, setCommandType } = props
    let schemaObj = useSelector(getSelectedSchema);

    //state 
    const [activeView, setActiveView] = useState('creator');

    const exportRecords = schemaObj.info ? schemaObj.info && schemaObj.info.exports : [];
    const recordDefs = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === commandType) : [];

    const handleSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCommandType(e.target.value);
        setGeneratedMessage({});
    }

    const optChange = (k: string, v: any) => {
        if (k.length > 1 && generatedMessage[k[0]] && !generatedMessage[k[0]][k[1]]) {
            delMultiKey(generatedMessage, k[0].toString());
        }

        if (!['', ' ', null, undefined, [], {}].includes(v)) {
            setMultiKey(generatedMessage, k.toString(), v);
        } else {
            delMultiKey(generatedMessage, k.toString());
        }

        setGeneratedMessage(generatedMessage);
    }

    const recordDef = recordDefs.length === 1 ? recordDefs[0] : [];
    let commandFields: null | JSX.Element = null;

    if (recordDef.length > 1 && recordDef[recordDef.length - 2].length > 0) {
        commandFields = (
            <FormText color="muted">
                <b>Comment: </b>
                {recordDef[recordDef.length - 2]}
            </FormText>
        );
    }

    let fieldDefs: null | JSX.Element | JSX.Element[] = null;
    if (Array.isArray(recordDef[recordDef.length - 1])) {
        const fields = recordDef[recordDef.length - 1] as Array<StandardFieldArray>;
        fieldDefs = fields.map(def => <Field key={`${def[0]}-${def[1]}`} def={def} optChange={optChange} />);
    } else {
        fieldDefs = (
            <FormText color="muted">
                Command Fields will appear here after selecting a type
                &nbsp;
                {commandType}
            </FormText>
        );
    }

    const msgDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (generatedMessage != '{}') {
            try {
                const data = JSON.stringify(generatedMessage, null, 2);
                const filename = `schema.json`;

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
        <fieldset className="p-0">
            <legend>Message Creator</legend>
            <TabContent activeTab={activeView}>
                <TabPane tabId='creator'>
                    <div className='card'>
                        <div className='card-body p-0' style={{ height: '40em' }}>
                            <div id='command-fields' className='p-2' style={{ height: '40em', overflow: 'auto' }}>
                                {commandFields}
                                <div id="fieldDefs">
                                    {fieldDefs}
                                </div>
                            </div>
                        </div>
                        <div className='card-footer p-1'>
                            <div className='row no-gutters'>
                                <div className='col-md-6'>
                                    <select id='command-list' name='command-list' className='form-control form-control-sm' value={commandType} onChange={handleSelection}
                                        title="Select message type to create based on valid JADN Schema">
                                        <option value=''>Message Type</option>
                                        {exportRecords.map((rec: any) => <option key={rec} value={rec}>{rec}</option>)}
                                    </select>
                                </div>
                                <div className='col-md-6'>
                                    <SBCopyToClipboard buttonId='copyMessage1' data={generatedMessage} customClass='float-right' shouldStringify={true} />
                                    <Button id='msgDownload' title="Download message" color="info" className='btn-sm float-right mr-1' onClick={msgDownload}>
                                        <FontAwesomeIcon icon={faFileDownload} />
                                    </Button>
                                    <Button onClick={() => setActiveView('message')} className="float-right btn-sm mr-1" color="info">View JSON</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPane>

                <TabPane tabId='message'>
                    <div className='card'>
                        <div className='card-body' style={{ height: '40em' }}>
                            <JSONPretty
                                id='message'
                                json={generatedMessage}
                            />
                        </div>
                        <div className='card-footer p-1'>
                            <SBCopyToClipboard buttonId='copyMessage2' data={generatedMessage} customClass='float-right' />
                            <Button id='msgDownload' title="Downloa message" color="info" className='btn-sm float-right mr-1' onClick={msgDownload}>
                                <FontAwesomeIcon icon={faFileDownload} />
                            </Button>
                            <Button onClick={() => setActiveView('creator')} className="float-right btn-sm mr-1" color="info">View Creator</Button>
                        </div>
                    </div>
                </TabPane>
            </TabContent>
        </fieldset>)
}
export default MessageCreator 