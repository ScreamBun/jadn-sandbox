import type { Identifier, XYCoord } from 'dnd-core'
import type { FC } from 'react'
import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGrip, faMinusCircle } from '@fortawesome/free-solid-svg-icons'
import { Button } from 'reactstrap'

const fullCardStyle = {
  padding: '0.5rem 1rem',
}

const smStyle = {
  padding: '0.5rem 1rem',
  cursor: 'move',
}

const ItemTypes = {
  CARD: 'card',
}

export interface SBOutlineCardProps {
  id: any;
  text: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  dropCard: (item: {}) => void;
  onClick?: (e: React.MouseEvent<HTMLElement>, text: string) => void;
  isFullCard: boolean
}

interface DragItem {
  index: number
  id: string
  type: string
}

export const SBOutlineCard: FC<SBOutlineCardProps> = ({ id, text, index, moveCard, dropCard, onClick, isFullCard }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    drop(item: DragItem, _monitor) {
      console.log("SBOutlineCard item dropped: " + JSON.stringify(item));
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

  const handleOnClick = (e: React.MouseEvent<HTMLElement>) => {
    onClick(e, text)
  };

  const onRemoveItem = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    // onClick(e, text)
    // TODO Confirm Model
  };  

  return (
    <>    
      { isFullCard ? 
        <div className='border-secondary list-group-item list-group-item-action flex-column align-items-start' ref={ref} style={{ ...fullCardStyle, opacity }} data-handler-id={handlerId}> 
          <div className="d-flex w-100 justify-content-between">
            <span className='card-title'>{text}</span>
            <div>
              <FontAwesomeIcon className='float-right pt-1 pl-2' title={'Drag and drop to reorder'} icon={faGrip}></FontAwesomeIcon>
              <a href="#" onClick={onRemoveItem} ><FontAwesomeIcon className='float-right pt-1' color='red' title={'Remove'} icon={faMinusCircle}></FontAwesomeIcon></a>
            </div>   
          </div>        
          <p className='mb-0'>
            Card Body Goes Here.....
          </p>
        </div>                
        : 
        <div className='list-group-item' ref={ref} style={{ ...smStyle, opacity }} data-handler-id={handlerId}> 
            <div className='row'>
                <div className='col-10'>
                  {onClick ? 
                    <a title={'Click to view'} href="#" onClick={handleOnClick}>{text}</a> 
                    : 
                    <span title={'Click to view'}>{text}</span> 
                  }  
                </div>
                <div className='col-2'>
                    <FontAwesomeIcon className='float-right pt-1' title={'Drag and drop to reorder'} icon={faGrip}></FontAwesomeIcon>
                </div>                
            </div>
        </div>
      }

    </>
  )
}