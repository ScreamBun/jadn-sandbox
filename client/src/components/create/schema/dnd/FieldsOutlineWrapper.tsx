
import update from 'immutability-helper'
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useDragDropManager } from 'react-dnd';
import { Unsubscribe } from 'redux';
import { FieldOutlineItem } from './FieldsOutlineItem';
import { EnumeratedFieldObject, FieldObject, StandardFieldObject } from '../structure/editors/consts';

// export interface Item {
//   id: number,
//   text: string
// }

export interface OutlineContainerState {
  cards: FieldObject[]
}

export interface FieldOutlineWrapperProps {
  id: string;
  // items: any[];
  fields: any[];
  onDrop: (arg: FieldObject[]) => void;
  onRemove: (id: number) => void;
}

const FieldsOutlineWrapper = (props: FieldOutlineWrapperProps) => {
  const { id, fields = [], onRemove } = props;
  const initalState: FieldObject[] = [];
  const [fieldsState, setFieldsState] = useState<FieldObject[]>(initalState);
  const cardsStateRef = React.useRef(fieldsState);

  const [dragValue, setDragValue] = useState<boolean>(false);
  const dragDropManager = useDragDropManager();
  const monitor = dragDropManager.getMonitor();
  const timerRef = useRef<NodeJS.Timer>();
  const unsubscribeRef = useRef<Unsubscribe>();

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
        const container = document.getElementById("scrollContainer");

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

  useEffect(() => {
    cardsStateRef.current = fieldsState;
  }, [fieldsState]);

  useEffect(() => {
    setFieldsState(initalState);
    {
      fields.map((field, i) => {

        // let item_text = ""
        // if(item.text){
        //   item_text = item.text
        // } else if(item[0] && typeof item[0] === "string") {
        //   item_text = item[0]
        // }

        // TODO: Add field component?
        // const new_card_old = {
        //   id: i,
        //   text: item_text
        // }

        const new_card: StandardFieldObject = {
          id: field[0],
          name: field[1],
          type: "",
          // value: number | string; // Enumeration type only
          options: [],
          comment: ""
        }

        setFieldsState(prev => [...prev, new_card]);
      })
    };

    console.log("FieldDnDWrapper useEffect cards state: " + JSON.stringify(fieldsState));

  }, [fields]);

  // const onRemove = useCallback((e: React.MouseEvent<HTMLElement>, text: string) => {
  const onRemoveCallback = useCallback((id: number) => {
    console.log("FieldsOutlineWrapper onRemove useCallback id: " + id);
    onRemove(id);
  }, []);

  const dropCard = useCallback((item: {}) => {
    console.log("FieldDnDWrapper dropCard useCallback cards state: " + JSON.stringify(cardsStateRef.current));
    props.onDrop(cardsStateRef.current);
  }, []);

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setFieldsState((prevCards: FieldObject[]) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex] as FieldObject],
        ],
      }),
    )
  }, []);

  const renderField = useCallback(
    (field: StandardFieldObject | EnumeratedFieldObject, index: number) => {
      return (
        <FieldOutlineItem
          field={field}
          key={field.id}
          index={index}
          id={field.id}
          moveCard={moveCard}
          dropCard={dropCard}
          onRemove={onRemoveCallback}
        />
      )
    },
    []
  );

  return (
    <div id='scrollContainer'>
      <div id={id}>
        <div className="sb-outline mt-2">
          <div>{fieldsState.map((field, i) => renderField(field, i))}</div>
        </div>
      </div>
    </div>
  );
}
export default FieldsOutlineWrapper;