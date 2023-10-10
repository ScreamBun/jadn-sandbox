
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Unsubscribe } from 'redux';
import update from 'immutability-helper'
import { useDragDropManager, useDrop } from 'react-dnd';
import { StandardFieldArray } from '../../../interface';
import { SBOutlineCard } from "./SBOutlineCard";

export interface DragItem {
  id: any;
  index: number;
  text: string;
  value: StandardFieldArray;
  isStarred: boolean;
}

export interface OutlineContainerState {
  cards: DragItem[]
}

export interface SBOutlineProps {
  id: string;
  title: string;
  cards: any[];
  onDrop: (arg: StandardFieldArray[]) => void;
  onTypesDrop: (arg: DragItem) => void;
  onClick: (e: React.MouseEvent<HTMLElement>, text: string) => void;
  onStarToggle: (updatedCards: DragItem[]) => void;
}

const SBOutline = (props: SBOutlineProps) => {
  const { id = 'sb-outline',
    title,
    onDrop,
    onTypesDrop,
    onClick,
    onStarToggle,
    cards = [] } = props;

  const [items, setItems] = useState(cards);
  const cardsStateRef = useRef(items);

  const [dragValue, setDragValue] = useState<boolean>(false);
  const dragDropManager = useDragDropManager();
  const monitor = dragDropManager.getMonitor();
  const timerRef = useRef<NodeJS.Timer>();
  const unsubscribeRef = useRef<Unsubscribe>();

  useEffect(() => {
    setItems(cards);
  }, [cards])

  useEffect(() => {
    cardsStateRef.current = items;
  }, [items])

  const [{ handlerId, isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['TypesKeys'],
    drop: (item: DragItem, _monitor) => {
      onTypesDrop(item);
      return item;
    },
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  }),
    [onTypesDrop],
  )

  const setScrollIntervall = (speed: number, container: HTMLElement) => {
    timerRef.current = setInterval(() => {
      container.scrollBy(0, speed);
    }, 1);
  };

  useEffect(() => {
    if (dragValue) {
      unsubscribeRef.current = monitor.subscribeToOffsetChange(() => {
        const offset = monitor.getClientOffset();
        // it can be html, body, div, any container that have scroll
        const container = document.getElementById("outlineScrollContainer");

        if (!offset || !container) return;

        if (offset.y < container.clientHeight / 2 - 200) {
          if (timerRef.current) clearInterval(timerRef.current);
          setScrollIntervall(-5, container);
        } else if (offset.y > container.clientHeight / 2 + 200) {
          if (timerRef.current) clearInterval(timerRef.current);
          setScrollIntervall(5, container);
        } else if (
          offset.y > container.clientHeight / 2 - 200 &&
          offset.y < container.clientHeight / 2 + 200
        ) {
          if (timerRef.current) clearInterval(timerRef.current);
        }
      });
    } else if (unsubscribeRef.current) {
      if (timerRef.current) clearInterval(timerRef.current);
      unsubscribeRef.current();
    }
  }, [dragValue, monitor]);

  useEffect(() => {
    const unsubscribe = monitor.subscribeToStateChange(() => {
      if (monitor.isDragging()) setDragValue(() => true);
      else if (!monitor.isDragging()) setDragValue(() => false);
    });

    return () => {
      unsubscribe();
    };
  }, [monitor]);

  const onCardClick = useCallback((e: React.MouseEvent<HTMLElement>, text: string) => {
    onClick(e, text)
  }, []);

  const onStarClick = useCallback((idx: number) => {
    const updatedItems = cardsStateRef.current.map((item, i) => {
      if (i === idx) {
        return ({ ...item, isStarred: !item.isStarred });
      } else {
        return item;
      }
    });

    setItems(updatedItems);
    onStarToggle(updatedItems);
  }, []);

  const dropCard = useCallback(() => {
    const fieldArray: StandardFieldArray[] = cardsStateRef.current.map(item => item.value);
    onDrop(fieldArray);
  }, []);

  const moveCard = useCallback((_newItem: DragItem, dragIndex: number, hoverIndex: number) => {
    setItems((prevCards: DragItem[]) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex] as DragItem],
        ],
      }),
    )
  }, []);

  const addCard = useCallback((newItem: DragItem, hoverIndex: number) => {
    setItems((prevCards: DragItem[]) =>
      update(prevCards, {
        $splice: [
          [hoverIndex, 0, newItem as DragItem],
        ],
      })
    )
  }, []);

  const renderCard = useCallback(
    (card: {
      id: number, text: string, value: StandardFieldArray, isStarred: boolean
    }, index: number) => {
      return (
        <SBOutlineCard
          key={card.id}
          index={index}
          id={card.id}
          text={card.text}
          value={card.value}
          isStarred={card.isStarred}
          addCard={addCard}
          moveCard={moveCard}
          dropCard={dropCard}
          onClick={onCardClick}
          handleStarToggle={onStarClick}
        />
      )
    },
    []
  );

  return (
    <div id='outlineScrollContainer'>
      {items && items.length > 0 ? (
        <div id={id}>
          <ul className="nav nav-pills">
            <li className="nav-item pb-0"><a title="An outline view of all the schema types" className="active nav-link">{title}</a></li>
          </ul>
          <div className="sb-outline mt-2"
            ref={drop}
            data-handler-id={handlerId}
            style={{
              minHeight: '10em',
              backgroundColor: canDrop ? (isOver ? 'lightgreen' : 'rgba(0,0,0,.5)') : 'inherit',
              padding: '5px',
            }}>
            <div>{items.map((card, i) => renderCard(card, i))}</div>
          </div>
        </div>
      ) : (
        <></>
      )
      }
    </div>
  );
}
export default SBOutline;