import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { getSelectedSchema } from 'reducers/util'
import { LANG_JSON } from 'components/utils/constants'
import SBDownloadBtn from 'components/common/SBDownloadBtn'
import SBCopyToClipboard from 'components/common/SBCopyToClipboard'
import SBEditor from 'components/common/SBEditor'
import SBSaveFile from 'components/common/SBSaveFile'
import SBSubmitBtn from 'components/common/SBSubmitBtn'

//TODO: create messages in other languages ?
//TODO: create messages with specific requirements - filter ?
const ExampleCreator = (props: any) => {
    const { generatedMessages, isLoading, numOfMsg, setNumOfMsg, formId } = props;
    const [toggle, setToggle] = useState<{ [key: string]: boolean }>({});
    const validSchema = useSelector(getSelectedSchema);

    const onToggle = (index: number) => {
        setToggle((prev) => ({ ...prev, [index]: !prev[index] }));
    }

    const onNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setNumOfMsg(e.target.value);
    }

    const msgList = generatedMessages.map((message: string, i: number) => (
        <div className="card" key={i}>
            <div className="card-header">
                <h5 className="mb-0 align-self-center">
                    <button className="btn btn-link" id={`toggleMsg#${i}`} type="button" onClick={() => onToggle(i)} >
                        Data Example #{i + 1}
                    </button>
                    <SBCopyToClipboard buttonId={`copyMsgExample${i}`} data={message} customClass='float-end' />
                    <SBSaveFile data={message} loc={'messages'} customClass={"float-end me-1"} filename={`MessageExample${i + 1}`} ext={LANG_JSON} />
                    <SBDownloadBtn buttonId={`downloadMsgExample${i}`} customClass='me-1 float-end' filename={`MessageExample${i + 1}`} data={message} ext={LANG_JSON} />
                </h5>
            </div>

            {toggle[i] == true ?
                <div className="card-body" key={i}>
                    <SBEditor data={message} isReadOnly={true} height={'35vh'}></SBEditor>
                </div> : ''}
        </div>
    ));

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-5'>
                        <input id="numOfMsg" type='number' className='form-control form-control-sm' value={numOfMsg} onChange={onNumChange}
                            style={{ height: '38px' }}
                            placeholder='Select number of examples...(1-10)' min={1} max={10} />
                    </div>
                    <div className='col-md-7 align-self-center'>
                        <SBSubmitBtn buttonId="generateSchema"
                            buttonTitle="Generate example messages based on selected schema"
                            buttonTxt="Generate"
                            customClass="me-1 float-end"
                            isLoading={isLoading}
                            formId={formId}
                            isDisabled={Object.keys(validSchema).length != 0 && numOfMsg > 0 && numOfMsg <= 10 ? false : true}>
                        </SBSubmitBtn>
                    </div>
                </div>
            </div>
            <div className='card-body-page'>
                {msgList}
            </div>
        </div >
    )
}
export default ExampleCreator 