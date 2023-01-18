import React, { useState } from 'react'
import JSONPretty from 'react-json-pretty'
import { useSelector } from 'react-redux'
import { TabContent, TabPane, Button, FormText } from 'reactstrap'
import { Field, delMultiKey, setMultiKey } from './lib'
import { getSelectedSchema } from 'reducers/generate'
import { StandardFieldArray } from '../schema/interface'

const MessageCreator = (props: any) => {
    const { message, setMessage } = props
    let schemaObj = useSelector(getSelectedSchema);

    //state 
    const [activeView, setActiveView] = useState('creator');
    const [commandType, setCommandType] = useState('');

    const exportRecords = schemaObj.info ? schemaObj.info && schemaObj.info.exports : [];
    const recordDefs = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === commandType) : [];

    const handleSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCommandType(e.target.value)
        setMessage({})
    }

    const optChange = (k: string, v: any) => {
        if (k.length > 1 && message[k[0]] && !message[k[0]][k[1]]) {
            delMultiKey(message, k[0].toString());
        }

        if (!['', ' ', null, undefined, [], {}].includes(v)) {
            setMultiKey(message, k.toString(), v);
        } else {
            delMultiKey(message, k.toString());
        }

        setMessage(message);
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
                        <div className='card-footer p-2'>
                            <div className='col-md-6 p-0 m-0 float-left'>
                                <select id='command-list' name='command-list' className='form-control' value={commandType} onChange={handleSelection}>
                                    <option value=''>Message Type</option>
                                    {exportRecords.map((rec: any) => <option key={rec} value={rec}>{rec}</option>)}
                                </select>
                            </div>
                            <Button onClick={() => setActiveView('message')} className="float-right" color="info">See Generated Message</Button>
                        </div>
                    </div>
                </TabPane>

                <TabPane tabId='message'>
                    <div className='card'>
                        <div className='card-body' style={{ height: '40em' }}>
                            <JSONPretty
                                id='message'
                                json={message}
                            />
                        </div>
                        <div className='card-footer p-2'>
                            <Button onClick={() => setActiveView('creator')} className="float-right" color="info">See Message Creator</Button>
                        </div>
                    </div>
                </TabPane>
            </TabContent>
        </fieldset>)

}
export default MessageCreator 