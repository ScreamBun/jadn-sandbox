
import update from 'immutability-helper'
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDragDropManager } from 'react-dnd';
import { Unsubscribe } from 'redux';
import FieldEditor from './FieldEditor';
import { EnumeratedFieldArray, FieldArray, InfoConfig, StandardFieldArray } from 'components/create/schema/interface';

interface DragItem {
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
    onDrop: (arg: DragItem[]) => void;
    onClick?: (e: React.MouseEvent<HTMLElement>, text: string) => void;
    isEnumerated: boolean;
    fieldChange: any;
    fieldRemove: any;
    config: InfoConfig;
}

const SBOutlineFields = (props: SBOutlineProps) => {
    const initalState: DragItem[] = [];
    const { id, items = [], isEnumerated, fieldChange, fieldRemove, config, onDrop } = props;
    const [cardsState, setCardsState] = useState<DragItem[]>(initalState);
    const cardsStateRef = React.useRef(cardsState);

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
        cardsStateRef.current = cardsState;
    }, [cardsState]);

    useEffect(() => {
        //console.log("SBOutline useEffect cards state: " + JSON.stringify(cardsState));

        setCardsState(initalState);
        {
            items.map((item, i) => {
                const new_card = {
                    id: self.crypto.randomUUID(),
                    dataIndex: i,
                    value: item
                }
                setCardsState(prev => [...prev, new_card]);
            })
        };

    }, [props]);

    const dropCard = useCallback(() => {
        console.log("SBOutline dropCard useCallback cards state: " + JSON.stringify(cardsStateRef.current));
        onDrop(cardsStateRef.current)
    }, []);

    const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
        setCardsState((prevCards: DragItem[]) =>
            update(prevCards, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, prevCards[dragIndex] as DragItem],
                ],
            }),
        )
    }, []);

    const renderCard = useCallback(
        (card: { id: number; value: EnumeratedFieldArray | StandardFieldArray; dataIndex: number }, index: number) => {
            return (
                <FieldEditor
                    key={card.id}
                    dataIndex={index}
                    enumerated={isEnumerated}
                    value={card.value}
                    change={fieldChange}
                    remove={fieldRemove}
                    config={config}

                    isDraggable={true}
                    moveCard={moveCard}
                    dropCard={dropCard}
                    acceptableType={`Field`}
                />
            )
        },
        []
    );

    return (
        <div id='scrollContainer'>
            {items && items.length > 0 ? (
                <div id={id}>
                    <div className="sb-outline mt-2">
                        <div>{cardsState.map((card, i) => renderCard(card, i))}</div>
                    </div>
                </div>
            ) : (
                <></>
            )
            }
        </div>
    );
}
export default SBOutlineFields;