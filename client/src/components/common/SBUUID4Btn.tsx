import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuid4} from 'uuid';



    //UUID
const SBUUIDv4Btn = (props: any) => {
    const { uuidOnClick } = props;

    // State

    //const [data, setData] = useState("");
    // uuid creation on button interact 
    const onCreateUUIDv4 = (e: React.MouseEvent<HTMLButtonElement>) => {
        // for safety; remove later if necessary
        e.preventDefault();

        let data = uuid4();

        uuidOnClick(data)
        // "testing"
        console.log("button created uuid ",{data});


    }

    return (
        <button type='button'
            className="btn btn-sm btn-success float-end text-nowrap"
            title={"Create a random UUIDv4"}
            name={"generate uuid"}
            onClick={onCreateUUIDv4}>     
            <FontAwesomeIcon icon={faPaperPlane} />
        </button>

    );
}

export default SBUUIDv4Btn;