import React, { memo } from 'react';
import { useDrop } from 'react-dnd'

export const Droppable = memo(function Droppable({ onDrop, acceptableType, children }) {

    const [{ isOver, canDrop }, drop] = useDrop(
        () => ({
            accept: [`${acceptableType}`],
            drop: (monitor) => {
                onDrop(monitor.itemID)
                return undefined
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }),
        [onDrop],
    )

    return (
        <div
            ref={drop}
            style={{
                minHeight: '10em',
                backgroundColor: canDrop ? (isOver ? 'lightgreen' : 'rgba(0,0,0,.5)') : 'inherit',
                opacity: isOver ? 0.4 : 1,
                padding: '5px',
            }}
        >
            <div>{children}</div>
        </div>
    );
});