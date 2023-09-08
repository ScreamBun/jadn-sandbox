import React, { useState } from 'react'
import { TabContent, TabPane, Button, FormText } from 'reactstrap'
import { Field, delMultiKey, setMultiKey } from './lib/GenMsgLib'
import { StandardFieldArray } from '../schema/interface'
import SBCopyToClipboard from 'components/common/SBCopyToClipboard'
import SBEditor from 'components/common/SBEditor'
import { $FIELDNAME, $MAX_BINARY, $MAX_ELEMENTS, $MAX_STRING, $NSID, $SYS, $TYPENAME } from '../consts'
import SBDownloadFile from 'components/common/SBDownloadFile'
import SBSaveFile from 'components/common/SBSaveFile'
import SBSelect, { Option } from 'components/common/SBSelect'
import SBScrollToTop from 'components/common/SBScrollToTop'
import { getSelectedSchema } from 'reducers/util'
import { useSelector } from 'react-redux'

const MessageCreator = (props: any) => {
    const { generatedMessage, setGeneratedMessage, commandType, setCommandType } = props
    const [activeView, setActiveView] = useState('creator');
    const [configOpt, setConfigOpt] = useState({
        $MaxBinary: $MAX_BINARY,
        $MaxString: $MAX_STRING,
        $MaxElements: $MAX_ELEMENTS,
        $Sys: $SYS,
        $TypeName: $TYPENAME,
        $FieldName: $FIELDNAME,
        $NSID: $NSID
    })

    const schemaObj = useSelector(getSelectedSchema);
    const exportRecords = schemaObj.info ? schemaObj.info && schemaObj.info.exports : [];
    const recordDefs = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === commandType?.value) : [];

    //set configuration data
    const configDefs = schemaObj.info && schemaObj.info.config ? schemaObj.info.config : [];
    if (configDefs) {
        for (const [key, value] of Object.entries(configDefs)) {
            if (key in configOpt && configOpt[key] != value && value != '') {
                setConfigOpt({
                    ...configOpt,
                    [key]: value
                })
            }
        }
    }

    const handleSelection = (e: Option) => {
        setCommandType(e);
        setGeneratedMessage({});
    }

    const optChange = (k: string, v: any) => {
        console.log(k, v)
        const keys = k.split('.');

        if (v) {
            setMultiKey(generatedMessage, k.toString(), v);
        } else {
            delMultiKey(generatedMessage, k.toString());
            if (keys.length > 1 && generatedMessage[keys[0]] && !generatedMessage[keys[0]][keys[1]]) {
                delMultiKey(generatedMessage, keys[0].toString());
            }
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
    if (commandType?.value) {
        if (Array.isArray(recordDef[recordDef.length - 1]) && recordDef[recordDef.length - 1].length != 0) {
            if (recordDef[1] && recordDef[1].toLowerCase() != 'choice' && recordDef[1].toLowerCase() != 'enumerated') { //check not choice or enum type
                const fields = recordDef[recordDef.length - 1] as Array<StandardFieldArray>;
                fieldDefs = fields.map(def => <Field key={`${def[0]}-${def[1]}`} def={def} optChange={optChange} config={configOpt} />);
            } else if (recordDef[1] && recordDef[1].toLowerCase() == 'choice' || recordDef[1].toLowerCase() == 'enumerated') {
                const field = [0, recordDef[0], recordDef[0], recordDef[2], recordDef[3], recordDef[4]];
                fieldDefs = <Field key={field[0]} def={field} optChange={optChange} config={configOpt} />;
            }
        } else { //baseType = Primitive type, ArrayOf , MapOf --- convert TypeArray to FieldArray
            const field = [0, recordDef[0], recordDef[1], recordDef[2], recordDef[3], recordDef[4]];
            fieldDefs = <Field key={field[0]} def={field} optChange={optChange} config={configOpt} />;
        }
    } else {
        fieldDefs = (
            <FormText color="muted">
                Message generator will appear here after selecting a message type
                &nbsp;
                {commandType?.value}
            </FormText>
        );
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-6'>
                        <div className="input-group">
                            <SBSelect id={"command-list"}
                                data={exportRecords}
                                onChange={handleSelection}
                                placeholder={'Select a message type...'}
                                value={commandType} isSmStyle
                            />
                            <div className="input-group-btn ml-1">
                                <SBSaveFile buttonId={'saveMessage'} toolTip={'Save Message'} data={generatedMessage} loc={'messages'} customClass={"float-right mr-1"} ext={'json'} />
                            </div>
                        </div>
                    </div>
                    <div className='col'>
                        <SBCopyToClipboard buttonId={'copyMessage'} data={generatedMessage} customClass='float-right' shouldStringify={true} />
                        <SBDownloadFile buttonId='msgDownload' customClass='float-right mr-1' data={JSON.stringify(generatedMessage, null, 2)} ext={'json'} />

                        <Button onClick={() => setActiveView('message')} className={`float-right btn-sm mr-1 ${activeView == 'message' ? ' d-none' : ''}`} color="primary">View Message</Button>
                        <Button onClick={() => setActiveView('creator')} className={`float-right btn-sm mr-1 ${activeView == 'creator' ? ' d-none' : ''}`} color="primary">View Creator</Button>
                    </div>
                </div>
            </div>
            <div className='card-body-page' id="message-editor">
                <TabContent activeTab={activeView}>
                    <TabPane tabId='creator'>
                        <div id='command-fields' className='p-2'>
                            {commandFields}
                            <div id="fieldDefs">
                                {fieldDefs}
                            </div>
                        </div>
                    </TabPane>

                    <TabPane tabId='message'>
                        <SBEditor data={generatedMessage} isReadOnly={true}></SBEditor>
                    </TabPane>
                    <SBScrollToTop divID='message-editor' />
                </TabContent>
            </div>
        </div>
    )
}
export default MessageCreator 