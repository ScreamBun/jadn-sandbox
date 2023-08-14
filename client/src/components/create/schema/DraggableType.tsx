import React, { memo, useMemo, useRef } from "react";
import { ListGroupItem } from "reactstrap";
import { useDrag, useDrop } from 'react-dnd'
import { TypeKeys, TypeObject } from "./structure/editors/consts";
import { zip } from "components/utils";

export const DraggableType = memo(function SourceBox({ item, acceptableType, id, isDraggable = true }) {
    const changeIndex = item.props.changeIndex;
    const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: acceptableType,
            item: { itemID: id, originalIndex: item.props.dataIndex, itemValue: item.props.value },
            canDrag: isDraggable,
            collect: (monitor) => ({
                item: monitor.getItem(),
                isDragging: monitor.isDragging(),
            }),
        }), [item, acceptableType, isDraggable]
    )

    const [, dropType] = useDrop(
        () => ({
            accept: acceptableType,
            drop: (draggingItem, _monitor) => {
                if (!ref.current) {
                    return
                }
                const dragIndex = draggingItem.originalIndex
                const hoverIndex = id
                if (dragIndex && dragIndex !== hoverIndex) {
                    console.log("changing")
                    changeIndex(zip(TypeKeys, draggingItem.itemValue) as TypeObject, dragIndex, hoverIndex)
                }
            },
            // hover: (draggingItem, _monitor) => {
            //     if (!ref.current) {
            //         return
            //     }
            //     const dragIndex = draggingItem.originalIndex
            //     const hoverIndex = id
            //     console.log(dragIndex, hoverIndex)
            //     if (dragIndex && dragIndex !== hoverIndex) {
            //         console.log("changing")
            //         changeIndex(draggingItem.itemValue, dragIndex, hoverIndex)
            //     }
            // },
        }),
        [],
    )

    const containerStyle = useMemo(
        () => ({
            opacity: isDragging || !isDraggable ? 0.4 : 1,
            cursor: isDraggable ? 'move' : 'default',
        }),
        [isDragging, isDraggable],
    )

    drag(dropType(ref))

    return (
        <div ref={ref} style={containerStyle} >
            <ListGroupItem style={{ color: 'inherit', padding: '8px' }}>
                {item}
            </ListGroupItem>
        </div>
    );

});
