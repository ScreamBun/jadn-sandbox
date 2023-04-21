/* eslint-disable import/prefer-default-export */
// Field Utils
import { $MINV, $MAX_ELEMENTS, $MAX_STRING, $MAX_BINARY } from 'components/create/consts';
import { hasProperty } from 'react-json-editor/dist/utils';
import { FieldArray, TypeArray } from '../../schema/interface';

export const isOptional = (def: TypeArray | FieldArray) => {
	switch (def.length) {
		case 5:
			return def[3].includes('[0');
		case 4:
			return def[2].includes('[0');
		default:
			console.log(`default optional - ${def[0]} - ${def[1]}`);
			return false;
	}
};

//TYPE OPTION VALIDATION
//possibly change count to data.length
// optData validation for Array, ArrayOf, Map, MapOf, or Record
export const validateOptDataElem = (optData: any, count: number, formatCheck: boolean = false, data?: any) => {
	let isFormatted: boolean = false;
	let m = [];
	let c = '';

	if (formatCheck && data) {
		isFormatted = validateArrayFormat(data, optData.format);
		if (!isFormatted) {
			m.push('Format Error: Invalid ' + optData.format + ' value');
		}
	}

	//check # of elements in record
	if (optData && count) {
		if (hasProperty(optData, 'minv')) {
			if (count < optData.minv) {
				m.push('Minv Error: must include at least ' + optData.minv + ' element(s)');
			}
		} else {
			optData.minv = $MINV;
			if (count < optData.minv) {
				m.push('Minv Error: must include at least ' + optData.minv + ' element(s)');
			}
		}
		if (hasProperty(optData, 'maxv')) {
			if (count > optData.maxv) {
				m.push('Maxv Error: must not include more than ' + optData.maxv + ' element(s)');
			}
		} else {
			optData.maxv = $MAX_ELEMENTS;
			if (count > optData.maxv) {
				m.push('Maxv Error: must not include more than ' + optData.maxv + ' element(s)');
			}
		}
	}

	if (m.length != 0) {
		c = 'red';
	}
	return { 'msg': m, 'color': c };
}
// optData validation for String, Number, Integer
export const validateOptData = (optData: any, data: any, baseType: 'string' | 'number' | 'integer') => {
	let m = [];
	let c = '';

	if (optData && data) {
		if (hasProperty(optData, 'minv')) {
			if (baseType == 'string' && typeof data == 'string') {
				if (data.length < optData.minv) {
					m.push('Minv Error: must be greater than ' + optData.minv + ' characters');
				}
			} else {
				if (data < optData.minv) {
					m.push('Minv Error: must be greater than ' + optData.minv);
				}
			}
		} else {
			optData.minv = $MINV;
			if (baseType == 'string' && typeof data == 'string') {
				if (data.length < optData.minv) {
					m.push('Minv Error: must be greater than ' + optData.minv + ' characters');
				}
			} else {
				if (data < optData.minv) {
					m.push('Minv Error: must be greater than ' + optData.minv);
				}
			}
		}
		if (hasProperty(optData, 'maxv')) {
			if (baseType == 'string' && typeof data == 'string') {
				if (data.length > optData.maxv) {
					m.push('Maxv Error: must be less than ' + optData.maxv + ' characters');
				}
			} else {
				if (data > optData.maxv) {
					m.push('Maxv Error: must be less than ' + optData.maxv);
				}
			}
		} else {
			optData.maxv = $MAX_STRING;
			if (baseType == 'string' && typeof data == 'string') {
				if (data.length > optData.maxv) {
					m.push('Maxv Error: must be less than ' + optData.maxv + ' characters');
				}
			} else {
				if (data > optData.maxv) {
					m.push('Maxv Error: must be less than ' + optData.maxv);
				}
			}
		}

		//string only
		if (hasProperty(optData, 'pattern') && baseType == 'string' && typeof data == 'string') {
			const regex = new RegExp(optData.pattern, "g");
			if (!regex.test(data)) {
				m.push('Pattern Error: must match regular expression specified by pattern: ' + optData.pattern);
			}
		}
		//number only
		if (hasProperty(optData, 'minf') && baseType == 'number') {
			if (data < optData.minf) {
				m.push('Minf Error: must be greater than ' + optData.minf);
			}
		}
		if (hasProperty(optData, 'maxf') && baseType == 'number') {
			if (data > optData.maxf) {
				m.push('Maxf Error: must be less than ' + optData.maxf);
			}
		}
		//format check - server side
		if (hasProperty(optData, 'format') && baseType == 'string') {
			const isFormatted = validateStringFormat(data, optData.format);
			if (!isFormatted) {
				m.push('Format Error: Invalid ' + optData.format + ' value');
			}
		}
		if (hasProperty(optData, 'format') && baseType == 'number') {
			const isFormatted = validateNumericFormat(data, optData.format);
			if (!isFormatted) {
				m.push('Format Error: Invalid ' + optData.format + ' value');
			}
		}
	}
	if (m.length != 0) {
		c = 'red';
	}
	return { 'msg': m, 'color': c };
}

