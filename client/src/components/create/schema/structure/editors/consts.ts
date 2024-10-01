// Editor Constants
import {
  EnumeratedFieldKey, FieldArray, PrimitiveTypeArray, StandardFieldArray, StandardFieldKey, StandardTypeArray, TypeKey
} from '../../interface';
import { zip } from '../../../../utils';

// Interfaces
// Fields
export interface EnumeratedFieldObject {
  id: number;
  value: number | string;
  comment: string;
}
export interface StandardFieldObject {
  id: number;
  name: string;
  type: string;
  options: Array<string>;
  comment: string;
}
export type FieldObject = EnumeratedFieldObject | StandardFieldObject;

// Structures
export interface PrimitiveTypeObject {
  name: string;
  type: string;
  options: Array<string>;
  comment: string;
}
export interface StandardTypeObject extends PrimitiveTypeObject {
  fields: Array<FieldObject>;
}
export type TypeObject = PrimitiveTypeObject | StandardTypeObject


// Consts
export const TypeKeys: Array<TypeKey> = ['name', 'type', 'options', 'comment', 'fields'];
export const StandardFieldKeys: Array<StandardFieldKey> = ['id', 'name', 'type', 'options', 'comment'];
export const EnumeratedFieldKeys: Array<EnumeratedFieldKey> = ['id', 'value', 'comment'];
export const ConfigOptions = {
  // $MaxBinary - Integer{1..*} optional
  $MaxBinary: {
    type: 'number',
    description: 'Schema default maximum number of octets'
  },
  // $MaxString - Integer{1..*} optional,
  $MaxString: {
    type: 'number',
    description: 'Schema default maximum number of characters'
  },
  // $MaxElements - Integer{1..*} optional,
  $MaxElements: {
    type: 'number',
    description: 'Schema default maximum number of items/properties'
  },
  // $FS - String{1..1} optional,
  /*   $FS: {
      description: 'Field Separator character used in pathnames'
    }, */
  // $Sys - String{1..1} optional,
  $Sys: {
    description: 'System character for TypeName'
  },
  // $TypeName - String{1..127} optional,
  $TypeName: {
    description: 'TypeName regex'
  },
  // $FieldName - String{1..127} optional,
  $FieldName: {
    description: 'FieldName regex'
  },
  // $NSID - String{1..127} optional
  $NSID: {
    description: 'Namespace Identifier regex'
  }
};

// Helper Functions
export const FieldArr2Object = (values: FieldArray): FieldObject => {
  if (values.length === StandardFieldKeys.length) {
    return zip(StandardFieldKeys, values) as StandardFieldObject;
  }
  if (values.length === EnumeratedFieldKeys.length) {
    return zip(EnumeratedFieldKeys, values) as EnumeratedFieldObject;
  }
  throw new Error('Cannot create Field object, array shoud contain 3 or 5 values');
};

export const TypeArr2Object = (values: PrimitiveTypeArray | StandardTypeArray): TypeObject => {
  let obj: Record<string, any> = {};
  if (values.length >= 4 && values.length <= 5) {
    obj = zip(TypeKeys, values);
  } else {
    throw new Error('Cannot create Type object, array shoud contain 3 or 5 values');
  }
  obj.fields = (obj.fields || []).map((f: FieldArray) => FieldArr2Object(f));
  return obj as TypeObject;
};

// IPv Formats
export const ipv4_net_format = "/ipv4-net"
export const ipv6_net_format = "/ipv6-net"

// IPv JADN Fields
export const ipv4_net_address: StandardFieldArray = [1, "ipv4_addr", "Binary", ["/ipv4-addr", "{1", "[1"], "IPv4 address as defined in [[RFC0791]](#rfc0791)"]; 
export const ipv4_net_prefix_len: StandardFieldArray = [2, "prefix_length", "Integer", ["{0", "}32", "[0"], "CIDR prefix-length. If omitted, refers to a single host address."]; 
export const ipv6_net_address: StandardFieldArray = [1, "ipv6_addr", "Binary", ["/ipv6-addr", "{1", "[1"], "IPv6 address as defined in [[RFC8200]](#rfc8200)"];
export const ipv6_net_prefix_len: StandardFieldArray = [2, "prefix_length", "Integer", ["{0", "}128", "[0"], "CIDR prefix-length. If omitted, refers to a single host address."];