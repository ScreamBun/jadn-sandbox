import SBEditor from "components/common/SBEditor"
import { LANG_XML } from "components/utils/constants";
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
                <SBEditor id='xmlView' data={xml} convertTo={LANG_XML} isReadOnly={'true'} onChange={''} height={'69vh'}></SBEditor> 
            </div>
        </div>       
        </>
    )

}

export default XmlTranslated