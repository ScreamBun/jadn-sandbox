import React, { useState } from 'react'
import { getSelectedSchema } from 'reducers/util'
import { useSelector } from 'react-redux'
import { Field, delMultiKey, setMultiKey } from './lib/GenMsgLib'
import { StandardFieldArray } from '../schema/interface'
import { $FIELDNAME, $MAX_BINARY, $MAX_ELEMENTS, $MAX_STRING, $NSID, $SYS, $TYPENAME } from '../consts'
import { LANG_JSON } from 'components/utils/constants'
import SBCopyToClipboard from 'components/common/SBCopyToClipboard'
import SBEditor from 'components/common/SBEditor'
import SBSaveFile from 'components/common/SBSaveFile'
import SBSelect, { Option } from 'components/common/SBSelect'
import SBScrollToTop from 'components/common/SBScrollToTop'
import SBDownloadBtn from 'components/common/SBDownloadBtn'

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
            <small id="exportHelpBlock" className="form-text text-muted">
                <b>Comment: </b>
                {recordDef[recordDef.length - 2]}
            </small>
        );
    }

    let fieldDefs: null | JSX.Element | JSX.Element[] = null;
    if (commandType?.value) {
        //TODO: add value={} --> This is for uploading preloaded messages.
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
            <small id="msgGenHelpBlock" className="form-text text-muted">
                Data generator will appear here after selecting a data type
                &nbsp;
                {commandType?.value}
            </small>
        );
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-6 align-self-center'>
                        <div className="d-flex">
                            <SBSelect id={"command-list"}
                                data={exportRecords}
                                onChange={handleSelection}
                                placeholder={'Select a data type...'}
                                value={commandType}
                                isSmStyle
                                isClearable
                                customNoOptionMsg={Object.keys(schemaObj).length != 0 ? 'Schema is missing Exports' : 'Select a schema to begin'}
                            />
                            <SBSaveFile buttonId={'saveMessage'} toolTip={'Save Message'} data={generatedMessage} loc={'messages'} customClass={"float-end ms-1"} ext={LANG_JSON} />
                        </div>
                    </div>
                    <div className='col align-self-center'>
                        <SBCopyToClipboard buttonId={'copyMessage'} data={generatedMessage} customClass='float-end' shouldStringify={true} />
                        <SBDownloadBtn buttonId='msgDownload' customClass='float-end me-1' data={JSON.stringify(generatedMessage, null, 2)} ext={LANG_JSON} />

                        <button type='button' onClick={() => setActiveView('message')} className={`btn btn-primary float-end btn-sm me-1 ${activeView == 'message' ? ' d-none' : ''}`} >View JSON</button>
                        <button type='button' onClick={() => setActiveView('creator')} className={`btn btn-primary float-end btn-sm me-1 ${activeView == 'creator' ? ' d-none' : ''}`} >View Creator</button>
                    </div>
                </div>
            </div>
            <div className='card-body-page' id="message-editor">
                <div className='tab-content mb-2'>
                    <div className={`container-fluid tab-pane fade ${activeView == 'creator' ? 'show active' : ''}`} id="info" role="tabpanel" aria-labelledby="info-tab" tabIndex={0}>
                        <div id='command-fields' className='p-2'>
                            {commandFields}
                            <div id="fieldDefs">
                                {fieldDefs}
                            </div>
                        </div>
                    </div>

                    <div className={`tab-pane fade ${activeView == 'message' ? 'show active' : ''}`} id="message" role="tabpanel" aria-labelledby="message-tab" tabIndex={0}>
                        <SBEditor data={generatedMessage} isReadOnly={true}></SBEditor>
                    </div>
                    <SBScrollToTop divID='message-editor' />
                </div>
            </div>
        </div>
    )
}
export default MessageCreator 