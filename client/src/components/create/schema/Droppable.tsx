import React, { memo } from 'react';
import { useDrop } from 'react-dnd'

export const Droppable = memo(function Droppable({ onDrop, acceptableType, editor, children }) {

    const [{ isOver, dragging, canDrop }, drop] = useDrop(
        () => ({
            accept: [`${acceptableType}`],
            drop(monitor) {
                if (typeof monitor.itemID == "string") {
                    console.log("dropping")
                    onDrop(monitor.itemID)
                    return undefined
                }
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
            style={{
                minHeight: '10em',
                backgroundColor: canDrop ? 'rgba(0,0,0,.5)' : 'inherit',
            }}
        >
            {editor}
            <div>{children}</div>
        </div>

    );
});