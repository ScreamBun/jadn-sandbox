import React, { memo, useMemo, useRef } from "react";
import { ListGroupItem } from "reactstrap";
import { useDrag, useDrop } from 'react-dnd'

export const DraggableType = memo(function DraggableType({ item, acceptableType, id, dataIndex, isDraggable = true, changeIndex }) {

    const [{ isDragging }, dragRef] = useDrag(
        () => ({
            type: acceptableType,
            item: () => { return { itemID: id, originalIndex: dataIndex, itemValue: item.props.value } },
            canDrag: isDraggable,
            collect: (monitor) => ({
                item: monitor.getItem(),
                isDragging: monitor.isDragging(),
            }),
        }), [item, acceptableType, isDraggable]
    )

    const [, dropRef] = useDrop(
        () => ({
            accept: acceptableType,
            //  drop: (draggedItem, _monitor) => {
            //     if (!ref.current) {
            //         return
            //     }
            //     const dragIndex = draggedItem.originalIndex
            //     const hoverIndex = dataIndex
            //     if (dragIndex && dragIndex !== hoverIndex) {
            //         console.log("on drop index of " + JSON.stringify(draggedItem) + " from " + dragIndex + " to " + hoverIndex)
            //         changeIndex(dragIndex, hoverIndex)
            //         draggedItem.originalIndex = hoverIndex
            //     } 
            // },
            //TODO: scroll page
            hover: (draggedItem, monitor) => {
                if (!ref.current) {
                    return
                }
                const dragIndex = draggedItem.originalIndex
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
                draggedItem.originalIndex = hoverIndex
            },
        }),
        [],
    )

    const ref = useRef(null);
    const dragDropRef = dragRef(dropRef(ref))

    const containerStyle = useMemo(
        () => ({
            opacity: isDragging || !isDraggable ? 0.4 : 1,
            cursor: isDraggable ? 'move' : 'default',
        }),
        [isDragging, isDraggable],
    )


    return (
        <div ref={dragDropRef} style={containerStyle} >
            <ListGroupItem style={{ color: 'inherit', padding: '8px' }}>
                {item}
            </ListGroupItem>
        </div>
    );

});
