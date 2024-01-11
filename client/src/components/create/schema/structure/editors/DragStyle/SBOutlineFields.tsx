import React, { useCallback, useEffect, useRef, useState } from "react";
import { Unsubscribe } from 'redux';
import { useDragDropManager, useDragLayer, useDrop } from 'react-dnd';
import update from 'immutability-helper'
import { EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray } from 'components/create/schema/interface';
import { FieldEditorDndStyle } from "./FieldEditorDnd";

export interface CardStateItem {
    id: any;
    value: EnumeratedFieldArray | StandardFieldArray;
}
export interface DragItem {
    id: any;
    originalIndex: number;
    dataIndex: number;
    value: FieldArray;
}
export interface OutlineContainerState {
    cards: DragItem[]
}

export interface SBOutlineProps {
    id: string;
    items: any[];
    onDrop: (arg: DragItem) => void;
    onClick?: (e: React.MouseEvent<HTMLElement>, text: string) => void;
    isEnumerated: boolean;
    fieldChange: any;
    fieldRemove: any;
    config: InfoConfig;
    editableID: boolean;
    acceptableType: string;
    parentIndex: number;
}

const SBOutlineFields = (props: SBOutlineProps) => {
    const { id, items = [], fieldChange, fieldRemove, onDrop, acceptableType, isEnumerated } = props;
    const [cardsState, setCardsState] = useState<CardStateItem[]>(items.map((item) => ({ id: self.crypto.randomUUID(), value: item })));

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
                const container = document.getElementById(id);

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

    const dropCard = useCallback((item: DragItem) => {
        onDrop(item)
    }, [cardsState]);

    const moveCard = useCallback((card: EnumeratedFieldArray | StandardFieldArray, hoverIndex: number,) => {
        const drag = cardsState.findIndex((item) => item.value == card)
        setCardsState((prevCards: CardStateItem[]) =>
            update(prevCards, {
                $splice: [
                    [drag, 1],
                    [hoverIndex, 0, prevCards[drag] as DragItem],
                ],
            }),
        )

    }, [cardsState, setCardsState]);

    const { isDragging, item } = useDragLayer((monitor) => ({
        isDragging: monitor.isDragging(),
        item: monitor.getItem()
    }));

    const [{ canDrop, isOver }, drop] = useDrop(
        () => ({
            accept: acceptableType,
            collect: (monitor) => ({
                canDrop: monitor.canDrop(),
                isOver: monitor.isOver()
            }),
        }), [])

    const renderCard = useCallback(
        (card: any, index: number) => {
            return (
                <FieldEditorDndStyle
                    key={card.id}
                    dataIndex={index}
                    value={card.value}
                    change={fieldChange}
                    remove={fieldRemove}
                    isDragging={item && item.dataIndex == index}
                    moveCard={moveCard}
                    dropCard={dropCard}
                    enumerated={isEnumerated}
                    {...props}
                />
            )
        },
        [isDragging, item, cardsState]
    );

    return (
        <div id={id} className="sb-outline mt-2" ref={drop}
            style={{
                backgroundColor: canDrop ? (isOver ? 'lightgreen' : 'rgba(0,0,0,.5)') : 'inherit',
                padding: '5px',
            }}>
            {cardsState.map((card, i) => renderCard(card, i))}
        </div>
    );
}
export default SBOutlineFields;