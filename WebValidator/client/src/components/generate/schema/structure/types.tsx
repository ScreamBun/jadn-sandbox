import React from 'react';
import { PrimitiveEditor, StructureEditor } from './editors';
import { PrimitiveDef, StructureDef } from './interfaces';
import { StandardTypeArray } from '../interface';

interface EditorProps {
  key?: number|string|undefined;  // eslint-disable-line react/require-default-props
  dataIndex: number;
  value: StandardTypeArray;
  change?: (v: string|Record<string, any>, i: number) => void;  // eslint-disable-line react/require-default-props
  remove?: (i: number) => void;  // eslint-disable-line react/require-default-props
}

const typeDef = (props: StructureDef) => {
  const {
    name = '',
    type = '',
    options = [],
    comment = '',
    fields = []
  } = props;
  return [name, type, options, comment, fields];
};

const primDef = (props: PrimitiveDef) => {
  const {
    name = '',
    type = '',
    options = [],
    comment = ''
  } = props;
  return [name, type, options, comment];
};

// JADN Types Structure
export default {
  // Structured Types
  record: {
    key: 'Record',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'Record' }),
    editor: (props: EditorProps) => <StructureEditor { ...props } />,
    type: 'structure'
  },
  enumerated: {
    key: 'Enumerated',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'Enumerated' }),
    editor: (props: EditorProps) => <StructureEditor { ...props } />,
    type: 'structure'
  },
  choice: {
    key: 'Choice',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'Choice' }),
    editor: (props: EditorProps) => <StructureEditor { ...props } />,
    type: 'structure'
  },
  map: {
    key: 'Map',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'Map' }),
    editor: (props: EditorProps) => <StructureEditor { ...props } />,
    type: 'structure'
  },
  mapof: {
    key: 'MapOf',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'MapOf' }),
    editor: (props: EditorProps) => <StructureEditor { ...props } />,
    type: 'structure'
  },
  array: {
    key: 'Array',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'Array' }),
    editor: (props: EditorProps) => <StructureEditor { ...props } />,
    type: 'structure'
  },
  arrayof: {
    key: 'ArrayOf',
    edit: (props: StructureDef) => typeDef({ ...props, type: 'ArrayOf' }),
    editor: (props: EditorProps) => <StructureEditor { ...props } />,
    type: 'structure'
  },
  // Primitive Types
  binary: {
    key: 'Binary',
    edit: (props: PrimitiveDef) => primDef({ ...props, type: 'Binary' }),
    editor: (props: EditorProps) => <PrimitiveEditor { ...props } />,
    type: 'primitive'
  },
  boolean: {
    key: 'Boolean',
    edit: (props: PrimitiveDef) => primDef({ ...props, type: 'Boolean' }),
    editor: (props: EditorProps) => <PrimitiveEditor { ...props } />,
    type: 'primitive'
  },
  integer: {
    key: 'Integer',
    edit: (props: PrimitiveDef) => primDef({ ...props, type: 'Integer' }),
    editor: (props: EditorProps) => <PrimitiveEditor { ...props } />,
    type: 'primitive'
  },
  number: {
    key: 'Number',
    edit: (props: PrimitiveDef) => primDef({ ...props, type: 'Number' }),
    editor: (props: EditorProps) => <PrimitiveEditor { ...props } />,
    type: 'primitive'
  },
  // null
  string: {
    key: 'String',
    edit: (props: PrimitiveDef) => primDef({ ...props, type: 'String' }),
    editor: (props: EditorProps) => <PrimitiveEditor { ...props } />,
    type: 'primitive'
  }
};
