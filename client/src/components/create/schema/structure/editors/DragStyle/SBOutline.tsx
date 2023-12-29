
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Unsubscribe } from 'redux';
import update from 'immutability-helper'
import { useDragDropManager, useDrop } from 'react-dnd';
import { TypeArray } from '../../../interface';
import { ItemTypes, SBOutlineCard } from "./SBOutlineCard";

export interface DragItem {
  id: any;
  index: number;
  text: string;
  value: TypeArray;
  isStarred: boolean;
}

export interface OutlineContainerState {
  cards: DragItem[]
}

export interface SBOutlineProps {
  id: string;
  title: string;
  cards: any[];
  visibleCard: number | null;
  onScrollToCard: (idx: number) => void;
  onDrop: (arg: DragItem[], index: number, originalIndex: number) => void;
  onStarToggle: (updatedCards: DragItem[]) => void;
}

const SBOutline = (props: SBOutlineProps) => {
  const { id = 'sb-outline',
    title,
    visibleCard,
    onDrop,
    onStarToggle,
    onScrollToCard,
    cards = [] } = props;

  const [items, setItems] = useState(cards);
  const cardsStateRef = useRef(items);

  useEffect(() => {
    setItems(cards);
  }, [cards, visibleCard])

  useEffect(() => {
    cardsStateRef.current = items;
  }, [items])

  const [dragValue, setDragValue] = useState<boolean>(false);
  const dragDropManager = useDragDropManager();
  const monitor = dragDropManager.getMonitor();
  const timerRef = useRef<NodeJS.Timer>();
  const unsubscribeRef = useRef<Unsubscribe>();

  const [{ handlerId, isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ItemTypes.CARD, 'TypesKeys'],
    drop: (item: DragItem, _monitor) => {
      return { item, location: 'outline' };
    },
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  }),
    [],
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

  const onCardClick = (idx: number) => {
    onScrollToCard(idx);
  }

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

  const dropCard = (_item: DragItem, index: number, originalIndex: number) => {
    onDrop(cardsStateRef.current, index, originalIndex);
  };

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
      id: number, text: string, value: TypeArray, isStarred: boolean
    }, index: number) => {
      return (
        <SBOutlineCard
          key={card.id}
          index={index}
          id={card.id}
          text={card.text}
          value={card.value}
          isVisible={index == visibleCard}
          isStarred={card.isStarred}
          scrollToCard={onCardClick}
          addCard={addCard}
          moveCard={moveCard}
          dropCard={dropCard}
          handleStarToggle={onStarClick}
        />
      )
    },
    [visibleCard]
  );

  return (
    <div id='outlineScrollContainer'>
      {items && items.length > 0 ? (
        <div id={id}>
          <ul className="nav nav-pills">
            <li className="nav-item pt-2"><a title="An outline view of all the schema types" className="bg-primary nav-link text-light">{title}</a></li>
          </ul>
          <div className="sb-outline"
            ref={drop}
            data-handler-id={handlerId}
            style={{
              minHeight: '10em',
              backgroundColor: canDrop ? (isOver ? 'lightgreen' : 'rgba(0,0,0,.5)') : 'inherit',
              paddingTop: '5px',
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