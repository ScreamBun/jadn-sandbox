import { StandardFieldArray } from "components/create/schema/interface";
import React, { useState } from "react";
import SBToggleBtn from "components/common/SBToggleBtn";

interface FieldProps {
    field: StandardFieldArray;
    fieldChange: (k:string, v:any) => void;
    children: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const Array = (props: FieldProps) => {
    const { field, fieldChange, children, parent, value } = props;
    const [_idx, name, type, options, _comment] = field;
    const [toggle, setToggle] = useState(true);
    const [data, setData] = useState(value || {});

    const handleChange = (childKey: string, childValue: any) => {
        setData((prev: any) => {
            const updated = { ...prev };
            if (childValue === "" || childValue === undefined || childValue === null) {
                delete updated[childKey];
            } else {
                updated[childKey] = childValue;
            }
            // Update the overarching generatedMessage under this array field's key (name)
            fieldChange(name, updated);
            return updated;
        });
    };

    return (
        <div className='form-group m-3'>
            <div className='card'>
                <div className='card-header p-4 d-flex align-items-center justify-content-between'>
                    <label><strong>{name}</strong></label>
                    {_comment ? <small className = "card-subtitle form-text text-muted test-wrap mr-3">{_comment}</small> : ""}
                    <SBToggleBtn toggle={toggle} setToggle={setToggle} />
                </div>
                <div className={`card-body mx-2 ${toggle ? '' : 'collapse'}`}>
                    {React.Children.map(children, (child) => {
                        if (React.isValidElement(child)) {
                            // Map each child with a clone of itself with updates fieldChange to update nested values instead of parent
                            return React.cloneElement(child as React.ReactElement<any>, {
                                fieldChange: handleChange,
                                parent: parent,
                                value: data[(child.props as any).field[1]]
                            });
                        }
                        return child;
                    })}
                </div>
            </div>
        </div>
    );
};

export default Array;