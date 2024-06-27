import SBEditor from "components/common/SBEditor"
import React from "react"

const CborTranslated = (props: any) => {

    const { cborHex, cborAnnoHex } = props;    

    return (
        <>
        <div className="card mb-2">
            <div className="card-header p-2">
                CBOR Hex
            </div>
            <div className="card-body p-0 m-0">
                <SBEditor id='cborRawView' data={cborHex} convertTo={''} isReadOnly={'true'} onChange={''} height={'15vh'}></SBEditor> 
            </div>
        </div>

        <div className="card">
            <div className="card-header p-2">
                CBOR Annotated Hex
            </div>
            <div className="card-body p-0 m-0">
                <SBEditor id='annotatedHexView' data={cborAnnoHex} convertTo={''} isReadOnly={'true'} onChange={''} height={'49vh'}></SBEditor> 
            </div>
        </div>        
        </>
    )

}

export default CborTranslated