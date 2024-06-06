import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuid4} from 'uuid';

const SBUUIDv4Btn = (props: any) => {
    const { uuidOnClick } = props;

    const onCreateUUIDv4 = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const data = uuid4();
        uuidOnClick(data)
    }

    return (
        <button type='button'
            className="btn btn-sm btn-primary"
            title={"Generate a UUIDv4"}
            name={"generate_uuid"}
            onClick={onCreateUUIDv4}>     
            <FontAwesomeIcon icon={faPlusSquare} />
        </button>
    );
}

export default SBUUIDv4Btn;