import vkbeautify from 'vkbeautify';
import { cbor2escaped, escaped2cbor } from './cbor';

/* General Utils */
export const format = (msg: string, fmt: string, ind?: number) => {
  const indent = ind || 2;
  let rtnMsg = '';
  try {
    switch (fmt) {
      case 'cbor':
        //TODO: FIX  CBOR pretty print
        rtnMsg = (msg);
        break;
      case 'json':
        rtnMsg = vkbeautify.json(msg, indent);
        break;
      case 'xml':
        rtnMsg = vkbeautify.xml(msg, indent);
        break;
      default:
        rtnMsg = `Error, cannot format ${fmt} message`;
    }
  } catch (e) {
    rtnMsg = `Error, cannot format: ${(e as Error).message}`;
  }
  return rtnMsg;
};

export const minify = (msg: string, fmt: string) => {
  let rtnMsg = '';
  try {
    switch (fmt) {
      case 'cbor':
        rtnMsg = escaped2cbor(msg);
        break;
      case 'json':
        rtnMsg = vkbeautify.jsonmin(msg);
        break;
      case 'xml':
        rtnMsg = vkbeautify.xmlmin(msg);
        break;
      default:
        rtnMsg = `Error, cannot minify ${fmt} message`;
    }
  } catch (e) {
    rtnMsg = `Error, cannot minify: ${(e as Error).message}`;
  }
  return rtnMsg;
};

/* Schema Utils */
/**
 * Properly format a JADN schema
 * @param {number|string|Array<any>|Record<string, any>} schema Schema to format
 * @param {number} indent spaces to indent, default of 2
 * @param {number} _level current indent level, default of 0
 * @return {string} Formatted JADN schema
 */
export const FormatJADN = (schema: number | string | Array<any> | Record<string, any>, indent = 2, _level = 0): string => {
  if (['number', 'string', 'boolean'].includes(typeof (schema))) {
    return JSON.stringify(schema);
  }
  const spaceCount = (indent % 2 === 1 ? indent - 1 : indent) + (_level * 2);
  const ind = ' '.repeat(spaceCount);
  const indE = ' '.repeat(spaceCount - 2);

  if (typeof (schema) === 'object') {
    if (Array.isArray(schema)) {
      const nested = schema && Array.isArray(schema[0]);  // Not an empty list
      const lvl = schema && Array.isArray(schema[-1]) ? _level : _level + 1;
      const lines = schema.map(val => FormatJADN(val, indent, lvl));
      if (nested) {
        return `[\n${ind}${lines.join(`,\n${ind}`)}\n${indE}]`;
      }
      return `[${lines.join(', ')}]`;
    }
    const lines = Object.keys(schema).map(k => `${ind}"${k}": ${FormatJADN(schema[k], indent, _level + 1)}`).join(',\n');
    return `{\n${lines}\n${indE}}`;
  }
  return '???';
};

/* Message Utils */