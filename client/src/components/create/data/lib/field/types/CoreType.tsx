import { StandardFieldArray, ArrayFieldArray } from "components/create/schema/interface";
import React, {useState} from "react";
import SBInfoBtn from "components/common/SBInfoBtn";
import { destructureField, getDefaultValue, isOptional } from "components/create/data/lib/utils";
import { useDispatch, useSelector } from 'react-redux';
import { validateField as validateFieldAction, clearFieldValidation } from 'actions/validatefield';
import { getFieldError, isFieldValidating } from 'reducers/validatefield';
import { timeZones } from 'components/create/consts';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { Buffer } from 'buffer';

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

    const [data, setData] = useState(value);
    const dispatch = useDispatch();
    const errMsg = useSelector((s: any) => getFieldError(s, name));
    const validating = useSelector((s: any) => isFieldValidating(s, name));
    const [clear, setClear] = useState(toClear);

    const _optional = isOptional(options);

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

    const setDefaults = useSelector((state: any) => state.toggleDefaults);
    React.useEffect(() => {
        if (
            (value === undefined || value === null || value === '') &&
            (data === undefined || data === null || data === '')
        ) {
            const defaultValue = getDefaultValue(type, options);
            if (/*!_optional && */defaultValue !== undefined && setDefaults) {
                setData(defaultValue);
                fieldChange(name, defaultValue);
            }
        }
    }, [setDefaults, fieldChange]);

    React.useEffect(() => {
        setClear(toClear);
        if (toClear === true) {
            setData('');
            fieldChange(name, '');
            dispatch(clearFieldValidation(name));
        }
    }, [toClear, fieldChange]);

    const commonFooter = (
        <>
            {errMsg && <div className="text-danger">{errMsg}</div>}
            {validating && !errMsg && <div className="text-muted"><small>Validating...</small></div>}
            {children}
        </>
    );

    if (type === "Boolean") {
        return (
            <div className='form-group'>
                <div className='form-group d-flex align-items-center justify-content-left'>
                    <label className="nowrap" style={{ fontSize: "1.1rem" }}>{name}{_optional ? "" : "*"}</label>
                    <SBInfoBtn comment={_comment} />
                    <input
                        id={`checkbox-${_idx}`}
                        type='checkbox'
                            checked={!!data}
                            onChange={e => {
                                setData(e.target.checked);
                                fieldChange(name, e.target.checked)
                                if (!e.target.checked && _optional) {
                                    dispatch(clearFieldValidation(name));
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
                    <input
                        type='text'
                        value={data || ''}
                        onChange={e => {
                            const v = e.target.value;
                            setData(v);
                            if (v === '') dispatch(clearFieldValidation(name));
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
                    <input
                        type='number'
                        value={data ?? ''}
                        onChange={e => {
                            const raw = e.target.value;
                            const num = raw === '' ? '' : parseFloat(raw);
                            setData(num === '' ? '' : num);
                            if (raw === '') dispatch(clearFieldValidation(name));
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
        const isStringDuration = options.some(opt => opt === "/dayTimeDuration") || options.some(opt => opt === "/yearMonthDuration");
        return (
            <div className='form-group'>
                <div className='form-group d-flex align-items-center justify-content-between'>
                    <label className="nowrap" style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                    <SBInfoBtn comment={_comment} />
                    <input
                        type={isStringDuration ? 'text' : 'number'}
                        value={data ?? ''}
                        onChange={e => {
                            const raw = e.target.value;
                            //const num = raw === '' ? '' : parseInt(raw);
                            setData(raw === '' ? '' : raw);
                            if (raw === '') dispatch(clearFieldValidation(name));
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
        const isDate = options.some(opt => opt === "/date");
        const isDateTime = options.some(opt => opt === "/date-time");
        const isTime = options.some(opt => opt === "/time");
        const [timezone, setTimezone] = useState('');
        const [dateToggle, setDateToggle] = useState(false);
        return (
        <div className='form-group'>
            <div className='form-group d-flex align-items-center justify-content-between'>
                <label className="nowrap" style={{ fontSize: "1.1rem" }}>{name}{ _optional ? "" : "*"}</label>
                <SBInfoBtn comment={_comment} />
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
                        const v = e.target.value;
                        setData(v);
                        if (v === '') dispatch(clearFieldValidation(name));
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