// Object utility functions

/**
 * Check is object has property
 * @param {Record<string, any>} obj - object to check against
 * @param {string} prop - property to check for
 * @returns {boolean} object contains property or not
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hasProperty = (obj: Record<string, any>, prop: string): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, prop) || prop in obj;
};

/**
 * Object.values alternative for compatibility
 * @param {Record<string, ValType>} obj - Object to return the values of
 * @returns {Array<ValType>} values of the given object
 * @public
 */
 export const objectValues = <ValType>(obj: Record<string, ValType>): Array<ValType> => {
  return Object.keys(obj).map(k => obj[k]);
};

/**
 * SafeGet a property from an object
 * @param {Record<string, any>} obj - Object to attempt to get a property from
 * @param {string} key - property name to get value of
 * @param {any} def - default value of not value for the property exists - default of null
 * @return {any} value of the property or default value given/null
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const safeGet = (obj: Record<string, any>, key: string, def?: any): any => {
  // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unsafe-assignment
  def = def === null ? null : def;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const val = obj[key];
  if (hasProperty(obj, key)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return val === null || val === undefined ? def : val;
  }
  if (key in obj) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return val === null || val === undefined ? def : val;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return def;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KeyFun = (val: any) => string;
/**
 * Invert an objects key/values
 * @param {Record<string, ValType>} obj - object to invert
 * @param {KeyFun} fun - function to execute on the vlue prior to being used as a key
 * @returns {Record<string, any>} inverted object
 * @public
 */
export const invertObject = <ValType>(obj: Record<string, ValType>, fun?: KeyFun): Record<string, string> => {
  const inverted: Record<string, string> = {};
  Object.keys(obj).forEach(key => {
    const val = fun ? fun(obj[key]) : String(obj[key]);
    inverted[val] = key;
  });

  return inverted;
};

/**
 * Create an object from the given array of tuples
 * @param {Array<[number|string, ValType]|[]>} tuples - tuples to create an object from
 * @returns {Record<number|string, ValType>} creted object
 * @public
 */
 export const objectFromTuple = <ValType>(...tuples: Array<[number|string, ValType]|[]>): Record<number|string, ValType> => {
  const tuplesFiltered: Array<[number|string, ValType]> = tuples.filter(t => t.length === 2) as Array<[number|string, ValType]>;

  return tuplesFiltered.reduce((acc: Record<string|number, ValType>, [key, value]) =>{
    acc[key] = value;
    return acc;
  }, {});
};