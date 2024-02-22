import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuid4} from 'uuid';

const SBUUIDv4Btn = (props: any) => {
    const { uuidOnClick } = props;

    // uuid creation on button interact 
    const onCreateUUIDv4 = (e: React.MouseEvent<HTMLButtonElement>) => {
        // for safety; remove later if necessary
        e.preventDefault();
        let data = uuid4();
        uuidOnClick(data)
    }

    return (
        <button type='button'
            className="btn btn-sm btn-primary float-end text-nowrap"
            title={"Generate a UUIDv4"}
            name={"generate uuid"}
            onClick={onCreateUUIDv4}>     
            <FontAwesomeIcon icon={faPlusSquare} />
        </button>
    );
}

export default SBUUIDv4Btn;