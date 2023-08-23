import React, { memo, useMemo, useRef } from "react";
import { ListGroupItem } from "reactstrap";
import { useDrag, useDrop } from 'react-dnd'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGrip } from "@fortawesome/free-solid-svg-icons";

interface DraggableTypeProps {
    item: any;
    acceptableType: string;
    id: string | number;
    dataIndex: number;
    isDraggable: boolean;
    changeIndex: (originalIndex: number, newIndex: number) => void;
}

export const DraggableType = memo(function DraggableType(props: DraggableTypeProps) {
    const { item, acceptableType, id, dataIndex, isDraggable = true, changeIndex } = props;

    const [{ isDragging }, dragRef, dragHandler] = useDrag(
        () => ({
            type: acceptableType,
            item: () => { return { itemID: id, originalIndex: dataIndex, newIndex: dataIndex, itemValue: item.props.value, changeIndexProp: item.props.changeIndex } },
            canDrag: isDraggable,
            end: (item) => {
                item.changeIndexProp(item.itemValue, item.originalIndex, item.newIndex);
            },
            collect: (monitor) => ({
                item: monitor.getItem(),
                isDragging: monitor.isDragging(),
            }),
        }), [item, acceptableType, isDraggable]
    )

    const [, dropRef] = useDrop(
        () => ({
            accept: acceptableType,
            //TODO: scroll page
            hover: (draggedItem, monitor) => {
                if (!ref.current) {
                    return
                }
                const dragIndex = draggedItem.newIndex
                const hoverIndex = dataIndex

                // Don't replace items with themselves
                if (dragIndex === hoverIndex) {
                    return
                }

                const hoverBoundingRect = ref.current?.getBoundingClientRect()
                const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
                const hoverActualY = monitor.getClientOffset().y - hoverBoundingRect.top

                // if dragging down, continue only when hover is smaller than middle Y
                if (dragIndex < hoverIndex && hoverActualY < hoverMiddleY) {
                    return
                }
                // if dragging up, continue only when hover is bigger than middle Y
                if (dragIndex > hoverIndex && hoverActualY > hoverMiddleY) {
                    return
                }

                changeIndex(dragIndex, hoverIndex)
                draggedItem.newIndex = hoverIndex
            },
        }),
        [],
    )

    const ref = useRef(null);
    const dragDropRef = dragRef(dropRef(ref))

    const containerStyle = useMemo(
        () => ({
            opacity: isDragging || !isDraggable ? 0.4 : 1,
        }),
        [isDragging, isDraggable],
    )

    const handleStyle = useMemo(
        () => ({
            cursor: isDraggable ? 'move' : 'default',
        }),
        [isDragging, isDraggable],
    )

    return (
        <div ref={dragHandler} style={containerStyle} >
            <ListGroupItem style={{ color: 'inherit', padding: '8px' }}>
                <div ref={dragDropRef} style={handleStyle}>
                    <FontAwesomeIcon icon={faGrip} />
                </div>
                {item}
            </ListGroupItem >
        </div >
    );

});
