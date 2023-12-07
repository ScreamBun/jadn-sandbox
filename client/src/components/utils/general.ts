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
  if (dot_ext) {
    let dot_char = dot_ext.charAt(0);
    if (dot_char == ".") {
      ext = dot_ext.slice(1);
    }
  }
  return ext;
};

export const isString = (s: any) => {
  return typeof (s) === 'string' || s instanceof String;
}

export const getTypeName = (types_to_serach: any[], name: string) => {
  let return_name = name;
  let match_count = 0;
  let dups: any[] = [];
  types_to_serach.map((type) => {

    // orig name matches
    if (name == type[0]) {
      match_count = match_count + 1;
    } else {
      // dup matches
      var lastIndex = type[0].lastIndexOf('-');

      if (lastIndex) {

        let dup_name = type[0].substr(0, lastIndex);

        if (name == dup_name) {

          let dup_num = type[0].substr(lastIndex).substring(1);

          if (dup_num && !isNaN(dup_num)) {

            dups.push(dup_num);
            match_count = match_count + 1;

          }
        }
      }
    }

  });

  if (match_count > 0) {

    if (dups.length == 0) {
      return_name = return_name + "-" + (dups.length + 1);
    } else {
      dups.sort(function (a, b) { return b - a });  // TODO: Move to utils
      let next_num = parseInt(dups[0]) + 1;
      return_name = return_name + "-" + next_num;
    }

  }

  return return_name;
}