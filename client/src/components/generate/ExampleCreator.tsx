import React, { useState } from 'react'
import { Button } from 'reactstrap'
import { faFileDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { sbToastError } from 'components/common/SBToast'
import SBCopyToClipboard from 'components/common/SBCopyToClipboard'
import SBEditor from 'components/common/SBEditor'

const ExampleCreator = (props: any) => {
    const { generatedMessages, loadedSchema } = props;
    const [toggle, setToggle] = useState('');

    const onToggle = (index: number) => {
        if (toggle == index.toString()) {
            setToggle('');

        } else {
            setToggle(`${index}`);
        }
    }

    const msgDownload = (index: number) => {
        try {
            const data = generatedMessages[index];
            const filename = `message_example_${index}.json`;

            const blob = new Blob([data], { type: "application/json" });
            const elem = document.createElement('a');
            elem.href = URL.createObjectURL(blob);
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();

            elem.remove();
            URL.revokeObjectURL(elem.href);
        } catch (err) {
            console.log(err);
            sbToastError(`File cannot be downloaded`);
        }
    }

    const msgList = generatedMessages.map((message: string, i: number) => (
        <div className="card" key={i}>
            <div className="card-header">
                <h5 className="mb-0">
                    <button className="btn btn-link" id ={`toggleMsg#${i}`} type="button" onClick={() => onToggle(i)} >
                        Message Example #{i}
                    </button>
                    <SBCopyToClipboard buttonId={`copyMsgExample${i}`} data={message} customClass='float-right' />
                    <Button id={`downloadMsgExample${i}`} title="Download generated message" color="info" className='btn-sm mr-1 float-right' onClick={() => msgDownload(i)}>
                        <FontAwesomeIcon icon={faFileDownload} />
                    </Button>
                </h5>
            </div>

            {toggle == `${i}` ?
                <div className="card-body" key={i}>
                    <SBEditor data={message} isReadOnly={true} height={'20em'}></SBEditor>
                </div> : ''}
        </div>
    ));

    return (
        <div className="card">
            <div className="card-header p-2">
                <Button color="success" type="submit" id="translateSchema" className="btn-sm mr-1 float-right"
                    disabled={loadedSchema ? false : true}
                    title={loadedSchema ? "Generate example messages based on selected schema" : "Please select schema"}>
                    Generate
                </Button>
            </div>
            <div className='card-body p-0' style={{ height: '40em', overflowY: 'auto' }}>
                {msgList}
            </div>
        </div >
    )
}
export default ExampleCreator 