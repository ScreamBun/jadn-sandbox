// Field Utils
import { FieldArray, TypeArray } from '../../schema/interface';

export const isOptional = (def: TypeArray|FieldArray ) => {
  switch (def.length) {
    case 5:
      return def[3].includes('[0');
		case 4:
		  return def[2].includes('[0');
		default:
		  console.log(`default optional - ${def[0]} - ${def[1]}`);
			return false;
	}
};
