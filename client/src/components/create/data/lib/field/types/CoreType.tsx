import { StandardFieldArray, ArrayFieldArray } from "components/create/schema/interface";
import React, {useState} from "react";
import { validate } from "components/create/data/lib/InputValidator";

interface FieldProps {
    field: StandardFieldArray | ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children?: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const CoreType = (props: FieldProps) => {
    const { field, fieldChange, children, value } = props;
    let [_idx, name, type, options, _comment] = [0, '', '', [] as any|any[], ''];
    if (field.length == 5) {
        if (Array.isArray(field[4])) {
            [name as any, type, options, _comment as any, children as any[]] = field;
        } else {
            [_idx as any, name, type as any, options, _comment as any] = field;
        }
    } else {
        [name as any, type, options, _comment as any] = field;
    }

    const [data, setData] = useState(value);
    const [errMsg, setErrMsg] = useState("");
    
    if (type === "Boolean") {
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
    } else if (type == "Binary") {
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
                            setErrMsg(validate(e.target.value, type, options));
                        }}
                        onBlur = {e => {
                            fieldChange(name, e.target.value)
                        }}
                        style={{ borderColor: errMsg === "" ? "" : 'red' }}
                    />
                    {errMsg && <div className="text-danger">{errMsg}</div>}
                    {children}
                </div>
            </div>
        );
    } else if (type == "Number") {
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
                            setData(parseFloat(e.target.value));
                            setErrMsg(validate(parseFloat(e.target.value), type, options));
                        }}
                        onBlur = {e => {
                            fieldChange(name, parseFloat(e.target.value));
                        }}
                        style={{ borderColor: errMsg === "" ? "" : 'red' }}
                    />
                    {errMsg && <div className="text-danger">{errMsg}</div>}
                    {children}
                </div>
            </div>
        );   
    } else if (type == "Integer") {
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
                            setData(parseInt(e.target.value));
                            setErrMsg(validate(parseInt(e.target.value), type, options));
                        }}
                        onBlur = {e => {
                            fieldChange(name, parseInt(e.target.value));
                        }}
                        style={{ borderColor: errMsg === "" ? "" : 'red' }}
                    />
                    {errMsg && <div className="text-danger">{errMsg}</div>}
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