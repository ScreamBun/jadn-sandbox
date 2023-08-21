
import update from 'immutability-helper'
import React, { useCallback, useEffect, useState } from "react";
import _ from "lodash";

import { OutlineCard } from "./OutlineCard";


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
}

const SBOutline  = (props: SBOutlineProps) => {
    const { id='sb-outline', title, items=[]} = props;

    useEffect(() => {
        // placeholder
    }) 

    const [cards, setCards] = useState([
        {
          id: 1,
          text: '',
        }
      ])

    useEffect(() => {
        let cards: Item[] = []
        {items.map((item, i) => {
            const card = {
                id : i,
                text : item[0]
            }
            cards.push(card)
        })}

        setCards(cards);

        const test = ""
    },[items])       
  

    const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
        setCards((prevCards: Item[]) =>
          update(prevCards, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, prevCards[dragIndex] as Item],
            ],
          }),
        )
      }, [])    

    const renderCard = useCallback(
        (card: { id: number; text: string }, index: number) => {
          return (
            <OutlineCard
              key={card.id}
              index={index}
              id={card.id}
              text={card.text}
              moveCard={moveCard}
            />
          )
        },
        [],
      )    

    return (
        <>
            {items && items.length > 0 ? (
                <div id={id} className="ml-2">
                    <h5>{title}</h5>
                    <div className="sb-outline mt-2 ml-0">
                        <div>{cards.map((card, i) => renderCard(card, i))}</div>
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