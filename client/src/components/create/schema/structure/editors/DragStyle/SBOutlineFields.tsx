import React, { useCallback, useEffect, useRef, useState } from "react";
import { Unsubscribe } from 'redux';
import { useDragDropManager, useDrop } from 'react-dnd';
import update from 'immutability-helper'
import { FieldArray, InfoConfig } from 'components/create/schema/interface';
import FieldEditor from './FieldEditor';

export interface DragItem {
    id: any;
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
    const { id, items = [], isEnumerated, fieldChange, fieldRemove, config, onDrop, editableID, acceptableType, parentIndex } = props;
    const [cardsState, setCardsState] = useState<DragItem[]>(items);

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

    const [{ canDrop, isOver }, drop] = useDrop(
        () => ({
            accept: acceptableType,
            drop: (item: DragItem, _monitor) => {
                return { item };
            },
            collect: (monitor) => ({
                canDrop: monitor.canDrop(),
                isOver: monitor.isOver()
            }),
        }),
        [],
    )

    const dropCard = useCallback((item: DragItem) => {
        onDrop(item)
    }, [cardsState]);

    const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
        setCardsState((prevCards: DragItem[]) =>
            update(prevCards, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, [prevCards[dragIndex]] as DragItem],
                ],
            }),
        )

    }, []);

    const renderCard = useCallback(
        (card: any, index: number) => {
            return (
                <FieldEditor
                    key={card[0]}
                    id={card[0]}
                    dataIndex={index}
                    parentIndex={parentIndex}
                    enumerated={isEnumerated}
                    value={card}
                    change={fieldChange}
                    remove={fieldRemove}
                    config={config}
                    editableID={editableID}

                    moveCard={moveCard}
                    dropCard={dropCard}
                    acceptableType={acceptableType}
                />
            )
        },
        []
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