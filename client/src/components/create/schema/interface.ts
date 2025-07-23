// TODO: properly type schema

// Info
export interface InfoConfig {
  $MaxBinary?: number;
  $MaxString?: number;
  $MaxElements?: number;
  //$FS?: string;
  $Sys?: string;
  $TypeName?: string;
  $FieldName?: string;
  $NSID?: string;
}

export interface Meta {
  package: string;
  version?: string;
  title?: string;
  description?: string;
  comment?: string;
  copyright?:string;
  license?: string;
  roots?: Array<string>;
  config?: InfoConfig;
}

// Fields
// Standard Field
export type StandardFieldKey = 'id' | 'name' | 'type' | 'options' | 'comment';
export type StandardFieldArray = [number, string, string, Array<string>, string]
// Enumerated Field - [id, value, comment]
export type EnumeratedFieldKey = 'id' | 'value' | 'comment';
export type EnumeratedFieldArray = [number, number|string, string]
// General Field
export type FieldArray = StandardFieldArray | EnumeratedFieldArray;
export type ArrayFieldKey = 'name' | 'type' | 'options' | 'comment' | 'children';
export type ArrayFieldArray = [string, string, Array<string>, string, Array<StandardFieldArray>];

export type AllFieldArray = StandardFieldArray | ArrayFieldArray | EnumeratedFieldArray;

// Types
// Standard Type
export type TypeKey = 'name' | 'type' | 'options' | 'comment' | 'fields';
export type StandardTypeArray = [string, string, Array<string>, string, Array<StandardFieldArray>|Array<EnumeratedFieldArray>]
// Custom Type - keys same as TypeKeys, no fields --> use for primitive, arrayOf, mapOf type
export type PrimitiveTypeArray = [string, string, Array<string>, string]
// General Type
export type TypeArray = PrimitiveTypeArray|StandardTypeArray

// Schema
export interface SchemaJADN {
  meta?: Meta;
  types: Array<TypeArray>;
}