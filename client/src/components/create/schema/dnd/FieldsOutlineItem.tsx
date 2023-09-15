import type { Identifier, XYCoord } from 'dnd-core'
import type { FC } from 'react'
import { useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGrip, faMinusCircle } from '@fortawesome/free-solid-svg-icons'
import { SBConfirmModal } from 'components/common/SBConfirmModal'
import { EnumeratedFieldObject, StandardFieldObject } from '../structure/editors/consts'


const style = {
  padding: '0.5rem 1rem',
}

const ItemTypes = {
  CARD: 'card',
}

export interface FieldOutlineItemProps {
  field: StandardFieldObject | EnumeratedFieldObject;
  id: any;
  // text: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  dropCard: (item: {}) => void;
  onRemove?: (id: number) => void;
}

interface DragItem {
  index: number
  id: number
  type: string
}

export const FieldOutlineItem: FC<FieldOutlineItemProps> = ({ field, id, index, moveCard, dropCard, onRemove: onRemove }) => {
  const [isConformModalOpen, setIsConformModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null)
  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    drop(item: DragItem, _monitor) {
      console.log("FieldOutlineItem dropped: " + JSON.stringify(item));
      dropCard(item);
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))

  const onRemoveItemClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setIsConformModalOpen(true);
  };  

  const onRemoveCallback = (response: boolean, confirm_value: number) => {
    console.log('FieldOutlineItem onRemoveCallback response: ' + response);
    console.log('FieldOutlineItem onRemoveCallback confirm_value: ' + confirm_value);

    if(field.id){
      console.log('FieldOutlineItem onRemoveCallback field.id: ' + field.id);
    }
    
    setIsConformModalOpen(false);
    if(response == true){
      if(onRemove){
        onRemove(confirm_value)      
      }      
    }
  }  

  const text = "Text";

  return (
    <>
      <div className='border-secondary list-group-item list-group-item-action flex-column align-items-start' ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}> 
        <div className="d-flex w-100 justify-content-between">
          <span className='card-title'>{id} {text}</span>
          <div>
            <FontAwesomeIcon className='float-right pt-1 pl-2' title={'Drag and drop to reorder'} icon={faGrip}></FontAwesomeIcon>
            <a href="#" onClick={onRemoveItemClick}><FontAwesomeIcon className='float-right pt-1' color='red' title={`Confirm Removal`} icon={faMinusCircle}></FontAwesomeIcon></a>
          </div>   
        </div>        
        <p className='mb-0'>
          Card Body Goes Here.....
        </p>
      </div>
      <SBConfirmModal 
        isOpen={isConformModalOpen} 
        title={`Remove ${text}`}
        message={`Are you sure you want to remove ${text}?`}
        confirm_value={id}
        onResponse={onRemoveCallback}></SBConfirmModal>
    </>
  )
}