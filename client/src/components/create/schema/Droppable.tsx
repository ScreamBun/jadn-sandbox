import React, { memo, useRef } from 'react';
import { useDrop } from 'react-dnd'

export const Droppable = memo(function Droppable({ onDrop, acceptableType, children }) {

    const scrollToRef = useRef<HTMLInputElement | null>(null);
    const [{ isOver, canDrop }, drop] = useDrop(
        () => ({
            accept: [`${acceptableType}`],
            drop: (item) => {
                onDrop(item.itemID)

                //TODO: fix scroll to dropped item
                //scrollToRef.current.lastElementChild != the actual last Element
                //console.log(scrollToRef.current?.lastElementChild)
                scrollToRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: "center" });

                return item
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
            <div ref={scrollToRef}>
                {children}
            </div>
        </div>
    );
});