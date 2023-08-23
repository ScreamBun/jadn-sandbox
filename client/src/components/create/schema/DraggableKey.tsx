import { faGripLines } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { memo, useMemo } from "react";
import { ListGroupItem } from "reactstrap";
import { useDrag } from 'react-dnd'

interface DraggableKeyProps {
    item: any;
    acceptableType: string;
    id: string | number;
    isDraggable: boolean;
}

export const DraggableKey = memo(function DraggableKey(props: DraggableKeyProps) {
    const { item, acceptableType, id, isDraggable = true } = props;
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
            <ListGroupItem title={'Drag and drop to add'} style={{ color: 'inherit', padding: '8px' }}>
                {item}
                <FontAwesomeIcon icon={faGripLines} className='float-right' />
            </ListGroupItem>
        </div>
    );

});
