import { invertObject, objectFromTuple, safeGet } from '../../../../../utils';

// Interfaces
export type Val = [k: string, v: any];
export type OptionChange = (v: Val, t: 'field' | 'type') => void;

// Consts
export const TypeOptions = {
  'id': '=',         // Enumerated type and Choice/Map/Record keys are ID not Name
  'vtype': '*',      // Value type for ArrayOf and MapOf
  'ktype': '+',      // Key type for MapOf
  'enum': '#',       // enumeration derived from Array/Choice/Map/Record type
  'pointer': '>',    // enumeration of pointers derived from Array/Choice/Map/Record type
  'format': '/',     // semantic validation keyword, may affect serialization
  'pattern': '%',    // regular expression that a string must match
  'minInclusive': 'w',       // minimum inclusive value
  'maxInclusive': 'x',       // maximum inclusive value
  'minExclusive': 'y',       // minimum exclusive value
  'maxExclusive': 'z',       // maximum exclusive value
  'minLength': '{',       // minimum byte or text string length, Integer value, element count
  'maxLength': '}',       // maximum byte or text string length, Integer value, element count
  'unique': 'q',     // ArrayOf instance must not contain duplicates
  'set': 's',        // ArrayOf instance is unordered and unique
  'unordered': 'b',  // ArrayOf instance is unordered and not unique (bag)
  'seq': 'o',        // Map, MapOf, or Record instance is ordered and unique
  'combine': 'C',    // Choice is an untagged union, a logical combination of types
  'extend': 'X',     // Type has an extension point where fields may be appended
  'default': '!'     // Default value
};

export const FieldOptions = {
  'minOccurs': '[',   // minimum cardinality, default = 1, 0 = field is optional
  'maxOccurs': ']',   // maximum cardinality, default = 1, 0 = inherited max, not 1 = array
  'tagid': '&',  // field that specifies the type of this field
  'dir': '<',    // pointer enumeration treats field as a collection
  'key': 'K',    // field is a primary key for this type
  'link': 'L',    // field is a link (foreign key) to an instance of FieldType
  'attr': '/attr' // field is an attribute
};

export const OptionTypes = {
  field: Object.keys(FieldOptions),
  type: Object.keys(TypeOptions)
};

export const OptionIds = invertObject({ ...FieldOptions, ...TypeOptions });
export const BoolOpts = ['dir', 'key', 'link', 'id', 'unique', 'set', 'unordered', 'extend', 'attr'];
export const IntegerOpts = ['minOccurs', 'maxOccurs', 'tagid', 'minInclusive', 'maxInclusive', 'minExclusive', 'maxExclusive'];
export const FloatOpts = ['minInclusive', 'maxInclusive', 'minExclusive', 'maxExclusive'];
export const StringOpts = ['default', 'enum', 'format', 'ktype', 'pattern',  'pointer', 'tagid', 'vtype', 'minLength', 'maxLength', 'minInclusive', 'maxInclusive', 'minExclusive', 'maxExclusive'];
export const EnumId = TypeOptions.enum;
export const PointerId = TypeOptions.pointer;

