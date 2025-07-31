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
            <div className='form-group'>
                <label><strong>{name}</strong></label>
                <p className = "card-subtitle form-text text-muted text-wrap">{_comment}</p>
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
        );
    } else if (type == "Binary") {
        return (
            <div className='form-group'>
                <label><strong>{name}</strong></label>
                <p className = "card-subtitle form-text text-muted text-wrap">{_comment}</p>
                <input
                    type='text'
                    value={data}
                    onChange={e => {
                        setData(e.target.value);
                    }}
                    onBlur = {e => {
                        fieldChange(name, e.target.value)
                        validate(e.target.value, type, options).then(result => {
                            setErrMsg(result);
                        });
                    }}
                    style={{ borderColor: errMsg === "" ? "" : 'red' }}
                />
                {errMsg && <div className="text-danger">{errMsg}</div>}
                {children}
            </div>
        );
    } else if (type == "Number") {
        return (
            <div className='form-group'>
                <label><strong>{name}</strong></label>
                <p className = "card-subtitle form-text text-muted text-wrap">{_comment}</p>
                <input
                    type='number'
                    value={data}
                    onChange={e => {
                        setData(parseFloat(e.target.value));
                    }}
                    onBlur = {e => {
                        fieldChange(name, parseFloat(e.target.value));
                        validate(parseFloat(e.target.value), type, options).then(result => {
                            setErrMsg(result);
                        });                            
                    }}
                    style={{ borderColor: errMsg === "" ? "" : 'red' }}
                />
                {errMsg && <div className="text-danger">{errMsg}</div>}
                {children}
            </div>
        );   
    } else if (type == "Integer") {
        return (
            <div className='form-group'>
                <label><strong>{name}</strong></label>
                <p className = "card-subtitle form-text text-muted text-wrap">{_comment}</p>
                <input
                    type='number'
                    value={data}
                    onChange={e => {
                        setData(parseInt(e.target.value));
                    }}
                    onBlur = {e => {
                        fieldChange(name, parseInt(e.target.value));
                        validate(parseInt(e.target.value), type, options).then(result => {
                            setErrMsg(result);
                        });                            
                    }}
                    style={{ borderColor: errMsg === "" ? "" : 'red' }}
                />
                {errMsg && <div className="text-danger">{errMsg}</div>}
                {children}
            </div>
        );   
    } else { // default string
        return (
            <div className='form-group'>
                <label><strong>{name}</strong></label>
                <p className = "card-subtitle form-text text-muted text-wrap">{_comment}</p>
                <input
                    type='string'
                    value={data}
                    onChange={e => {
                        setData(e.target.value);
                    }}
                    onBlur = {e => {
                        fieldChange(name, e.target.value)
                        validate(e.target.value, "String", options).then(result => {
                            setErrMsg(result);
                        });                            
                    }}
                    style={{ borderColor: errMsg === "" ? "" : 'red' }}
                />
                {errMsg && <div className="text-danger">{errMsg}</div>}
                {children}
            </div>
        );   
    }
};

export default CoreType;