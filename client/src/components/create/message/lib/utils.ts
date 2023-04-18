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

export const validateOptDataElem = (optData: any, count: number) => {
	//check # of elements in record
	let valc = '';
	let valm = [];
	if (optData && count) {
		if (hasProperty(optData, 'minv')) {
			if (count < optData.minv) {
				valc = 'red';
				valm.push('Minv Error: must include at least ' + optData.minv + ' element(s)');
			}
		} else {
			optData.minv = $MINV;
			if (count < optData.minv) {
				valc = 'red';
				valm.push('Minv Error: must include at least ' + optData.minv + ' element(s)');
			}
		}
		if (hasProperty(optData, 'maxv')) {
			if (count > optData.maxv) {
				valc = 'red';
				valm.push('Maxv Error: must not include more than ' + optData.maxv + ' element(s)');
			}
		} else {
			optData.maxv = $MAX_ELEMENTS;
			if (count > optData.maxv) {
				valc = 'red';
				valm.push('Maxv Error: must not include more than ' + optData.maxv + ' element(s)');
			}
		}
	}
	return ({ 'color': valc, 'msg': valm });
}

export const validateOptData = (optData: any, data: any) => {
	let valc = '';
	let valm = [];
	if (optData && data) {
		if (hasProperty(optData, 'minf')) {
			if (data < optData.minf) {
				valc = 'red';
				valm.push('Minf Error: must be greater than ' + optData.minf);
			}
		}
		if (hasProperty(optData, 'maxf')) {
			if (data > optData.maxf) {
				valc = 'red';
				valm.push('Maxf Error: must be less than ' + optData.maxf);
			}
		}
		if (hasProperty(optData, 'minv')) {
			if (typeof data == 'string') {
				if (data.length < optData.minv) {
					valc = 'red';
					valm.push('Minv Error: must be greater than ' + optData.minv + ' characters');
				}
			} else {
				if (data < optData.minv) {
					valc = 'red';
					valm.push('Minv Error: must be greater than ' + optData.minv);
				}
			}
		} else {
			optData.minv = $MINV;
			if (data < optData.minv) {
				valc = 'red';
				valm.push('Minv Error: must be greater than ' + optData.minv);
			}
		}
		if (hasProperty(optData, 'maxv')) {
			if (typeof data == 'string') {
				if (data.length > optData.maxv) {
					valc = 'red';
					valm.push('Maxv Error: must be less than ' + optData.maxv + ' characters');
				}
			} else {
				if (data > optData.maxv) {
					valc = 'red';
					valm.push('Maxv Error: must be less than ' + optData.maxv);
				}
			}
		} else {
			optData.maxv = $MAX_STRING;
			if (data.length > optData.maxv) {
				valc = 'red';
				valm.push('Maxv Error: must be less than ' + optData.maxv);
			}
		}
		if (hasProperty(optData, 'pattern') && typeof data == 'string') {
			if (!optData.pattern.test(data)) {
				valc = 'red';
				valm.push('Pattern Error: must match regular expression specified by pattern: ' + optData.pattern);
			}
		}
		//format check - server side

	}
	return ({ 'color': valc, 'msg': valm });
}


export const validateOptDataBinary = (optData: any, data: any) => {
	let valc = '';
	let valm = [];
	//A Binary type, the minv and maxv type options constrain the number of octets (bytes) in the binary value.
	//TODO: Get number of bytes in data

	if (optData && data) {
		if (hasProperty(optData, 'minv')) {
			if (data < optData.minv) {
				valc = 'red';
				valm.push('Minv Error: must be greater than ' + optData.minv);
			}

		} else {
			optData.minv = $MINV;
			if (data < optData.minv) {
				valc = 'red';
				valm.push('Minv Error: must be greater than ' + optData.minv);
			}
		}
		if (hasProperty(optData, 'maxv')) {
			if (data > optData.maxv) {
				valc = 'red';
				valm.push('Maxv Error: must be less than ' + optData.maxv);
			}
		} else {
			optData.maxv = $MAX_BINARY;
			if (data.length > optData.maxv) {
				valc = 'red';
				valm.push('Maxv Error: must be less than ' + optData.maxv);
			}
		}
		//format check - server side
	}
	return ({ 'color': valc, 'msg': valm });
}

export const validateBinary = (data: any, type: string) => {
	//TODO: ipv4, ipv6
	//Basic check if binary data
	if (type == 'binary' && !data.match(/^[0-1]{1,}$/g)) {
		return false;
	}
	if (type == 'ipv4' && !data.match(/^[0-1]{1,}$/g)) {
		return false;
	}
	if (type == 'ipv6' && !data.match(/^[0-1]{1,}$/g)) {
		return false;
	}
	return true;
}