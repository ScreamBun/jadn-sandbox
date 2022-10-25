import { invertObject, objectFromTuple, safeGet } from '../../../../../utils';

// Interfaces
export type Val = [k: string, v: any];
export type OptionChange = (v: Val, t: 'field'|'type') => void;

// Consts
export const OptionTypes: Record<string, Array<string>> = {
  field: [
    'minc',
    'maxc',
    'tagid',
    'dir',
    'key',
    'link'
  ],
  type: [
    'id',
    'ktype',
    'vtype',
    'enum',
    'pointer',
    'format',
    'pattern',
    'minv',
    'maxv',
    'minf',
    'maxf',
    'unique',
    'set',
    'unordered',
    'extend',
    'default'
  ]
};

export const OptionIds: Record<string, string> = {
  // Field Structural
  '[': 'minc',        // Minimum cardinality
  ']': 'maxc',        // Maximum cardinality
  '&': 'tagid',       // Field containing an explicit tag for this Choice type
  '<': 'dir',         // Use FieldName as a qualifier for fields in FieldType
  'K': 'key',         // Field is a primary key for this type
  'L': 'link',        // Field is a relationship or link to a type instance (Extension: Section 3.3.6)
  // Type
  '=': 'id',          // Optional-Enumerated values and fields of compound types denoted by FieldID rather than FieldName
  '+': 'ktype',       // Key type for MapOf
  '*': 'vtype',       // Value type for ArrayOf and MapOf
  '#': 'enum',        // Extension: Enumerated type derived from a specified type
  '>': 'pointer',     // Extension: Enumerated type containing pointers derived from a specified type
  '/': 'format',      // Semantic validation keyword
  '%': 'pattern',     // Regular expression used to validate a String type
  '{': 'minv',        // Minimum numeric value, octet or character count, or element count
  '}': 'maxv',        // Maximum numeric value, octet or character count, or element count
  'y': 'minf',        // Minimum real number value
  'z': 'maxf',        // Maximum real number value
  'q': 'unique',      // If present, an ArrayOf instance must not contain duplicate values
  's': 'set',         // ArrayOf instance is unordered and unique
  'b': 'unordered',   // ArrayOf instance is unordered
  'X': 'extend',      // Type has an extension point where fields may be added in the future
  '!': 'default'      // Default value
};

export const BoolOpts: Array<string> = ['dir', 'extend', 'id', 'key', 'link', 'set', 'unique', 'unordered'];
export const IntegerOpts: Array<string> = ['minc', 'maxc', 'minv', 'maxv'];
export const FloatOpts: Array<string> = ['minf', 'maxf'];
export const StringOpts: Array<string> = ['default', 'enum', 'format', 'ktype', 'pattern', 'pointer', 'tagid', 'vtype'];
export const InvertedOptions = invertObject(OptionIds);
export const EnumId = InvertedOptions.enum;
export const PointerId = InvertedOptions.pointer;

export const ValidFormats: Array<string> = [
  // JSON Formats
  'date-time',              // RFC 3339 § 5.6
  'date',                   // RFC 3339 § 5.6
  'time',                   // RFC 3339 § 5.6
  'email',                  // RFC 5322 § 3.4.1
  'idn-email',              // RFC 6531, or email
  'hostname',               // RFC 1034 § 3.1
  'idn-hostname',           // RFC 5890 § 2.3.2.3, or hostname
  'ipv4',                   // RFC 2673 § 3.2 "dotted-quad"
  'ipv6',                   // RFC 4291 § 2.2 "IPv6 address"
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
  'ipv4-addr',  // Binary-JSON string containing a "dotted-quad" as specified in RFC 2673 § 3.2.
  'ipv6-addr',  // Binary-JSON string containing text representation of IPv6 address specified in RFC 4291 § 2.2
  'ipv4-net',   // Array-JSON string containing text representation of IPv4 address range specified in RFC 4632 § 3.1
  'ipv6-net'    // Array-JSON string containing text representation of IPv6 address range specified in RFC 4291 § 2.3
];

export const ValidOptions: Record<string, Array<string>> = {
  // Primitives
  Binary: ['format', 'minv', 'maxv'],
  Boolean: [],
  Integer: ['format', 'minv', 'maxv'],
  Number: ['format', 'minf', 'maxf'],
  Null: [],
  String: ['format', 'pattern', 'maxv', 'minv'],
  // Structures
  Array: ['format', 'minv', 'maxv', 'extend'],
  ArrayOf: ['vtype', 'minv', 'maxv', 'set', 'unique', 'unordered'],
  Choice: ['id', 'extend'],
  Enumerated: ['id', 'enum', 'pointer', 'extend'],
  Map: ['id', 'minv', 'maxv', 'extend'],
  MapOf: ['ktype', 'vtype', 'minv', 'maxv'],
  Record: ['minv', 'maxv', 'extend']
};

export const FieldOptions = {
  minc: {
    type: 'number',
    description: 'Minimum cardinality'
  },
  maxc: {
    type: 'number',
    description: 'Maximum cardinality'
  },
  tagid: {
    // type: ...
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
  }
};

export const TypeOptions = {
  id: {
    type: 'checkbox',
    description: 'If present, Enumerated values and fields of compound types are denoted by FieldID rather than FieldName'
  },
  vtype: {
    // TODO: change to select?
    description: 'Value type for ArrayOf and MapOf'
  },
  ktype: {
    // TODO: change to select?
    description: 'Key type for MapOf'
  },
  enum: {
    description: 'Extension: Enumerated type derived from the specified Array, Choice, Map or Record type'
  },
  pointer: {
    description: 'Extension: Enumerated type containing pointers derived from the specified Array, Choice, Map or Record type'
  },
  format: {
    description: '(optional) Semantic validation keyword'
  },
  pattern: {
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
  minv: {
    type: 'number',
    description: '(optional) Minimum numeric value, octet or character count, or element count'
  },
  maxv: {
    type: 'number',
    description: '(optional) Maximum numeric value, octet or character count, or element count'
  },
  unique: {
    type: 'checkbox',
    description: '(optional) If present, an ArrayOf instance must not contain duplicate values'
  },
  set: {
    type: 'checkbox',
    description: '(optional) If present, an ArrayOf instance is unordered and uniques'
  },
  unordered: {
    type: 'checkbox',
    description: '(optional) If present, an ArrayOf instance is unordered'
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
export const opts2obj = (opts: Array<string>): Record<string, boolean|number|string> => {
  return objectFromTuple(...opts.map<[string, boolean|number|string]|[]>(o => {
    const opt = o.slice(0, 1);
    const val = o.slice(1);
    if (opt in OptionIds) {
      const optKey = OptionIds[opt];
      return [optKey, BoolOpts.includes(optKey) ? true : val];
    }
    return [opt, val];
  }));
};

export const opts2arr = (opts: Record<string, boolean|number|string>): Array<string> => {
  const ids = invertObject(OptionIds);
  // eslint-disable-next-line array-callback-return
  return Object.keys(opts).map(opt => {
    let val = safeGet(opts, opt) as boolean|number|string;
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
