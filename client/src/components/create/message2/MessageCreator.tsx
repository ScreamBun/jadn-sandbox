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
    return (
        <div className='row'>
            <div className='col-md-6'>
                <div className='card'>
                    <div className='card-body p-2'>
                        <SBSelect>
                            placeholder={"Select a data type..."}
                            isSmStyle
                            isClearable
                        </SBSelect>
                    </div>
                </div>
            </div>
            <div className ='col-md-6'>
                <div className='card'>
                    <div className = "card-header p-2">
                        <h5>JSON Viewer</h5>
                    </div>
                    <div className='card-body p-2'>
                        <SBEditor></SBEditor>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default MessageCreator