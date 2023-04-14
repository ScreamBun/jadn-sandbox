import React from 'react';
import {
  BasicField, EnumeratedField, ChoiceField, RecordField, MapField, ArrayOfField, ArrayField, MapOfField
} from './types/Types';
import {
  SchemaJADN, StandardFieldArray
} from '../../../schema/interface';
import { useAppSelector } from '../../../../../reducers';

// Interfaces
interface FieldProps {
  def: StandardFieldArray;
  optChange: (k: string, v: any, i?: number) => void;
  idx?: number;
  parent?: string;
}

// Component
const Field = (props: FieldProps) => {
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN
  const { def, idx, optChange, parent } = props;

  const parentName = parent || '';
  const typeDefs = schema.types.filter(t => t[0] === def[2]);
  var typeDef = typeDefs.length === 1 ? typeDefs[0][1] : def[2];
  const args = {
    def,
    parent: parentName,
    optChange: (k: string, v: any) => optChange(k, v, idx)
  };

  //circular dependency check: make field primitive
  if (parent && parent.split(".")[parent.split(".").length - 1] == def[1]) {
    //handle L opt in typeDef..?
    return <BasicField {...args} />;
  }

  switch (typeDef) {
    case 'Enumerated':
      return <EnumeratedField {...args} />;
    case 'Choice':
      return <ChoiceField {...args} />;
    case 'Record':
      return <RecordField {...args} />;
    case 'Map':
      return <MapField {...args} />;
    case 'MapOf':
      return <MapOfField {...args} />;
    case 'ArrayOf':
      return <ArrayOfField {...args} />;
    case 'Array':
      return <ArrayField {...args} />;
    default:
      return <BasicField {...args} />;
  }
}

export default Field;

