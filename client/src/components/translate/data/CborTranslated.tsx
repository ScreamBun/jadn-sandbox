import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBDownloadBtn from "components/common/SBDownloadBtn";
import SBEditor from "components/common/SBEditor"
import React from "react"

const CborTranslated = (props: any) => {

    const { cborHex, cborAnnoHex } = props;    

    return (
        <>
        <div className="card mb-2">
            <div className="card-header p-2">
                CBOR Hex
                <SBCopyToClipboard buttonId={`copyCborHex`} data={cborHex} customClass='float-end' />
                <SBDownloadBtn buttonId={`downloadCborHex`} customClass='me-1 float-end' data={cborHex} ext={'.txt'} />                
            </div>
            <div className="card-body p-0 m-0">
                <SBEditor id='cborRawView' data={cborHex} convertTo={''} isReadOnly={'true'} onChange={''} height={'15vh'}></SBEditor> 
            </div>
        </div>

        <div className="card">
            <div className="card-header p-2">
                CBOR Annotated Hex
                <SBCopyToClipboard buttonId={`copyCborAnnoHex`} data={cborAnnoHex} customClass='float-end' />
                <SBDownloadBtn buttonId={`downloadCborAnnoHex`} customClass='me-1 float-end' data={cborAnnoHex} ext={'.txt'} />                 
            </div>
            <div className="card-body p-0 m-0">
                <SBEditor id='annotatedHexView' data={cborAnnoHex} convertTo={''} isReadOnly={'true'} onChange={''} height={'49vh'}></SBEditor> 
            </div>
        </div>        
        </>
    )

}

export default CborTranslated