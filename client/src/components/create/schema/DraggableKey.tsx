import { faGripLines } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { memo, useMemo } from "react";
import { ListGroupItem } from "reactstrap";
import { useDrag } from 'react-dnd'

export const DraggableKey = memo(function DraggableKey({ item, acceptableType, id, isDraggable = true }) {
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: acceptableType,
            item: { itemID: id },
            canDrag: isDraggable,
            collect: (monitor) => ({
                item: monitor.getItem(),
                isDragging: monitor.isDragging()
            }),
        }), [item, acceptableType, isDraggable]
    )

    const containerStyle = useMemo(
        () => ({
            opacity: isDragging || !isDraggable ? 0.4 : 1,
            cursor: isDraggable ? 'move' : 'default',
        }),
        [isDragging, isDraggable],
    )

    return (
        <div ref={drag} style={containerStyle}>
            <ListGroupItem style={{ color: 'inherit', padding: '8px' }}>
                {item}
                <FontAwesomeIcon icon={faGripLines} className='float-right' />
            </ListGroupItem>
        </div>
    );

});
