import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { TabContent, TabPane, Button, FormText } from 'reactstrap'
import { Field, delMultiKey, setMultiKey } from './lib/GenMsgLib'
import { getSelectedSchema } from 'reducers/util'
import { StandardFieldArray } from '../schema/interface'
import { faFileDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { sbToastError } from 'components/common/SBToast'
import SBCopyToClipboard from 'components/common/SBCopyToClipboard'
import SBEditor from 'components/common/SBEditor'
import { $FIELDNAME, $MAX_BINARY, $MAX_ELEMENTS, $MAX_STRING, $NSID, $SYS, $TYPENAME } from '../consts'

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

    let schemaObj = useSelector(getSelectedSchema);
    const exportRecords = schemaObj.info ? schemaObj.info && schemaObj.info.exports : [];
    const recordDefs = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === commandType) : [];

    //set configuration data
    const configDefs = schemaObj.info && schemaObj.info.config ? schemaObj.info.config : [];
    if (configDefs) {
        for (const [key, value] of Object.entries(configDefs)) {
            const parsedVal = /\d/.test(value) ? parseInt(value) : value;
            if (key in configOpt && configOpt[key] != value) {
                setConfigOpt({
                    ...configOpt,
                    [key]: parsedVal
                })
            }
        }
    }

    const handleSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCommandType(e.target.value);
        setGeneratedMessage({});
    }

    const optChange = (k: string, v: any) => {
        console.log(k, v)

        //TODO?: if v == undefined/ empty/ null /nothing in obj ===> delete

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
    if (commandType) {
        if (Array.isArray(recordDef[recordDef.length - 1]) && recordDef[recordDef.length - 1].length != 0) {
            const fields = recordDef[recordDef.length - 1] as Array<StandardFieldArray>;
            fieldDefs = fields.map(def => <Field key={`${def[0]}-${def[1]}`} def={def} optChange={optChange} config={configOpt} />);
        } else { //baseType = Primitive type, ArrayOf , MapOf --- convert TypeArray to FieldArray
            const field = [0, recordDef[0], recordDef[1], recordDef[2], recordDef[3], recordDef[4]];
            fieldDefs = <Field key={field[0]} def={field} optChange={optChange} config={configOpt} />;
        }
    } else {
        fieldDefs = (
            <FormText color="muted">
                Message generator will appear here after selecting a message type
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
                <div className='row no-gutters'>
                    <div className='col-md-3'>
                        <select id='command-list' name='command-list' className='form-control form-control-sm' value={commandType} disabled={exportRecords ? false : true} onChange={handleSelection}
                            title={exportRecords ? "Select message type to create based on valid JADN Schema" : "No Message Type Found. Please define exports in info section of schema."}>
                            <option value=''>Message Type</option>
                            {exportRecords ? exportRecords.map((rec: any) => <option key={rec} value={rec}>{rec}</option>) : []}
                        </select>
                    </div>
                    <div className='col'>
                        <SBCopyToClipboard buttonId='copyMessage2' data={generatedMessage} customClass='float-right' shouldStringify={true} />
                        <Button id='msgDownload' title="Download message" color="info" className='btn-sm float-right mr-1' onClick={msgDownload}>
                            <FontAwesomeIcon icon={faFileDownload} />
                        </Button>
                        <Button onClick={() => setActiveView('message')} className={`float-right btn-sm mr-1 ${activeView == 'message' ? ' d-none' : ''}`} color="info">View Message</Button>
                        <Button onClick={() => setActiveView('creator')} className={`float-right btn-sm mr-1 ${activeView == 'creator' ? ' d-none' : ''}`} color="info">View Creator</Button>
                    </div>
                </div>
            </div>
            <div className='card-body p-0' style={{ height: '40em', overflowY: 'auto' }}>
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
                        <SBEditor data={JSON.stringify(generatedMessage, null, 2)} isReadOnly={true}></SBEditor>
                    </TabPane>
                </TabContent>
            </div>
        </div>
    )
}
export default MessageCreator 