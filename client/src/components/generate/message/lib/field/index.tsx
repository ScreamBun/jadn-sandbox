import React from 'react';
import { FormText } from 'reactstrap';

import {
  BasicField, EnumeratedField, ChoiceField, RecordField, MapField, ArrayOfField, ArrayField
} from './types';
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
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  // console.log(parentName, def);
  const args = {
    def,
    parent: parentName,
    optChange: (k: string, v: any) => optChange(k, v, idx)
  };

  switch (typeDef[1]) {
    case 'Enumerated':
      return <EnumeratedField {...args} />;
    case 'Choice':
      return <ChoiceField {...args} />;
    case 'Record':
      return <RecordField {...args} />;
    case 'Map':
      return <MapField {...args} />;
    case 'MapOf':
      //TODO: FIX
      const [arr] = def;
      // eslint-disable-next-line react/jsx-one-expression-per-line
      return <FormText>MapOf: {arr}</FormText>;
    case 'ArrayOf':
      return <ArrayOfField {...args} />;
    case 'Array':
      return <ArrayField {...args} />;
    default:
      return <BasicField {...args} />;
  }
}

export default Field;