// optData validation for Binary
export const validateOptDataBinary = (optData: any, data: string) => {
	const binaryType = optData.format ?? 'binary';

	let m = [];
	let c = '';
	// binary - A sequence of octets. Length is the number of octets.
	// A Binary type, the minv and maxv type options constrain the number of octets (bytes) in the binary value.
	//TODO: Get number of bytes in data
	const isFormatted = validateBinaryFormat(data, binaryType);
	if (!isFormatted) {
		m.push('Format Error: Invalid ' + binaryType + ' value');
	}

	if (optData && data) {
		if (hasProperty(optData, 'minv')) {
			if (data < optData.minv) {
				m.push('Minv Error: must be greater than ' + optData.minv + ' bytes');
			}

		} else {
			optData.minv = $MINV;
			if (data < optData.minv) {
				m.push('Minv Error: must be greater than ' + optData.minv + ' bytes');
			}
		}
		if (hasProperty(optData, 'maxv')) {
			if (data > optData.maxv) {
				m.push('Maxv Error: must be less than ' + optData.maxv + ' bytes');
			}
		} else {
			optData.maxv = $MAX_BINARY;
			if (data.length > optData.maxv) {
				m.push('Maxv Error: must be less than ' + optData.maxv + ' bytes');
			}
		}
		//format check - server side
	}

	if (m.length != 0) {
		c = 'red';
	}
	return { 'msg': m, 'color': c };
}


//FORMAT TYPE OPTION VALIDATION: given [type of value/format] and [data], validate
//binary: eui, ipv4-addr, ipv6-addr
export const validateBinaryFormat = (data: string, type: string) => {
	if (type == 'binary' && data.match(/^[-A-Za-z0-9+=]{1,50}|=[^=]|={3,}$/)) { //Base64url encoding
		return true;
	}
	if (type == 'x' && data.match(/(0x)?[0-9A-F]+/)) { //hex
		return true;
	}
	if (type == 'eui' && data.match(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\\.[0-9a-fA-F]{4}\\.[0-9a-fA-F]{4})$/)) { //MAC-addr
		return true;
	}
	if ((type == 'ipv4' || type == 'ipv4-addr') && data.match(
		/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) {
		return true;
	}
	if ((type == 'ipv6' || type == 'ipv6-addr') && data.match(
		/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/)) {
		return true;
	}
	return false;
}

//array: ipv4-net, ipv6-net
export const validateArrayFormat = (data: any[], type: string) => {
	if (type == 'ipv4-net') {
		if (data[0].match(
			/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) {
			if (data.length == 1) {
				return true;
			} else if (data.length == 2 && ((typeof parseInt(data[1]) == "number" && parseInt(data[1]) >= 0 && parseInt(data[1]) <= 128) || data[1] == '')) {
				return true;
			}
		}
	}
	if (type == 'ipv6-net') {
		if (data[0].match(
			/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/)) {
			if (data.length == 1) {
				return true;
			} else if (data.length == 2 && parseInt(data[1]) >= 0 && parseInt(data[1]) <= 128) {
				return true;
			}
		}
	}
	return false;
}

//integer: i8, i16, i32, u<n>
//number: f16, f32
export const validateNumericFormat = (data: any, type: string) => {
	if (type == 'i8') {
		//check 8 bit
		if (-128 < data && data < 127) {
			return true;
		}
	}
	if (type == 'i16') {
		//check 16 bit
		if (-32768 < data && data < 32767) {
			return true;
		}
	}
	if (type == 'i32') {
		//check 32 bit
		if (-2147483648 < data && data < 2147483647) {
			return true;
		}
	}
	if (type == 'u<n>') { //TODO
		const n = data.substring(1); // digit after u
		//check n bits
		if (0 < data && data < (2 ** (parseInt(n) - 1))) {
			return true;
		}
	}
	if (type == 'f16') {
		//check half precision point
		return true;
	}
	if (type == 'f32') {
		//check single precision point
		return true;
	}
	return false;
}
//string: JSON schema section 7.3
///https://json-schema.org/draft/2020-12/json-schema-validation.html#name-resource-identifiers
export const validateStringFormat = (data: string, type: string) => {
	if (type == 'email' && data.match(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,3}$/)) {
		return true;
	}
	if (type == 'idn-email' && data.match(/^\S+@\S+$/)) {
		return true;
	}
	if ((type == 'hostname' || type == 'idn-hostname') && data.match(/\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,255}\b/)) {
		return true;
	}
	if ((type == 'ipv4') && data.match(
		/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) {
		return true;
	}
	if ((type == 'ipv6') && data.match(
		/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/)) {
		return true;
	}
	if (type == 'uri-reference' || type == 'iri-reference') {
		//if data is valid uri/ref
		//then check if vald iri/ref
		return true;
	}
	if (type == 'uri' || type == 'iri') {
		if (data.match(/\w+:(\/?\/?)[^\s]+/)) {
			if (type == 'iri') {
				if (data.match(/^<(.*)>$/)) {
					return true;
				}
			} else {
				return true;
			}
		}
	}

	if (type == 'uuid' &&
		data.match(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/)) {
		return true;
	}
	if (type == 'uri-template' &&
		data.match(/^(((ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*))?(\/?)(\{?)([a-zA-Z0-9\-\.\?\,\'\/\\\+\~\{\}\&%\$#_]*)?(\}?)(\/?)$/)) {
		return true;
	}
	if (type == 'json-pointer' || type == 'relative-json-pointer') {
		return true;
	}
	if (type == 'regex') { //check for valid pattern?
		return true;
	}
	return false;
}