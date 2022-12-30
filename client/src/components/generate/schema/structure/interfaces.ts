// Meta Interfaces
export interface InfoDef {
  k: string;
  v: string|Array<string>|Record<string, string>;
}

// Type Interfaces
export interface PrimitiveDef {
  name: string;
  type: string;
  options: Array<string>;
  comment: string;
}

export interface StructureDef {
  name: string;
  type: string;
  options: Array<string>;
  comment: string;
  fields?: Array<Array<number|string>>;
}