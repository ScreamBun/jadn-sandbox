import { StandardFieldArray, ArrayFieldArray } from "components/create/schema/interface";
import React, {useState} from "react";
import { validate } from "components/create/data/lib/InputValidator";
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, isOptional } from "components/create/data/lib/utils";
interface FieldProps {
    field: StandardFieldArray | ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children?: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
}

const CoreType = (props: FieldProps) => {
    const { field, fieldChange, children, value } = props;
    let [_idx, name, type, options, _comment, _children] = destructureField(field);

    const [data, setData] = useState(value);
    const [errMsg, setErrMsg] = useState("");

    const _optional = isOptional(options);
    
    if (type === "Boolean") {
        return (
            <div className='p-1 form-group'>
                <div className='card jadn-type'>
                    <div className='card-header d-flex align-items-center justify-content-between'>
                        <div className="d-flex align-items-center">
                            {/* <label><strong>{name}{ _optional ? "" : "*"}</strong></label> */}
                            <label>{name}{ _optional ? "" : "*"}</label>
                            <SBInfoBtn comment={_comment} />
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
                            className="form-control-sm"
                        />
                    </label>
                    </div>
                    {children}
                </div>
            </div>
        );
    } else if (type == "Binary") {
        return (
            <div className='p-1 form-group'>
                <div className='card jadn-type'>
                    <div className='card-header d-flex align-items-center justify-content-between'>
                        <div className="d-flex align-items-center">
                            {/* <label><strong>{name}{ _optional ? "" : "*"}</strong></label> */}
                            <label>{name}{ _optional ? "" : "*"}</label>
                            <SBInfoBtn comment={_comment} />
                        </div>
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
                        className="form-control-sm"
                        style={{ borderColor: errMsg === "" ? "" : 'red' }}
                    />
                    </div>
                    {errMsg && <div className="text-danger">{errMsg}</div>}
                    {children}
                </div>
            </div>
        );
    } else if (type == "Number") {
        return (
            <div className='p-1 form-group'>
                <div className='card jadn-type'>
                    <div className='card-header d-flex align-items-center justify-content-between'>
                        <div className="d-flex align-items-center">
                            {/* <label><strong>{name}{ _optional ? "" : "*"}</strong></label> */}
                            <label>{name}{ _optional ? "" : "*"}</label>
                            <SBInfoBtn comment={_comment} />
                        </div>
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
                        className="form-control-sm"
                        style={{ borderColor: errMsg === "" ? "" : 'red' }}
                    />
                    </div>
                    {errMsg && <div className="text-danger">{errMsg}</div>}
                    {children}
                </div>
            </div>
        );   
    } else if (type == "Integer") {
        return (
            <div className='p-1 form-group'>
                <div className='card jadn-type'>
                    <div className='card-header d-flex align-items-center justify-content-between'>
                        <div className="d-flex align-items-center">
                            {/* <label><strong>{name}{ _optional ? "" : "*"}</strong></label> */}
                            <label>{name}{ _optional ? "" : "*"}</label>
                            <SBInfoBtn comment={_comment} />
                        </div>
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
                        className="form-control-sm"
                        style={{ borderColor: errMsg === "" ? "" : 'red' }}
                    />
                    </div>
                    {errMsg && <div className="text-danger">{errMsg}</div>}
                    {children}
                </div>
            </div>
        );   
    } else { // default string
        return (
            <div className='p-1 form-group'>
                <div className='card jadn-type'>
                    <div className='card-header d-flex align-items-center justify-content-between'>
                        <div className="d-flex align-items-center">
                            {/* <label><strong>{name}{ _optional ? "" : "*"}</strong></label> */}
                            <label>{name}{ _optional ? "" : "*"}</label>
                            <SBInfoBtn comment={_comment} />
                        </div>
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
                            className="form-control-sm"
                            style={{ borderColor: errMsg === "" ? "" : 'red' }}
                        />
                        </div>
                        {errMsg && <div className="text-danger">{errMsg}</div>}
                        {children}
                </div>
            </div>
        );   
    }
};

export default CoreType;