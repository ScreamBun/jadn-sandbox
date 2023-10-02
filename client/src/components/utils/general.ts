// General Utility Functions
import _ from 'lodash';
import { objectFromTuple } from './object';

/**
 * Split and space a camelcased string
 * @param {string} str - camelcase string to split
 * @returns {string} - split and spaced string
 */
export const splitCamel = (str: string): string => str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

/**
 * Create an object using the given arrays
 * @param {Array<string>} keys - Array to use as keys
 * @param {Array<any>} values - Array to use as values
 * @returns {Record<string, any>} Object created from the given arrays
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const zip = (keys: Array<string>, values: Array<any>): Record<string, any> => {
  if (keys.length < values.length) {
    // console.log('Zip', keys, values);
    console.error(keys, values)
    throw new RangeError('The keys arrays should have the same or more values than the value array');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return objectFromTuple(
    ...values.map<[string, any]>((v: any, i: number) => [keys[i], v])
  );
};

export const isArrayEqual = (x: [], y: []) => {
  return _(x).differenceWith(y, _.isEqual).isEmpty();
};

export const getIndex = (arr: [], field: string) => {
  return arr.findIndex((obj: any) => obj.field === field);
};

export const getFilenameOnly = (full_name: string) => {
  const lastIndex = full_name.lastIndexOf('.');
  const name_only = full_name.substring(0, lastIndex);
  return name_only;
};

export const getFilenameExt = (full_name: string) => {
  const lastIndex = full_name.lastIndexOf('.');
  const dot_ext = full_name.substring(lastIndex);
  let ext = null;
  if(dot_ext){
    let dot_char = dot_ext.charAt(0);
    if(dot_char == "."){
      ext = dot_ext.slice(1);
    }
  }
  return ext;
};

export const isString = (s: any) => {
  return typeof (s) === 'string' || s instanceof String;
}

