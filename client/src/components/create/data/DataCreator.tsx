import React, { useState } from 'react'
import { getSelectedSchema } from 'reducers/util'
import { useSelector } from 'react-redux'
import { $FIELDNAME, $MAX_BINARY, $MAX_ELEMENTS, $MAX_STRING, $NSID, $SYS, $TYPENAME } from '../consts'
import { StandardFieldArray } from '../schema/interface'
import { CoreType, Array } from 'components/create/data/lib/field/types/Types' // Uncomment if Array is a named export and needed
import SBEditor from 'components/common/SBEditor'
import SBScrollToTop from 'components/common/SBScrollToTop'

const DataCreator = (props: any) => {
    // Destructure props
    const { generatedMessage, setGeneratedMessage, selection, setSelection } = props;

    // Field Change Handler
    const fieldChange = (k: string, v: any) => {
        setGeneratedMessage((prev: any) => {
            const updated = { ...prev };
            if (v === "" || v === undefined || v === null) {
                delete updated[k];
            } else {
                updated[k] = v;
            }
            return updated;
        });
    };

    const card1 =  <CoreType {...{
                            field: [0, "Card 2", "boolean", [], "This is a test boolean"],
                            fieldChange: fieldChange}}
                        />  
    const card2 =  <CoreType {...{
                            field: [0, "Card 1", "binary", [], "This is a test binary"],
                            fieldChange: fieldChange}}
                        />  
    const card3 =  <Array
                                field={[0, "Array", "array", [], "This is a test array"]}
                                fieldChange={fieldChange}
                                children={[card1, card2]}
                            />  

    return (
        <div className='row'>
            <div className='col-md-6'>
                <div className='card'>
                    <div className='card-body p-2'>
                        <div id = "message-editor" className = 'card-body-page'>
                            <Array
                                field={[0, "Parent Array", "array", [], "This is a test array"]}
                                fieldChange={fieldChange}
                                children={[card3]}
                            />  
                        </div>
                        <SBScrollToTop divID = "message-editor" />
                    </div>
                </div>
            </div>
             <div className ='col-md-6'>
                <div className='card'>
                    <div className='card-body p-2'>
                        <SBEditor data={generatedMessage} isReadOnly={true}></SBEditor>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataCreator;