import React, { memo } from 'react';
import { useDrop } from 'react-dnd'

export const Droppable = memo(function Droppable({ onDrop, type, editor }) {

    const [{ isOver, dragging, canDrop }, drop] = useDrop(
        () => ({
            accept: [`${type}`],
            drop(monitor) {
                onDrop(monitor.itemID)
                return undefined
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
                dragging: monitor.getItem(),
            }),
        }),
        [onDrop],
    )

    return (
        <div
            ref={drop}
            style={{ minHeight: '10em' }}
        >
            {editor}
        </div>

    );
});