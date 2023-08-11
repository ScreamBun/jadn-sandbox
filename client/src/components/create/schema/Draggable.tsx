import { faGripLines } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { memo } from "react";
import { ListGroupItem } from "reactstrap";
import { useDrag } from 'react-dnd'

export const Draggable = memo(function SourceBox({ item, type, id }) {

    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: type,
            item: { itemID: id },
            canDrag: true,
            collect: (monitor) => ({
                item: monitor.getItem(),
                isDraggingInfo: monitor.isDragging()
            })
        }), [item, type]
    )

    return (
        <div ref={drag}>
            <ListGroupItem style={{ color: 'inherit', padding: '8px' }}>
                {item}
                <FontAwesomeIcon icon={faGripLines} className='float-right' />
            </ListGroupItem>
        </div>
    );

});
