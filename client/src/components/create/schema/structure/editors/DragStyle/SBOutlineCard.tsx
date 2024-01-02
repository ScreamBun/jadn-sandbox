import React, { useRef, useState } from 'react'
import type { FC } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import type { Identifier, XYCoord } from 'dnd-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGrip, faStar } from '@fortawesome/free-solid-svg-icons'
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons'
import { TypeArray } from '../../../interface'
import { DragItem } from './SBOutline'

const style = {
  cursor: 'move',
}

export const ItemTypes = {
  CARD: 'card',
}

export interface SBOutlineCardProps {
  id: any;
  text: string;
  index: number;
  value: TypeArray;
  isStarred: boolean;
  isVisible: boolean;
  isDraggable: boolean;
  scrollToCard: (idx: number) => void;
  moveCard: (item: DragItem, dragIndex: number, hoverIndex: number) => void;
  addCard: (item: DragItem, hoverIndex: number) => void;
  dropCard: (item: DragItem, index: number, originalIndex: number) => void;
  handleStarToggle: (idx: number) => void;
}

export const SBOutlineCard: FC<SBOutlineCardProps> = ({ id, text, index, value, isStarred, isVisible, isDraggable, scrollToCard, handleStarToggle, moveCard, addCard, dropCard }) => {

  const originalIndex = index;
  const [toggleStar, setToggleStar] = useState(isStarred);

  const ref = useRef<HTMLDivElement>(null)
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: [ItemTypes.CARD, 'TypesKeys'],
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
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
      if (item.index == -1) {
        addCard(item, hoverIndex)
      } else {
        moveCard(item, dragIndex, hoverIndex)
      }

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
      return { id, originalIndex, index, text, value, isStarred: toggleStar }
    },
    end: (item, monitor) => {
      const didDrop = monitor.didDrop()
      if (!didDrop) {
        moveCard(item, item.index, item.originalIndex)
      } else {
        dropCard(item, item.index, item.originalIndex);
        scrollToCard(item.index)
      }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1
  const backgroundColor_class = isVisible ? 'highlight-color' : ''
  drag(drop(ref))

  const onToggleStar = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setToggleStar(prev => !prev);
    handleStarToggle(index);
  };

  const onCardClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    scrollToCard(index);
  }
  
  if (isDraggable) {
    return (
      <div className='card'>
        <div className={`card-body list-group-item d-flex justify-content-between align-items-center ${backgroundColor_class}`} ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}>
          <div>
            <span onClick={onToggleStar}>
              <FontAwesomeIcon className='me-1' icon={toggleStar ? faStar : farStar} />
            </span>
            <a title={'Click to view'} href={`#${index}`} onClick={onCardClick}>{text}</a>
          </div>

          <div>
            <FontAwesomeIcon className='pt-1' title={'Drag and drop to reorder'} icon={faGrip}></FontAwesomeIcon>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='card'>
      <div className={`card-body list-group-item d-flex justify-content-between align-items-center ${backgroundColor_class}`} style={{ ...style, opacity }} data-handler-id={handlerId}>
        <div>
          <span onClick={onToggleStar}>
            <FontAwesomeIcon className='me-1' icon={toggleStar ? faStar : farStar} />
          </span>
          <a title={'Click to view'} href={`#${index}`} onClick={onCardClick}>{text}</a>
        </div>
      </div>
    </div>
  )

}