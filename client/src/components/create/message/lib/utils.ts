/* eslint-disable import/prefer-default-export */
// Field Utils
import { $MINV, $MAX_ELEMENTS, $MAX_STRING } from 'components/create/consts';
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
	if (optData) {
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
		if (hasProperty(optData, 'format')) {
			const isFormatted = isFormattedOptData(optData.format, data);
			if (!isFormatted) {
				valc = 'red';
				valm.push('Format Error: must match specified format: ' + optData.format);
			}
		}
	}
	return ({ 'color': valc, 'msg': valm });
}

export const isFormattedOptData = (formatType: any, value: any) => {
	var isFormatted = false;
	// JSON Formats
	switch (formatType) {
		case 'date-time':
			//YYYY-MM-DD T HH:MM:SS [.S] Z
			break;

		case 'date':
			//YYYY-MM-DD
			break;

		case 'time':
			// HH:MM:SS [.S] Z
			break;

		case 'duration':
			break;

		case 'email':
			break;

		case 'idn-email':
			break;

		case 'hostname':
			break;

		case 'idn-hostname':
			break;

		case 'ipv4':
			break;

		case 'ipv6':
			break;

		case 'uri':
			break;

		case 'uri-reference':
			break;

		case 'iri':
			break;

		case 'iri-reference':
			break;

		case 'uri-template':
			break;

		case 'json-pointer':
			break;

		case 'relative-json-pointer':
			break;

		case 'regex':
			break;

		case 'uuid':
			break;

		// JADN Formats
		case 'eui':
			break;

		case 'ipv4-addr':
			break;

		case 'ipv6-addr':
			break;

		case 'ipv4-net':
			break;

		case 'ipv6-net':
			break;

		case 'i8':
			break;

		case 'i16':
			break;

		case 'i32':
			break;

		case 'u\\d+':
			break;

		// Serialization
		case 'x':
			break;
	}
	return isFormatted;
}