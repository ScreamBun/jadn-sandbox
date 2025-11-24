import SBEditor from "components/common/SBEditor"
import React from "react"

const CompactTranslated = (props: any) => {

    const { compact } = props;    

    return (
        <>
        <div className="card mb-2">
            <div className="card-header p-2">
                JSON Compact
            </div>
            <div className="card-body p-0 m-0">
                <SBEditor id='compactView' data={compact} isReadOnly={'true'} onChange={''} height={'69vh'}></SBEditor> 
            </div>
        </div>       
        </>
    )

}

export default CompactTranslated