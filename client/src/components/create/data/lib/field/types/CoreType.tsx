import { StandardFieldArray } from "components/create/schema/interface";
import React, {useState} from "react";

interface FieldProps {
    field: StandardFieldArray;
    fieldChange: (k:string, v:any) => void;
    children?: JSX.Element;
    parent?: string;
    value?: any;
}

const CoreType = (props: FieldProps) => {
    const { field, fieldChange, children, parent, value } = props;
    const [_idx, name, type, options, _comment] = field;

    const [data, setData] = useState(value);
    
    if (type === "boolean") {
        return (
            <div className='form-group m-3'>
                <div className='card'>
                    <div className='card-header p-4 d-flex justify-content-between'>
                        <label><strong>{name}</strong></label>
                        {_comment ? <small className = "card-subtitle form-text text-muted test-wrap">{_comment}</small> : ""}
                    </div>
                    <label htmlFor={`checkbox-${_idx}`} className="custom-control-label">
                        <input
                            id = {`checkbox-${_idx}`}
                            type='checkbox'
                            checked={data}
                            value={data}
                            onChange={e => {
                                setData(e.target.checked);
                                fieldChange(name, e.target.checked)
                            }}
                        />
                    </label>
                    {children}
                </div>
            </div>
        );
    } else if (type == "binary") {
        return (
            <div className='form-group m-3'>
                <div className='card'>
                    <div className='card-header p-4 d-flex justify-content-between'>
                        <label><strong>{name}</strong></label>
                        {_comment ? <small className = "card-subtitle form-text text-muted test-wrap">{_comment}</small> : ""}
                    </div>
                    <input
                        type='text'
                        value={data}
                        onChange={e => {
                            setData(e.target.value);
                        }}
                        onBlur = {e => {
                            fieldChange(name, e.target.value)
                        }}
                    />
                    {children}
                </div>
            </div>
        );
    } else if (type == "number") {
        return (
            <div className='form-group m-3'>
                <div className='card'>
                    <div className='card-header p-4 d-flex justify-content-between'>
                        <label><strong>{name}</strong></label>
                        {_comment ? <small className = "card-subtitle form-text text-muted test-wrap">{_comment}</small> : ""}
                    </div>
                    <input
                        type='number'
                        value={data}
                        onChange={e => {
                            setData(e.target.value);
                        }}
                        onBlur = {e => {
                            fieldChange(name, e.target.value)
                        }}
                    />
                    {children}
                </div>
            </div>
        );   
    } else if (type == "integer") {
        return (
            <div className='form-group m-3'>
                <div className='card'>
                    <div className='card-header p-4 d-flex justify-content-between'>
                        <label><strong>{name}</strong></label>
                        {_comment ? <small className = "card-subtitle form-text text-muted test-wrap">{_comment}</small> : ""}
                    </div>
                    <input
                        type='number'
                        value={data}
                        onChange={e => {
                            setData(e.target.value);
                        }}
                        onBlur = {e => {
                            fieldChange(name, e.target.value)
                        }}
                    />
                    {children}
                </div>
            </div>
        );   
    } else { // default string
        return (
            <div className='form-group m-3'>
                <div className='card'>
                    <div className='card-header p-4 d-flex justify-content-between'>
                        <label><strong>{name}</strong></label>
                        {_comment ? <small className = "card-subtitle form-text text-muted test-wrap">{_comment}</small> : ""}
                    </div>
                    <input
                        type='string'
                        value={data}
                        onChange={e => {
                            setData(e.target.value);
                        }}
                        onBlur = {e => {
                            fieldChange(name, e.target.value)
                        }}
                    />
                    {children}
                </div>
            </div>
        );   
    }
};

export default CoreType;