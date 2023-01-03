import React, { useState } from 'react'
import JSONPretty from 'react-json-pretty'
import { TabContent, TabPane, Form, Button, FormText } from 'reactstrap'
import { StandardFieldArray } from '../schema/interface'
import { Field, delMultiKey, setMultiKey } from './lib'

const MessageCreator = (props: any) => {
    const { selectedSchema } = props

    //state 
    const [activeView, setActiveView] = useState('creator');
    const [message, setMessage] = useState({});
    const [commandType, setCommandType] = useState('');

    const exportRecords = selectedSchema.info ? selectedSchema.info && selectedSchema.info.exports : [];
    const recordDefs = selectedSchema.types ? selectedSchema.types.filter(t => t[0] === commandType) : [];

    const handleSelection = (e: any) => {
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
        return {
            message: message
        };
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
        <fieldset className="col-md-6 p-0 float-right">
            <legend>Message Creator</legend>
            <TabContent activeTab={activeView}>
                <TabPane tabId='creator'>
                    <div className='card'>
                        <div className='card-body p-0' style={{ height: '40em' }}>
                            <Form id='command-fields' className='card-body' onSubmit={() => { return false; }} style={{ height: '40em', overflow: 'scroll' }}>
                                {commandFields}
                                <div id="fieldDefs">
                                    {fieldDefs}
                                </div>
                            </Form>
                        </div>
                        <div className='card-footer pb-3'>
                            <div className='col-md-6 p-0 m-0 float-left'>
                                <select id='command-list' name='command-list' className='form-control' onChange={handleSelection}>
                                    <option value=''>Command Type</option>
                                    {exportRecords.map((rec: any) => <option key={rec} value={rec}>{rec}</option>)}
                                </select>
                            </div>

                            <Button onClick={() => setActiveView('message')} className="float-right"> See Generated Message </Button>
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
                        <div className='card-footer pb-3'>
                            <Button onClick={() => setActiveView('creator')} className="float-right"> See Message Creator </Button>
                        </div>
                    </div>
                </TabPane>
            </TabContent>
        </fieldset>)

}
export default MessageCreator 