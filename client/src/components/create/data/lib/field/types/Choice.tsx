import { ArrayFieldArray, StandardFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";
import SBSelect, { Option } from 'components/common/SBSelect';
import Field from 'components/create/data/lib/field/Field';
import { set } from "lodash";
interface FieldProps {
    field: ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children?: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const Choice = (props: FieldProps) => {
    const { field, fieldChange, parent, value } = props;
    const [name, type, options, _comment, children] = field;
    const [toggle, setToggle] = useState(true);
    const [selectedValue, setSelectedValue] = useState<Option | string>(value != '' ? { 'label': value, 'value': value } : '');
    const [selectedChild, setSelectedChild] = useState<any>();

    const handleChange = (e: Option | null) => {
        if (e == null) {
            if (selectedChild) {
                selectedChild.props.fieldChange(selectedChild.props.field[1], '');
            }
            setSelectedValue('');
            setSelectedChild('');
            fieldChange(name, '');
        } else {
            setSelectedValue(e);
            setSelectedChild(getChild(e.value));
            fieldChange(name, selectedChild);
        }
    }

    const childCards = children.map((child: StandardFieldArray, idx: number) => {
        return <Field key={idx} field={child} fieldChange={fieldChange} parent={name} />;
    });

    const getChild = (field_name: string) => { 
        return children.length > 0 ? childCards.find(card => card.props.field[0] === field_name || card.props.field[1] === field_name) : null;
    }

    const getOptions = children.map((child: StandardFieldArray) => {
        return child[1];
    });

    return (
        <div className='form-group m-3'>
            <div className='card'>
                <div className='card-header p-4 d-flex align-items-center justify-content-between'>
                    <label><strong>{name}</strong></label>
                    {_comment ? <small className = "card-subtitle form-text text-muted test-wrap mr-3">{_comment}</small> : ""}
                    <SBToggleBtn toggle={toggle} setToggle={setToggle} />
                </div>
                <div className={`card-body mx-2 ${toggle ? '' : 'collapse'}`}>
                    <SBSelect id={name} name = {name} data = {getOptions}
                    onChange={handleChange}
                    placeholder={`${name} options`}
                    value={selectedValue}
                    isClearable />
                    {selectedValue ? selectedChild : ""}
                </div>
            </div>
        </div>
    );
};

export default Choice;