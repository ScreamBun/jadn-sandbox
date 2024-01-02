
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Unsubscribe } from 'redux';
import update from 'immutability-helper'
import { useDragDropManager, useDrop } from 'react-dnd';
import { TypeArray } from '../../../interface';
import { ItemTypes, SBOutlineCard } from "./SBOutlineCard";
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export interface DragItem {
  id: any;
  index: number;
  text: string;
  value: TypeArray;
  isStarred: boolean;
  isFiltered: boolean;
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
  const [query, setQuery] = useState("")

  useEffect(() => {
    setItems(setIsVisibleInOutline(cards));
  }, [cards, visibleCard, query])

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
      id: number, index: number, text: string, value: TypeArray, isStarred: boolean, isFiltered: boolean
    }, index: number, isDraggable: boolean ) => {
      return (
        <SBOutlineCard
          key={card.id}
          index={index}
          id={card.id}
          text={card.text}
          value={card.value}
          isVisible={index == visibleCard}
          isStarred={card.isStarred}
          isDraggable={!isDraggable}
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

  const setIsVisibleInOutline = (itemsToFilter: any[]) => {
    const updatedItems = itemsToFilter.map(card =>
        card.text.toLowerCase().includes(query.toLowerCase()) ? {...card, isVisibleInOutline: true} : {...card, isVisibleInOutline: false}
    )
    return(updatedItems)
  }

  const isDraggable = () => {
    return query != "" ? true : false
  }

  return (
    <div id='outlineScrollContainer'>
      {items && items.length > 0 ? (
        <div id={id}>
          <ul className="nav nav-pills">
            <li className="nav-item pt-2"><a title="An outline view of all the schema types" className="bg-primary nav-link text-light">{title}</a></li>
          </ul>
          <div className="input-group search" style={{paddingTop: '5px'}}>
            <span className="input-group-text icon" id="basic-addon1"><FontAwesomeIcon icon={faMagnifyingGlass} /></span>
            <input type="search" id="typesSearchBar" className="form-control" placeholder="Search..." aria-label="Search" onChange={(e) => setQuery(e.target.value.trim())}/>
          </div>
          <div className="sb-outline"
            ref={drop}
            data-handler-id={handlerId}
            style={{
              minHeight: '10em',
              backgroundColor: canDrop ? (isOver ? 'lightgreen' : 'rgba(0,0,0,.5)') : 'inherit',
              paddingTop: '5px',
            }}>
              <div>{items.map((card, index) => card.isVisibleInOutline ? renderCard(card, index, isDraggable()) : null)}</div>
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