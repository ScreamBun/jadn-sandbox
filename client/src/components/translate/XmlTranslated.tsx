import SBEditor from "components/common/SBEditor"
import React from "react"

const XmlTranslated = (props: any) => {

    const { xml } = props;    

    return (
        <>
        <div className="card mb-2">
            <div className="card-header p-2">
                XML
            </div>
            <div className="card-body p-0 m-0">
                <SBEditor id='xmlView' data={xml} convertTo={''} isReadOnly={'true'} onChange={''} height={'69vh'}></SBEditor> 
            </div>
        </div>       
        </>
    )

}

export default XmlTranslated