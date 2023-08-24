
import update from 'immutability-helper'
import React, { useCallback, useEffect, useState } from "react";

import { SBOutlineCard } from "./SBOutlineCard";

export interface Item {
    id: number
    text: string
}  

export interface OutlineContainerState {
    cards: Item[]
}  

export interface SBOutlineProps {
    id: string;
    title: string;
    items: any[]; 
    onDrop: (arg: Item[]) => void;
    onClick: (e: React.MouseEvent<HTMLElement>, text: string) => void;
}

const SBOutline  = (props: SBOutlineProps) => {
    const initalState: Item[] = [];
    const { id='sb-outline', title, items=[]} = props; 
    const [cardsState, setCardsState] = useState<Item[]>(initalState);
    const cardsStateRef = React.useRef(cardsState);

    useEffect(() => {
        cardsStateRef.current = cardsState;
      }, [cardsState]);    

    useEffect(() => {
        setCardsState(initalState);
        {items.map((item, i) => {
            const new_card = {
                id : i,
                text : item[0]
            }
            setCardsState(prev => [...prev, new_card]);
        })};

        console.log("SBOutline useEffect cards state: " + JSON.stringify(cardsState));

    },[props]);

    const onClick = useCallback((e: React.MouseEvent<HTMLElement>, text: string) => {
      console.log("SBOutline onClick useCallback text: " + text);       
      props.onClick(e, text)
    }, []);     

    const dropCard = useCallback((item: {}) => {
        console.log("SBOutline dropCard useCallback cards state: " + JSON.stringify(cardsStateRef.current));       
        props.onDrop(cardsStateRef.current)
    }, []);     
  
    const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
        setCardsState((prevCards: Item[]) =>
          update(prevCards, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, prevCards[dragIndex] as Item],
            ],
          }),
        )
      }, []);    

    const renderCard = useCallback(
        (card: { id: number; text: string }, index: number) => {
          return (
            <SBOutlineCard
              key={card.id}
              index={index}
              id={card.id}
              text={card.text}
              moveCard={moveCard}
              dropCard={dropCard}
              onClick={onClick}
            />
          )
        }, 
        []
    );    

    return (
        <>
            {items && items.length > 0 ? (
                <div id={id}>
                    <ul className="nav nav-pills">
                      <li className="nav-item pb-0"><a title="An outline view of all the schema types" className="active nav-link">{title}</a></li>
                    </ul>                    
                    <div className="sb-outline mt-2">
                        <div>{cardsState.map((card, i) => renderCard(card, i))}</div>
                    </div>
                </div>
                ) : (
                    <></>
                )
            }
        </>
    );
}
export default SBOutline;