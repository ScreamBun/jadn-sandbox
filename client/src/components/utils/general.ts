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

export const sbScrollToView = (id: string, name: string, el_index: number, time_to_wait: number) => {
  if(id){
    const element = document.getElementById(id);
    if(element){
      element.scrollIntoView({ block: "end" });
    }
  }

  if(name){
    const elements = document.getElementsByName(name);

    let element: HTMLElement | null = null;
    if(elements && el_index){
      if(el_index <= elements.length - 1){
        element = elements[el_index];
      } else {
        element = elements[0];
      }
    }

    if(element != null && element instanceof HTMLElement){

      // To make this work with many rerenders we need to wait
      // a little while before scrolling...
      // console.log("starting wait....");
      setTimeout(() => {
        // console.log("done waiting ***");
        element.scrollIntoView({ block: "end" });
      }, time_to_wait);

    }    
  }

};

