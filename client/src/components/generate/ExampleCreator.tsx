import React, { useState } from 'react'
import SBCopyToClipboard from 'components/common/SBCopyToClipboard'
import SBEditor from 'components/common/SBEditor'
import SBDownloadFile from 'components/common/SBDownloadFile'
import SBSpinner from 'components/common/SBSpinner'
import SBSaveFile from 'components/common/SBSaveFile'
import { useSelector } from 'react-redux'
import { getSelectedSchema } from 'reducers/util'
//TODO: create messages in other languages ?
//TODO: create messages with specific requirements - filter ?
const ExampleCreator = (props: any) => {
    const { generatedMessages, isLoading, numOfMsg, setNumOfMsg } = props;
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
                <h5 className="mb-0">
                    <button className="btn btn-link" id={`toggleMsg#${i}`} type="button" onClick={() => onToggle(i)} >
                        Message Example #{i + 1}
                    </button>
                    <SBCopyToClipboard buttonId={`copyMsgExample${i}`} data={message} customClass='float-end' />
                    <SBSaveFile data={message} loc={'messages'} customClass={"float-end me-1"} filename={`MessageExample${i + 1}`} ext={'json'} />
                    <SBDownloadFile buttonId={`downloadMsgExample${i}`} customClass='me-1 float-end' filename={`MessageExample${i + 1}`} data={message} ext={'json'} />
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
                            placeholder='Select number of examples...(1-10)' min={1} max={10} />
                    </div>
                    <div className='col-md-7'>
                        {isLoading ? <SBSpinner action={'Generating'} /> :
                            <button type="submit" id="translateSchema" className="btn btn-success btn-sm me-1 float-end"
                                disabled={Object.keys(validSchema).length != 0 && numOfMsg != '' ? false : true}
                                title={"Generate example messages based on selected schema"}>
                                Generate
                            </button>}
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