// TODO: Use BT format_options
/* export const ValidFormats: Array<string> = [
  // JSON Formats
  'date-time',              // RFC 3339 § 5.6
  'date',                   // RFC 3339 § 5.6
  'time',                   // RFC 3339 § 5.6
  'email',                  // RFC 5322 § 3.4.1
  'idn-email',              // RFC 6531, or email
  'hostname',               // RFC 1034 § 3.1
  'idn-hostname',           // RFC 5890 § 2.3.2.3, or hostname
  'ipv4',                   // RFC 2673 § 3.2 'dotted-quad'
  'ipv6',                   // RFC 4291 § 2.2 'IPv6 address'
  'uri',                    // RFC 3986
  'uri-reference',          // RFC 3986, or uri
  'iri',                    // RFC 3987
  'iri-reference',          // RFC 3987
  'uri-template',           // RFC 6570
  'json-pointer',           // RFC 6901 § 5
  'relative-json-pointer',  // JSONP
  'regex',                  // ECMA 262
  // JADN Formats
  'eui',        // IEEE Extended Unique Identifier (MAC Address), EUI-48 or EUI-64 specified in EUI
  'ipv4-addr',  // IPv4 address as specified in RFC 791 § 3.1
  'ipv6-addr',  // IPv6 address as specified in RFC 8200 § 3
  'ipv4-net',   // Binary IPv4 address and Integer prefix length as specified in RFC 4632 §3.1
  'ipv6-net',   // Binary IPv6 address and Integer prefix length as specified in RFC 4291 §2.3
  'i8',         // Signed 8 bit integer, value must be between -128 and 127
  'i16',        // Signed 16 bit integer, value must be between -32768 and 32767.
  'i32',        // Signed 32 bit integer, value must be between ... and ...
  'u\\d+',       // Unsigned integer or bit field of <n> bits, value must be between 0 and 2^<n> - 1
  // Serialization
  'x',          // Binary-JSON string containing Base16 (hex) encoding of a binary value as defined in RFC 4648 § 8
  'ipv4-addr',  // Binary-JSON string containing a 'dotted-quad' as specified in RFC 2673 § 3.2.
  'ipv6-addr',  // Binary-JSON string containing text representation of IPv6 address specified in RFC 4291 § 2.2
  'ipv4-net',   // Array-JSON string containing text representation of IPv4 address range specified in RFC 4632 § 3.1
  'ipv6-net'    // Array-JSON string containing text representation of IPv6 address range specified in RFC 4291 § 2.3
]; */

export const RequiredOptions: Record<string, Array<string>> = {
  // Primitives
  Binary: [],
  Boolean: [],
  Integer: [],
  Number: [],
  String: [],
  // Structures
  Array: [],
  ArrayOf: ['vtype'],
  Choice: [],
  Enumerated: [],
  Map: [],
  MapOf: ['ktype', 'vtype'],
  Record: []
};

export const ValidOptions: Record<string, Array<string>> = {
  // Primitives
  Binary: ['format', 'minLength', 'maxLength'],
  Boolean: [],
  Integer: ['format', 'minInclusive', 'maxInclusive', 'minExclusive', 'maxExclusive'],
  Number: ['format', 'minInclusive', 'maxInclusive', 'minExclusive', 'maxExclusive'],
  String: ['format', 'minLength', 'maxLength', 'minInclusive', 'maxInclusive', 'minExclusive', 'maxExclusive', 'pattern'],
  // Structures
  Array: ['extend', 'format', 'minLength', 'maxLength'],
  ArrayOf: ['vtype', 'minLength', 'maxLength', 'unique', 'set', 'unordered'], //MUST NOT include more than one collection option (set, unique, or unordered)
  Choice: ['id', 'extend', 'combine'],
  Enumerated: ['id', 'enum', 'pointer', 'extend'],
  Map: ['id', 'extend', 'minLength', 'maxLength', 'seq'],
  MapOf: ['ktype', 'vtype', 'minLength', 'maxLength', 'seq'],
  Record: ['extend', 'minLength', 'maxLength', 'seq']
};

export const FieldOptionInputArgs: { [key: string]: any } = {
  minOccurs: {
    type: 'number',
    description: 'Minimum cardinality'
  },
  maxOccurs: {
    type: 'number',
    description: 'Maximum cardinality'
  },
  tagid: {
    // type: Enumerated
    description: 'Field containing an explicit tag for this Choice type'
  },
  dir: {
    type: 'checkbox',
    description: 'Use FieldName as a qualifier for fields in FieldType'
  },
  key: {
    type: 'checkbox',
    description: 'Field is a primary key for this type'
  },
  link: {
    type: 'checkbox',
    description: 'Field is a relationship link to a type instance'
  },
  attr: {
    type: 'checkbox',
    description: 'Field is an attribute'
  }
};

