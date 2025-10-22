import { StandardFieldArray, ArrayFieldArray } from "components/create/schema/interface";
import React, {useEffect, useState} from "react";
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, generateData, getDefaultOpt, getConstOpt, destructureOptions } from "components/create/data/lib/utils";
import { useDispatch, useSelector } from 'react-redux';
import { validateField as validateFieldAction, clearFieldValidation } from 'actions/validatefield';
import { getFieldError, isFieldValidating } from 'reducers/validatefield';
import { timeZones } from 'components/create/consts';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { Buffer } from 'buffer';
import SBHighlightButton from "components/common/SBHighlightButton";
import { clearHighlight } from "actions/highlight";
import { getToggleGenData } from "reducers/gendata";
import SBRegexVisualizer from "components/common/SBRegexVisualizer";

interface FieldProps {
    field: StandardFieldArray | ArrayFieldArray;
    fieldChange: (k:string, v:any) => void;
    children?: JSX.Element | JSX.Element[];
    parent?: string;
    value?: any;
    toClear: boolean;
}

const CoreType = (props: FieldProps) => {
    const { field, fieldChange, children, value, toClear } = props;
    let [_idx, name, type, options, _comment, _children] = destructureField(field);
    const optionsObj = destructureOptions(options);

    const toggleDataGen = useSelector(getToggleGenData);
    const [data, setData] = useState(value);
    const dispatch = useDispatch();
    const errMsg = useSelector((s: any) => getFieldError(s, name));
    const validating = useSelector((s: any) => isFieldValidating(s, name));
    const [_clear, setClear] = useState(toClear);

    const _optional = optionsObj.isOptional;
    const formats = optionsObj.formats;
    const pattern = optionsObj.pattern;
    const highlightWords = [name, data];

    // Fetch default value (option)
    const defaultOpt = getDefaultOpt(options, type);
    useEffect(() => {
        if (defaultOpt !== undefined) { 
            if (type === "Boolean") {
                setData(defaultOpt);
                fieldChange(name, defaultOpt);
            } else {
                setData(defaultOpt);
                fieldChange(name, defaultOpt);
            }
        }
    }, [defaultOpt]);

    // Fetch const value (optional)
    const _const = getConstOpt(options, type);
        useEffect(() => {
        if (_const !== undefined) { 
            if (type === "Boolean") {
                setData(_const);
                fieldChange(name, _const);
            } else {
                setData(_const);
                fieldChange(name, _const);
            }
        }
    }, [_const]);

    const handleBlur = (val: any, valType: string) => {
        if (val === '' || val === undefined || val === null) {
            dispatch(clearFieldValidation(name));
            return;
        }
        if (options.length === 0) {
            dispatch(clearFieldValidation(name));
            return;
        }
        dispatch(validateFieldAction(name, val, valType, options));
    };

    React.useEffect(() => {
        if (
            (value === undefined || value === null || value === '') &&
            (data === undefined || data === null || data === '')
        ) {
            const genData = generateData(options, type);
            if (genData !== undefined && toggleDataGen) {
                setData(genData);
                fieldChange(name, genData);
            }
        }
    }, [toggleDataGen, fieldChange]);

    React.useEffect(() => {
        setClear(toClear);
        if (toClear === true && _const === undefined) {
            setData('');
            fieldChange(name, '');
            dispatch(clearFieldValidation(name));
            dispatch<any>(clearHighlight());
        }
    }, [toClear]);

    const commonFooter = (
        <>
            {errMsg && <div className="text-danger">{errMsg}</div>}
            {validating && !errMsg && <div className="text-muted"><small></small></div>}
            {children}
        </>
    );

    if (type === "Boolean") {
        return (
            <div className='form-group'>
                <div className='form-group d-flex align-items-center justify-content-left'>
                    <label className="nowrap" style={{ fontSize: "1.1rem" }}>{name}{_optional ? "" : "*"}</label>
                    <SBInfoBtn comment={_comment} />
                    <SBHighlightButton highlightWords={highlightWords} />
                    <input
                        id={`checkbox-${_idx}`}
                        type='checkbox'
                            checked={!!data}
                            onChange={e => {
                                if (_const === undefined) {
                                    setData(e.target.checked);
                                    fieldChange(name, e.target.checked)
                                    if (!e.target.checked && _optional) {
                                        dispatch(clearFieldValidation(name));
                                    }
                                }
                            }}
                            className="form-control-medium ms-1"
                            style={{ width: "1rem", height: "1rem", marginRight: "15rem" }}
                        />
                </div>
                {commonFooter}
            </div>
        );
    } else if (type == "Binary") {
        const hexData = Buffer.from(data || '', 'utf8').toString('hex');
        const ascii = Buffer.from(data || '', 'utf8').toString('ascii');
        const base64 = Buffer.from(data || '', 'utf8').toString('base64');
        if (_comment === "") {
            if (data) _comment += `Hex: ${hexData}<br>ASCII: ${ascii}<br>Base64: ${base64}`;
        } else {
            if (data) _comment += `<br>Hex: ${hexData}<br>ASCII: ${ascii}<br>Base64: ${base64}`;
        }
        return (
            <div className='form-group'>
                <div className='form-group d-flex align-items-center justify-content-between'>
                    <label className="nowrap" style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                    <SBInfoBtn comment={_comment} />
                    <SBHighlightButton highlightWords={highlightWords} />
                    <input
                        type='text'
                        value={data || ''}
                        onChange={e => {
                            if (!_const) {
                                const v = e.target.value;
                                setData(v);
                                if (v === '') dispatch(clearFieldValidation(name));
                            }
                        }}
                        onBlur = {e => {
                            fieldChange(name, e.target.value);
                            handleBlur(e.target.value, type);
                        }}
                        className="form-control-medium ms-1"
                        style={{ borderColor: errMsg === "" ? "" : 'red', minWidth: "20rem" }}
                    />
                </div>
                {commonFooter}
            </div>
        );
    } else if (type == "Number") {
        return (
            <div className='form-group'>
                <div className='form-group d-flex align-items-center justify-content-between'>
                    <label className="nowrap" style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                    <SBInfoBtn comment={_comment} />
                    <SBHighlightButton highlightWords={highlightWords} />
                    <input
                        type='number'
                        value={data ?? ''}
                        onChange={e => {
                            if (!_const) {
                                const raw = e.target.value;
                                const num = raw === '' ? '' : parseFloat(raw);
                                setData(num === '' ? '' : num);
                                if (raw === '') dispatch(clearFieldValidation(name));
                            }
                        }}
                        onBlur = {e => {
                            const raw = e.target.value;
                            if (raw === '') { fieldChange(name, ''); dispatch(clearFieldValidation(name)); return; }
                            const num = parseFloat(raw);
                            if (isNaN(num)) { fieldChange(name, ''); dispatch(clearFieldValidation(name)); return; }
                            fieldChange(name, num);
                            handleBlur(num, type);
                        }}
                        className="form-control-medium ms-1"
                        style={{ borderColor: errMsg === "" ? "" : 'red', minWidth: "20rem" }}
                    />
                </div>
                {commonFooter}
            </div>
        );   
    } else if (type == "Integer") {
        const isStringDuration = formats.some(opt => ["/dayTimeDuration", "/yearMonthDuration", "/gYearMonth", "/gMonthDay"].includes(opt));
        return (
            <div className='form-group'>
                <div className='form-group d-flex align-items-center justify-content-between'>
                    <label className="nowrap" style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                    <SBInfoBtn comment={_comment} />
                    <SBHighlightButton highlightWords={highlightWords} />
                    <input
                        type={isStringDuration ? 'text' : 'number'}
                        value={data ?? ''}
                        onChange={e => {
                            if (!_const) {
                                const raw = e.target.value;
                                setData(raw === '' ? '' : raw);
                                if (raw === '') dispatch(clearFieldValidation(name));
                            }
                        }}
                        onBlur = {e => {
                            const raw = e.target.value;
                            if (raw === '') { fieldChange(name, ''); dispatch(clearFieldValidation(name)); return; }
                            if (isStringDuration) {
                                // For duration strings, just pass the raw value
                                fieldChange(name, raw);
                                handleBlur(raw, "String");
                                return;
                            }
                            // For normal integers, parse and validate
                            const num = parseInt(raw);
                            if (isNaN(num)) { fieldChange(name, ''); dispatch(clearFieldValidation(name)); return; }
                            fieldChange(name, num);
                            handleBlur(num, type);
                        }}
                        className="form-control-medium ms-1"
                        style={{ borderColor: errMsg === "" ? "" : 'red', minWidth: "20rem" }}
                    />
                </div>
                {commonFooter}
            </div>
        );   
    } else { // default string
        //Check for date options
        const isDate = formats.some(opt => opt === "/date");
        const isDateTime = formats.some(opt => opt === "/date-time");
        const isTime = formats.some(opt => opt === "/time");
        const [timezone, setTimezone] = useState('');
        const [dateToggle, setDateToggle] = useState(false);
        return (
        <div className='form-group'>
            <div className='form-group d-flex align-items-center justify-content-between'>
                <label className="nowrap" style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                <SBInfoBtn comment={_comment} />
                <SBHighlightButton highlightWords={highlightWords} />
                {pattern ? <SBRegexVisualizer regex={pattern} isBtnPrimary={false} /> : null}
                {isTime || isDateTime || isDate ? <button
                    type="button"
                    className="btn btm-sm p-0 ms-1 me-1"
                    onClick={() => {
                        setDateToggle(!dateToggle);
                        setTimezone(timeZones[0]);
                    }}
                >
                    <FontAwesomeIcon icon={dateToggle ? faToggleOn : faToggleOff} title = "Show or Hide Date/Time Options"/>
                </button> : null}
                <input
                    type={!dateToggle ? 'string' : isDate ? 'date' : isDateTime ? 'datetime-local' : isTime ? 'time' : 'string'}
                    step={isTime ? '1' : undefined}
                    value={!dateToggle ? `${data || ''}${timezone}` : data || ''}
                    onChange={e => {
                        if (!_const) {
                            const v = e.target.value;
                            setData(v);
                            if (v === '') dispatch(clearFieldValidation(name));
                        }
                    }}
                    onBlur={e => {
                        let val = e.target.value;
                        if (isDateTime && timezone) {
                            val = val.replace(/([+-]\d{2}:\d{2})$/, '') + timezone;
                        }
                        fieldChange(name, val);
                        handleBlur(val, 'String');
                    }}
                    className="form-control-medium ms-1"
                    style={{ borderColor: errMsg === "" ? "" : 'red', minWidth: "20rem" }}
                />
                {isDateTime && dateToggle && (
                    <select
                        className="form-control-medium ms-2"
                        value={timezone}
                        onChange={e => setTimezone(e.target.value)}
                        onBlur={_e => {
                            if (data) {
                                let val = data.replace(/([+-]\d{2}:\d{2})$/, '') + timezone;
                                fieldChange(name, val);
                                handleBlur(val, 'String');
                            }
                        }}
                    >
                        {timeZones.map(tz => (
                            <option key={tz} value={tz}>{tz || 'Select TZ'}</option>
                        ))}
                    </select>
                )}
            </div>
            {commonFooter}
        </div>
        );   
    }
};

export default CoreType;