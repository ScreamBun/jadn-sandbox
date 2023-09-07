import { faCircleChevronUp, faCircleChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const SBToggleBtn = (props: any) => {

    const { toggle, setToggle, index, children } = props;

    const onToggleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (index) {
            if (index == toggle) {
                setToggle('');
            } else {
                setToggle(index);
            }
        } else {
            setToggle(!toggle);
        }
    }
    return (
        <div className='d-flex justify-content-between'>
            <div>
                {children}
            </div>
            <button onClick={onToggleClick} className='btn btn-sm'
                title={`${index ? (toggle == index ? 'hide' : 'show') : (toggle ? 'hide' : 'show')}`} >
                <FontAwesomeIcon icon={index ? (toggle == index ? faCircleChevronUp : faCircleChevronDown) : (toggle ? faCircleChevronUp : faCircleChevronDown)}
                />
            </button>
        </div>
    );
}

export default SBToggleBtn;