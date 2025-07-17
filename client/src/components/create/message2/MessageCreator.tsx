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
    // Destructure props
    const { generatedMessage, setGeneratedMessage, commandType, setCommandType } = props
    // Configuration Options
    const [configOpt, setConfigOpt] = useState({
        $MaxBinary: $MAX_BINARY,
        $MaxString: $MAX_STRING,
        $MaxElements: $MAX_ELEMENTS,
        $Sys: $SYS,
        $TypeName: $TYPENAME,
        $FieldName: $FIELDNAME,
        $NSID: $NSID
    })

    // Initiate Schema Object and pull exports and types
    let schemaObj = useSelector(getSelectedSchema);
    const roots = schemaObj.meta ? schemaObj.meta && schemaObj.meta.roots : [];
    const typeDefs = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === commandType?.value) : [];

    // Set Configuration Data
    const configDefs = schemaObj.meta && schemaObj.meta.config ? schemaObj.meta.config : [];
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

    // Handle User Dropdown Selection
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

    const updateJson = () => {
        setGeneratedMessage({ ...generatedMessage });
    }

    const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
    let commandFields: null | JSX.Element = null;
    let fieldDefs: null | JSX.Element | JSX.Element[] = null;

    // Decide which fields to display based on command type
    if (commandType?.value) {
        if (Array.isArray(typeDef[typeDef.length - 1]) && typeDef[typeDef.length - 1].length != 0) {
            // If not choice or enumerated
            if (typeDef[1] && typeDef[1].toLowerCase() != 'choice' && typeDef[1].toLowerCase() != 'enumerated') {
                const fields = typeDef[typeDef.length - 1] as Array<StandardFieldArray>;
                fieldDefs = fields.map(def => 
                    <Field key={`${def[0]}-${def[1]}`} 
                        def={def} 
                        optChange={optChange} 
                        config={configOpt} />);
            // If choice or enumerated
            } else if (typeDef[1] && typeDef[1].toLowerCase() == 'choice' || typeDef[1].toLowerCase() == 'enumerated') {
                const field = [0, typeDef[0], typeDef[0], typeDef[2], typeDef[3], typeDef[4]];
                fieldDefs = 
                    <Field key={field[0]} 
                        def={field} 
                        optChange={optChange} 
                        config={configOpt} />;
            }
        // Core Types
        } else {
            const field = [0, typeDef[0], typeDef[1], typeDef[2], typeDef[3], typeDef[4]];
            fieldDefs = 
                <Field key={field[0]} 
                    def={field} 
                    optChange={optChange} 
                    config={configOpt} />;
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
        <div className='row'>
            <div className='col-md-6'>
                <div className='card'>
                    <div className='card-body p-2'>
                        <div className="d-flex">
                            <SBSelect id={"command-list"}
                                data={roots}
                                onChange={handleSelection}
                                placeholder={'Select a data type...'}
                                value={commandType}
                                isSmStyle
                                isClearable
                                customNoOptionMsg={Object.keys(schemaObj).length != 0 ? 'Schema is missing Roots' : 'Select a schema to begin'}
                            />
                        </div>
                        <div id='command-fields'>
                            {commandFields}
                            <div id="fieldDefs" className = "overflow-auto" style={{maxHeight:'585px'}}>
                                {fieldDefs}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className ='col-md-6'>
                <div className='card'>
                    <div className = "card-header p-2 d-flex align-items-center">
                        <h5 className = "mb-0">JSON Viewer</h5>
                        <div className = "ms-auto">
                            <button type='button' onClick={updateJson} className={`btn btn-sm btn-primary float-end ms-1`} >Update JSON</button>
                            <SBSaveFile buttonId={'saveMessage'} toolTip={'Save Message'} data={generatedMessage} loc={'messages'} customClass={"float-end ms-1"} ext={LANG_JSON} />
                            <SBCopyToClipboard buttonId={'copyMessage'} data={generatedMessage} customClass='float-end' shouldStringify={true} />
                            <SBDownloadBtn buttonId='msgDownload' customClass='float-end me-1' data={JSON.stringify(generatedMessage, null, 2)} ext={LANG_JSON} />
                        </div>
                    </div>
                    <div className='card-body p-2'>
                        <SBEditor data={generatedMessage} isReadOnly={true}></SBEditor>
                    </div>
                    <SBScrollToTop divID='message-editor' />
                </div>
            </div>
        </div>
    );
}
export default MessageCreator