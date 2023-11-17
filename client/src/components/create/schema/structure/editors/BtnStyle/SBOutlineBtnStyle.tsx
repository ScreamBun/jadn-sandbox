import React from "react";
import { faSquareCaretDown, faSquareCaretUp, faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TypeArray } from "components/create/schema/interface";

export interface SBOutlineBtnStyleProps {
    id: string;
    title: string;
    items: any[];
    visibleCard: number | null;
    changeIndex: (v: TypeArray, dataIndex: number, i: number) => void;
    onStarClick: (index: number) => void;
    onScrollToCard: (idx: number) => void;
}

const SBOutlineBtnStyle = (props: SBOutlineBtnStyleProps) => {

    const { id = 'sb-outline', title, visibleCard, items = [],
        onStarClick, onScrollToCard, changeIndex } = props;

    const renderCards = items.map((card, i) => {
        const backgroundColor_class = i == visibleCard ? 'highlight-color' : ''
        const onCardClick = (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            onScrollToCard(i);
        }

        return (
            <div className={`card ${backgroundColor_class}`} key={i}>
                <div className='card-body list-group-item d-flex justify-content-between align-items-center'>
                    <div>
                        <span onClick={() => onStarClick(i)}>
                            <FontAwesomeIcon className='me-1' icon={card.isStarred == true ? faStar : farStar} />
                        </span>
                        <a title={'Click to view'} href={`#${i}`} onClick={onCardClick}>{card.text}</a>
                    </div>

                    <div className="btn-group" role="group" aria-label="button group">
                        {i == 0 ? '' :
                            <button type='button' className='btn btn-sm btn-primary' onClick={() => changeIndex(card.value, i, i - 1)}
                                title={`Move ${card.text} Up`}>
                                <FontAwesomeIcon icon={faSquareCaretUp} />
                            </button>}
                        {i == items.length - 1 ? '' :
                            <button type='button' className='btn btn-sm btn-primary' onClick={() => changeIndex(card.value, i, i + 1)}
                                title={`Move ${card.text} Down`}>
                                <FontAwesomeIcon icon={faSquareCaretDown} />
                            </button>}
                    </div>
                </div>
            </div>
        );
    })


    return (
        <div id='outlineScrollContainer'>
            {items && items.length > 0 ? (
                <div id={id}>
                    <ul className="nav nav-pills">
                        <li className="nav-item pb-0"><a title="An outline view of all the schema types" className="active nav-link bg-primary">{title}</a></li>
                    </ul>
                    <div className="sb-outline mt-2">
                        <div>
                            {renderCards}
                        </div>
                    </div>
                </div>
            ) : (
                <></>
            )
            }
        </div>
    );
}

export default SBOutlineBtnStyle;
