import React, { memo, useMemo } from "react";
import { useDrag } from 'react-dnd'
import { faGripLines } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface KeyItem {
    id: any;
    index: number;
    text: string;
}

interface DraggableKeyProps {
    item: any;
    acceptableType: string;
    id: any;
    index: number;
    text: string;
    isDraggable: boolean;
    onTypesDrop?: (arg: KeyItem) => void;
}

export const DraggableKey = memo(function DraggableKey(props: DraggableKeyProps) {
    const { item, acceptableType, id, index, text, isDraggable = true, onTypesDrop } = props;
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: acceptableType,
            item: { id, index, text },
            canDrag: isDraggable,
            end: (item, monitor) => {
                const dropResult = monitor.getDropResult();
                const didDrop = monitor.didDrop()
                if (didDrop && dropResult.location == 'outline' && acceptableType == 'TypesKeys' && onTypesDrop) {
                    onTypesDrop(item);
                }
            },
            collect: (monitor) => ({
                item: monitor.getItem(),
                isDragging: monitor.isDragging(),
            }),
        }), [item, acceptableType, isDraggable, onTypesDrop]
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
            <li className="list-group-item d-flex justify-content-between align-items-center p-2" title={'Drag and drop to add'}>
                {item}
                <FontAwesomeIcon icon={faGripLines} />
            </li>
        </div>
    );

});
