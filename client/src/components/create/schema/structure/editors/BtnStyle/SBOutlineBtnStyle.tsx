import React from "react";
import { ButtonGroup, Button } from "reactstrap";
import { faSquareCaretDown, faSquareCaretUp, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zip } from '../../../../../utils';
import { StandardTypeObject, TypeKeys, TypeObject } from "../consts";

export interface SBOutlineBtnStyleProps {
    id: string;
    title: string;
    items: any[];
    onClick: (e: React.MouseEvent<HTMLElement>, text: string) => void;
    changeIndex: (v: TypeObject, dataIndex: number, i: number) => void;
    isEditing: number | null;
}

const SBOutlineBtnStyle = (props: SBOutlineBtnStyleProps) => {

    const { id = 'sb-outline', title, items = [], onClick, changeIndex, isEditing } = props;

    const renderCards = items.map((card, i) => {
        card = zip(TypeKeys, card) as StandardTypeObject;
        const isEditingBool = (isEditing == i);
        return (
            <div className='card' key={i}>
                <div className='card-body list-group-item d-flex justify-content-between align-items-center'>
                    <div>
                        {isEditingBool ? <FontAwesomeIcon icon={faStar} /> : ''}
                        <a title={'Click to view'} href="#" onClick={(e) => onClick(e, card.name)}>{card.name}</a>
                    </div>
                    <div>
                        <ButtonGroup size="sm">
                            {i == 0 ? '' : <Button color="primary" onClick={() => changeIndex(card, i, i - 1)}
                                title={`Move ${card.name} Up`}>
                                <FontAwesomeIcon icon={faSquareCaretUp} />
                            </Button>}
                            {i == items.length - 1 ? '' : <Button color="primary" onClick={() => changeIndex(card, i, i + 1)}
                                title={`Move ${card.name} Down`}>
                                <FontAwesomeIcon icon={faSquareCaretDown} />
                            </Button>}
                        </ButtonGroup>
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
                        <li className="nav-item pb-0"><a title="An outline view of all the schema types" className="active nav-link">{title}</a></li>
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
