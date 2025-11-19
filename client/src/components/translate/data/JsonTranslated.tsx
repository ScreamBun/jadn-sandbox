import SBEditor from "components/common/SBEditor"
import React from "react"

const JsonTranslated = (props: any) => {

    const { json } = props;    

    return (
        <>
        <div className="card mb-2">
            <div className="card-header p-2">
                JSON Concise
            </div>
            <div className="card-body p-0 m-0">
                <SBEditor id='jsonView' data={json} isReadOnly={'true'} onChange={''} height={'69vh'}></SBEditor> 
            </div>
        </div>       
        </>
    )

}

export default JsonTranslated