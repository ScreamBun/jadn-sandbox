import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { getSelectedSchema } from 'reducers/util'
import { LANG_JSON, LANG_JSON_UPPER, LANG_XML_UPPER } from 'components/utils/constants'
import SBDownloadBtn from 'components/common/SBDownloadBtn'
import SBCopyToClipboard from 'components/common/SBCopyToClipboard'
import SBEditor from 'components/common/SBEditor'
import SBSaveFile from 'components/common/SBSaveFile'
import SBSubmitBtn from 'components/common/SBSubmitBtn'
import SBSelect from 'components/common/SBSelect'
import SBCompactBtn from 'components/common/SBCompactBtn'


export interface Option {
    readonly value: string | any;
    readonly label: string;
}

//TODO: create messages in other languages ?
//TODO: create messages with specific requirements - filter ?
const ExampleCreator = (props: any) => {
    const { formId, generatedMessages, isLoading, numOfMsg, setNumOfMsg, langSel, setLangSel } = props;
    const [toggle, setToggle] = useState<{ [key: string]: boolean }>({});

    const jsonOpt = new Option(LANG_JSON_UPPER);
    const xmlOpt = new Option(LANG_XML_UPPER);
    const [langs, setLangs] = useState<Option[]>([jsonOpt, xmlOpt]);
    const [compactJson, setCompactJson] = useState<boolean>(false);

    const validSchema = useSelector(getSelectedSchema);

    const onToggle = (index: number) => {
        setToggle((prev) => ({ ...prev, [index]: !prev[index] }));
    }

    const onNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setNumOfMsg(e.target.value);
    }

    const onLangChange = (e: React.ChangeEvent<Option>) => {
        console.log(e)
        setLangSel(e);
    }

    const msgList = generatedMessages.map((message: string, i: number) => (
        <div className="card" key={i}>
            <div className="card-header">
                <h5 className="mb-0 align-self-center">
                    <button className="btn btn-link" id={`toggleMsg#${i}`} type="button" onClick={() => onToggle(i)} >
                        Data Example #{i + 1}
                    </button>
                    <SBCompactBtn customClass={"float-end ms-1"} toggle={compactJson} ext={langSel?.value.toLowerCase()} data={message} handleCompactClick={() => setCompactJson(!compactJson)} />
                    <SBCopyToClipboard buttonId={`copyMsgExample${i}`} data={compactJson ? JSON.stringify(message) : message} customClass='float-end' />
                    <SBSaveFile data={compactJson ? JSON.stringify(message) : message} loc={'messages'} customClass={"float-end me-1"} filename={`MessageExample${i + 1}`} ext={LANG_JSON} />
                    <SBDownloadBtn buttonId={`downloadMsgExample${i}`} customClass='me-1 float-end' filename={`MessageExample${i + 1}`} data={compactJson ? JSON.stringify(message) : message} ext={LANG_JSON} />
                </h5>
            </div>

            {toggle[i] == true ?
                <div className="card-body" key={i}>
                    <SBEditor data={compactJson ? JSON.stringify(message) : message} convertTo={langSel.value || "JSON"} isReadOnly={true} height={'35vh'}></SBEditor>
                </div> : ''}
        </div>
    ));

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-2'>
                        <input id="numOfMsg" type='number' className='form-control form-control-sm' value={numOfMsg} onChange={onNumChange}
                            placeholder='Select number of examples...(1-5)' min={1} max={5} />
                    </div>
                    <div className='col-md-3'>
                        <SBSelect id="langSel" data={langs} value={langSel} onChange={onLangChange} isSmStyle={true}></SBSelect>   
                    </div>
                    <div className='col-md-7 align-self-center'>
                        <SBSubmitBtn buttonId="generateSchema"
                            buttonTitle="Generate example messages based on selected schema"
                            buttonTxt="Generate"
                            customClass="me-1 float-end"
                            isLoading={isLoading}
                            formId={formId}
                            isDisabled={Object.keys(validSchema).length != 0 && numOfMsg > 0 && numOfMsg <= 5 ? false : true}>
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