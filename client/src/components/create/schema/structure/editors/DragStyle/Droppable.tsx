import React, { ReactNode, memo, useEffect, useRef, useState } from 'react';
import { useDragDropManager, useDrop } from 'react-dnd'
import { Unsubscribe } from 'redux';

interface DroppableProps {
    onDrop?: (key: string) => void;
    acceptableType?: string;
    children: ReactNode;
}

export const Droppable = memo(function Droppable(props: DroppableProps) {
    const { onDrop, acceptableType, children } = props;
    const scrollToRef = useRef<HTMLInputElement | null>(null);

    const [{ isOver, canDrop }, drop] = useDrop(
        () => ({
            accept: [`${acceptableType}`],
            drop: (item: any) => {
                if (onDrop) {
                    onDrop(item.itemID)
                    // scrollToRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: "center" });
                    return item;
                }
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }),
        [onDrop],
    )

    const [dragValue, setDragValue] = useState<boolean>(false);
    const dragDropManager = useDragDropManager();
    const monitor = dragDropManager.getMonitor();
    const timerRef = useRef<NodeJS.Timer>();
    const unsubscribeRef = useRef<Unsubscribe>();

    const setScrollIntervall = (speed: number, container: HTMLElement) => {
        timerRef.current = setInterval(() => {
            container.scrollBy(0, speed);
        }, 1);
    };

    // useEffect(() => {
    //     if (dragValue) {
    //         unsubscribeRef.current = monitor.subscribeToOffsetChange(() => {
    //             const offset = monitor.getClientOffset();
    //             // it can be html, body, div, any container that have scroll
    //             const container = document.getElementById("scrollContainerDroppable");

    //             if (!offset || !container) return;

    //             if (offset.y < container.clientHeight / 2 - 200) {
    //                 if (timerRef.current) clearInterval(timerRef.current);
    //                 setScrollIntervall(-5, container);
    //             } else if (offset.y > container.clientHeight / 2 + 200) {
    //                 if (timerRef.current) clearInterval(timerRef.current);
    //                 setScrollIntervall(5, container);
    //             } else if (
    //                 offset.y > container.clientHeight / 2 - 200 &&
    //                 offset.y < container.clientHeight / 2 + 200
    //             ) {
    //                 if (timerRef.current) clearInterval(timerRef.current);
    //             }
    //         });
    //     } else if (unsubscribeRef.current) {
    //         if (timerRef.current) clearInterval(timerRef.current);
    //         unsubscribeRef.current();
    //     }
    // }, [dragValue, monitor]);

    useEffect(() => {
        const unsubscribe = monitor.subscribeToStateChange(() => {
            if (monitor.isDragging()) setDragValue(() => true);
            else if (!monitor.isDragging()) setDragValue(() => false);
        });

        return () => {
            unsubscribe();
        };
    }, [monitor]);

    return (
        <div
            ref={drop}
            style={{
                minHeight: '10em',
                backgroundColor: canDrop ? (isOver ? 'lightgreen' : 'rgba(0,0,0,.5)') : 'inherit',
                opacity: isOver ? 0.4 : 1,
                padding: '5px',
            }}
            name="scrollContainerDroppable"
        >
            <div ref={scrollToRef}>
                {children}
            </div>
        </div>
    );
});