export const TypeOptionInputArgs = {
  id: {
    type: 'checkbox',
    description: 'If present, Enumerated values and fields of compound types are denoted by FieldID rather than FieldName'
  },
  vtype: {
    type: 'SBCreatableSelect',
    description: 'Value type for ArrayOf and MapOf. It may be any JADN type or Defined type.'
  },
  ktype: {
    type: 'SBCreatableSelect',
    description: 'Key type for MapOf. ktype SHOULD be a Defined type, either an enumeration or a type with constraints such as a pattern or semantic valuation keyword that specify a fixed subset of values that belong to a category'
  },
  enum: {
    type: 'SBCreatableSelect',
    description: 'Extension: Enumerated type derived from the specified Array, Choice, Map or Record type'
  },
  pointer: {
    type: 'SBCreatableSelect',
    description: 'Extension: Enumerated type containing pointers derived from the specified Array, Choice, Map or Record type'
  },
  format: {
    type: 'SBSelect',
    description: '(optional) Semantic validation keyword'
  },
  pattern: {
    type: 'WithRegex',
    description: '(optional) Regular expression used to validate a String type'
  },
  minf: {
    type: 'number',
    description: '(optional) Minimum real number value'
  },
  maxf: {
    type: 'number',
    description: '(optional) Maximum real number value'
  },
  minLength: {
    type: 'number',
    description: '(optional) Minimum length, octet or character count, or element count'
  },
  maxLength: {
    type: 'number',
    description: '(optional) Maximum length, octet or character count, or element count'
  },
  minInclusive: {
    type: 'number',
    description: '(optional) Minimum inclusive value'
  },
  maxInclusive: {
    type: 'number',
    description: '(optional) Maximum inclusive value'
  },
  minExclusive: {
    type: 'number',
    description: '(optional) Minimum exclusive value'
  },
  maxExclusive: {
    type: 'number',
    description: '(optional) Maximum exclusive value'
  },
  unique: {
    type: 'checkbox',
    description: '(optional) If present, an ArrayOf instance must not contain duplicate values'
  },
  set: {
    type: 'checkbox',
    description: '(optional) If present, an ArrayOf instance is unordered and unique'
  },
  unordered: {
    type: 'checkbox',
    description: '(optional) If present, an ArrayOf instance is unordered'
  },
  seq: {
    type: 'checkbox',
    description: '(optional) If present, a Map, MapOf, or Record instance is ordered and unique'
  },
  combine: {
    type: 'SBSelect',
    description: '(optional) If present, a Choice instance is an untagged union, a logical combination of types'
  },
  extend: {
    type: 'checkbox',
    description: '(optional) Type has an extension point where fields may be added'
  },
  default: {
    type: 'checkbox',
    description: '(optional) Default value'
  }
};

// Helper Functions
export const opts2obj = (opts: Array<string>): Record<string, boolean | number | string> => {
  return objectFromTuple(...opts.map<[string, boolean | number | string] | []>(o => {
    const opt = o.slice(0, 1);
    let val = o.slice(1);

    if (opt in OptionIds) {
      const optKey = OptionIds[opt];
      return [optKey, BoolOpts.includes(optKey) ? true : val];
    }
    return [opt, val];
  }));
};

export const opts2arr = (opts: Record<string, boolean | number | string>): Array<string> => {
  const ids = invertObject(OptionIds);
  // eslint-disable-next-line array-callback-return
  return Object.keys(opts).map(opt => {
    let val = safeGet(opts, opt) as boolean | number | string;
    if (val !== null && val !== undefined) {
      if (opt === 'vtype') {
        val = val as string;
        val = val.startsWith('_Enum') ? val.replace('_Enum-', EnumId) : val;
        val = val.endsWith('$Enum') ? `${EnumId}${val.replace('$Enum', '')}` : val;
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return `${ids[opt]}${BoolOpts.includes(opt) ? '' : val}`;
    }
    return '';
  }).filter(t => t.length > 0);
};
