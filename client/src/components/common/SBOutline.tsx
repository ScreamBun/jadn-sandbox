
import React, { useEffect } from "react";
import { findDOMNode } from 'react-dom';
import dragula from "react-dragula"
import 'dragula/dist/dragula.css';
import { faCopy, faGrip, faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";

interface SBOutlineProps {
    id: string;
    title: string;
    items: any[];
    isReorder: boolean;
}

const SBOutline = (props: SBOutlineProps) => {
    const { id='sb-outline', title, items=[], isReorder=false } = props;

    useEffect(() => {
        const container = findDOMNode(document.getElementById(id));
        dragula([container]);
    }) 

    return (
        <>
            {items && items.length > 0 ? (
                <div className="sb-outline m-2">
                    <h5>{title}</h5>
                    <ul id={id} className="list-group">
                        {items.map((item, i) => {
                            if (Array.isArray(item)) {
                                return (
                                    <li key={i} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                        {item[0]}
                                        <FontAwesomeIcon icon={faGrip}></FontAwesomeIcon>
                                    </li>
                                )
                            } else {
                                return (<></>)
                            }
                        })}
                    </ul>           
                </div>
                ) : (
                    <></>
                )
            }
        </>
    );
}

export default SBOutline;