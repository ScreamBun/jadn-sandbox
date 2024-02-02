import React, { useState } from "react";
import { isOptional, validateOptDataBinary, validateOptDataElem, validateOptDataNum, validateOptDataStr } from "../../utils";
import { v4 as uuid4 } from 'uuid';
import dayjs from 'dayjs';
import { Buffer } from 'buffer';
import { hasProperty } from "components/utils";

//This component is used to help users format/serialize data into valid JSON
//input fields, basic input validation, and parsing
//e.g. ipv4 addr : fields for [ipv4][/CIDR ] with field validation then gets parsed into JSON as => ipv4/CIDR 
const FormattedField = (props: any) => {

    const { basicProps, config, optData, errMsg, setErrMsg, value } = props;
    const { arr, def, optChange, parent, children } = basicProps;
    const [_idx, name, _type, _opts, comment] = def;
    const msgName = (parent ? [parent, name] : [name]).join('.');
    const [data, setData] = useState(value);

    if (hasProperty(optData, 'default') && value == '') {
        setData(optData.default);
    }
    const err = errMsg.map((msg, index) =>
        <div key={index}><small className='form-text' style={{ color: 'red' }}>{msg}</small></div>
    );

    //UUID
    const createUUID = () => {
        const randomID = uuid4();
        setData(randomID);
        optChange(name, randomID, arr);
    }

    //ipv4-net 
    //ipv6-net
    const [ipValue, setIpValue] = useState<any[]>(['', '']);
    const ipvNetOnchg = (k: string, v: any, idx: number) => {
        const newArr = ipValue.map((obj, i) => {
            if (i === idx) {
                return v;
            } else {
                return obj;
            }
        });
        setIpValue(newArr);
        const encoded = Buffer.from(newArr[0], "utf8").toString('base64');
        const newValue = `${encoded}${newArr[1] ? `/${newArr[1]}` : ``}`;

        const errCheck = validateOptDataElem(config, optData, newArr, optData.format ? true : false);
        setErrMsg(errCheck);
        optChange(k, newValue);
    }

    switch (optData.format) {
        case 'date-time':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <input
                                value={data}
                                name={name}
                                type={"datetime-local"}
                                step="any"
                                min={dayjs().format('YYYY-MM-DDTHH:mm:ssZ[Z]')}
                                onChange={e => {
                                    setData(e.target.value);
                                }}
                                onBlur={e => {
                                    //TODO? check for min/max?
                                    optChange(name, dayjs(e.target.value).format('YYYY-MM-DDTHH:mm:ssZ[Z]'), arr);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'date':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <input
                                value={data}
                                name={name}
                                type={"date"}
                                step="any"
                                min={dayjs().format('YYYY-MM-DD')}
                                onChange={e => {
                                    setData(e.target.value);
                                }}
                                onBlur={e => {
                                    //TODO? check for min/max?
                                    optChange(name, dayjs(e.target.value).format('YYYY-MM-DD'), arr);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'time':
        case 'duration':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <input
                                value={data}
                                name={name}
                                type='time'
                                step="1"
                                onChange={e => {
                                    setData(e.target.value);
                                }}
                                onBlur={e => {
                                    //TODO? check for min/max?
                                    optChange(name, e.target.value, arr);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'email':
        case 'idn-email':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <input
                                type='email'
                                name={name}
                                value={data}
                                onChange={e => {
                                    setData(e.target.value);
                                }}
                                onBlur={e => {
                                    const errCheck = validateOptDataStr(config, optData, e.target.value);
                                    setErrMsg(errCheck);
                                    optChange(name, e.target.value, arr);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'ipv4':
        case 'ipv4-addr':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <input
                                type='text'
                                name={name}
                                value={data}
                                onChange={e => {
                                    setData(e.target.value);
                                }}
                                onBlur={e => {
                                    const encoded = Buffer.from(e.target.value, "utf8").toString('base64');
                                    const errCheck = validateOptDataBinary(config, optData, e.target.value);
                                    setErrMsg(errCheck);
                                    optChange(name, encoded, arr);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'ipv4-net':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0 input-group'>
                            <input
                                type='text'
                                name={name}
                                value={data}
                                onChange={e => {
                                    setIpValue(ipValue => [e.target.value, ipValue[1]]);
                                }}
                                onBlur={e => {
                                    ipvNetOnchg(name, e.target.value, 0)
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                            <span className="input-group-text"> / </span>
                            <input
                                type='number'
                                onWheel={(e) => { e.target.blur(); }}
                                name={name}
                                min={0}
                                max={128}
                                value={data}
                                onChange={e => {
                                    setIpValue(ipValue => [ipValue[0], e.target.value]);
                                }}
                                onBlur={e =>
                                    ipvNetOnchg(name, e.target.value, 1)
                                }
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'ipv6':
        case 'ipv6-addr':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <input
                                type='text'
                                name={name}
                                value={data}
                                onChange={e => {
                                    setData(e.target.value);
                                }}
                                onBlur={e => {
                                    const encoded = Buffer.from(e.target.value, "utf8").toString('base64');
                                    const errCheck = validateOptDataBinary(config, optData, e.target.value);
                                    setErrMsg(errCheck);
                                    optChange(name, encoded, arr);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'ipv6-net':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0 input-group'>
                            <input
                                type='text'
                                name={name}
                                value={data}
                                onChange={e => {
                                    setIpValue(ipValue => [e.target.value, ipValue[1]]);
                                }}
                                onBlur={e => {
                                    ipvNetOnchg(name, e.target.value, 0);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                            <span className="input-group-text"> / </span>
                            <input
                                type={'number'}
                                onWheel={(e) => { e.target.blur(); }}
                                name={name}
                                min={0}
                                max={128}
                                value={data}
                                onChange={e => {
                                    setIpValue(ipValue => [ipValue[0], e.target.value]);
                                }}
                                onBlur={e =>
                                    ipvNetOnchg(name, e.target.value, 1)
                                }
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'eui':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <input
                                type='text'
                                name={name}
                                value={data}
                                onChange={e => {
                                    setData(e.target.value);
                                }}
                                onBlur={e => {
                                    const encoded = Buffer.from(e.target.value, "utf8").toString('base64').toUpperCase();
                                    const errCheck = validateOptDataBinary(config, optData, e.target.value);
                                    setErrMsg(errCheck);
                                    optChange(name, encoded, arr);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'uuid':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <div className='d-flex justify-content-between'>
                                <input
                                    value={data}
                                    type='text'
                                    name={name}
                                    onChange={e => {
                                        setData(e.target.value);
                                    }}
                                    onBlur={e => {
                                        const errCheck = validateOptDataStr(config, optData, e.target.value);
                                        setErrMsg(errCheck);
                                        optChange(name, e.target.value, arr);
                                    }}
                                    style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                                />
                                <button type="button" className='btn btn-sm btn-primary float-end text-nowrap' onClick={createUUID}>Generate UUID</button>
                            </div>
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'i8':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <input
                                type='number'
                                onWheel={(e) => { e.target.blur(); }}
                                min={-128}
                                max={127}
                                name={name}
                                value={data}
                                onChange={e => {
                                    setData(e.target.value);
                                }}
                                onBlur={e => {
                                    const errCheck = validateOptDataNum(optData, parseInt(e.target.value));
                                    setErrMsg(errCheck);
                                    optChange(name, parseInt(e.target.value), arr);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'i16':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <input
                                type='number'
                                onWheel={(e) => { e.target.blur(); }}
                                min={-32768}
                                max={32767}
                                name={name}
                                value={data}
                                onChange={e => {
                                    setData(e.target.value);
                                }}
                                onBlur={e => {
                                    const errCheck = validateOptDataNum(optData, parseInt(e.target.value));
                                    setErrMsg(errCheck);
                                    optChange(name, parseInt(e.target.value), arr);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'i32':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <input
                                type='number'
                                onWheel={(e) => { e.target.blur(); }}
                                name={name}
                                min={-2147483648}
                                max={2147483647}
                                value={data}
                                onChange={e => {
                                    setData(e.target.value);
                                }}
                                onBlur={e => {
                                    const errCheck = validateOptDataNum(optData, parseInt(e.target.value));
                                    setErrMsg(errCheck);
                                    optChange(name, parseInt(e.target.value), arr);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'u\\d+': //TODO
        case 'u<n>':
            const n = optData.format.substring(1); // digit after u
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <input
                                type='number'
                                onWheel={(e) => { e.target.blur(); }}
                                min={0}
                                max={2 ** (parseInt(n) - 1)}
                                name={name}
                                value={data}
                                onChange={e => {
                                    setData(e.target.value);
                                }}
                                onBlur={e => {
                                    const errCheck = validateOptDataNum(optData, parseInt(e.target.value));
                                    setErrMsg(errCheck);
                                    optChange(name, parseInt(e.target.value), arr);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );

        case 'x':
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <input
                                type='text'
                                name={name}
                                value={data}
                                onChange={e => {
                                    setData(e.target.value);
                                }}
                                onBlur={e => {
                                    //TODO : JSON string containing Base16 (hex) encoding of a binary value as defined in RFC 4648 Section 8. 
                                    //Note that the Base16 alphabet does not include lower-case letters.
                                    const encoded = Buffer.from(e.target.value, "utf8").toString('base64').toUpperCase();
                                    const errCheck = validateOptDataBinary(config, optData, e.target.value);
                                    setErrMsg(errCheck);
                                    optChange(name, encoded, arr);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );


        case 'hostname':
        case 'idn-hostname':
        case 'uri':
        case 'uri-reference':
        case 'iri':
        case 'iri-reference':
        case 'uri-template':
        case 'json-pointer':
        case 'relative-json-pointer':
        case 'regex':
        default:
            return (
                <div className='form-group'>
                    <div className='card'>
                        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
                            <div>
                                <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
                                {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
                            </div>
                            {children}
                        </div>
                        <div className='card-body m-0 p-0'>
                            <input
                                type='text'
                                name={name}
                                value={data}
                                onChange={e => {
                                    setData(e.target.value);
                                }}
                                onBlur={e => {
                                    const errCheck = validateOptDataStr(config, optData, e.target.value);
                                    setErrMsg(errCheck);
                                    optChange(name, e.target.value, arr);
                                }}
                                style={{ borderColor: errMsg.length != 0 ? 'red' : '' }}
                            />
                        </div>
                        {err}
                    </div>
                </div>
            );
    }
}
export default FormattedField;