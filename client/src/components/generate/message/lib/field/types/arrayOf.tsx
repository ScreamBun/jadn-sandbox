
//ArrayOf
import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import Field from '..';
import { isOptional } from '../..';
import { SchemaJADN, StandardFieldArray, TypeArray } from '../../../../schema/interface';
import { opts2obj } from '../../../../schema/structure/editors/options/consts';
import { hasProperty } from '../../../../../utils';
import { useAppSelector } from '../../../../../../reducers';

// Interface
interface ArrayOfFieldProps {
  arr?: any;
  def: StandardFieldArray;
  optChange: (n: string, v: any, i?: number) => void;
  parent?: string;
}

// Component
const ArrayOfField = (props: ArrayOfFieldProps) => {
  const { def, parent, optChange } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;

  const [min, setMin] = useState(false);
  const [max, setMax] = useState(false);
  const [count, setCount] = useState(1);
  const [opts, setOpts] = useState([]);

  var optData: Record<string, any> = {};
  const [_idx, name, type, _args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');

  const addOpt = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const maxCount = hasProperty(optData, 'max') ? optData.max : 20;
    const maxBool = count < maxCount;
    setCount(maxBool ? count => count + 1 : count);
    setMax(maxBool => !maxBool);
    setOpts(opts => [...opts, undefined]);
  }

  const removeOpt = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const minCount = hasProperty(optData, 'min') ? optData.min : 0;

    const minBool = count > minCount;
    if (minBool) {
      setOpts(opts.slice(0, -1));
      const tmpOpts = opts;
      tmpOpts.pop();
      const filteredOpts = tmpOpts.filter(data => {
        return data != null;
      });
      optChange(msgName, Array.from(new Set(Object.values(filteredOpts))));
    }

    setCount(minBool ? count => count - 1 : count);
    setMin(minBool => !minBool);
  }

  const onChange = (_k: string, v: any, i: number) => {
    if (Number.isNaN(v)) {
      v = undefined;
    }
    if (i < opts.length) {
      const updatedOpts = opts.map((data, index) => {
        if (index == i) {
          return v;
        } else {
          return data;
        }
      });
      setOpts(updatedOpts);
    } else {
      setOpts(opts => [...opts, v]);
    }
    const tmpOpts = opts;
    tmpOpts[i] = v;
    const filteredOpts = tmpOpts.filter(data => {
      return data != null;
    });
    optChange(msgName, Array.from(new Set(Object.values(filteredOpts))));
  }

  const typeDefs: TypeArray[] = schema.types.filter(t => t[0] === type);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  if (typeDef) {
    optData = (opts2obj(typeDef[2]));
  }

  const arrDefs: TypeArray[] = schema.types.filter((t: any) => t[0] === optData.vtype);
  const arrDef = arrDefs.length === 1 ? arrDefs[0] : typeDef[0];

  const fieldDef = arrDefs.length === 1 ? [0, arrDef[0].toLowerCase(), arrDef[0], [], arrDef[arrDef.length - 2]]
    : [0, arrDef, 'String', [], ''];

  const fields: any[] = [];
  for (let i = 0; i < count; ++i) {
    fields.push(<Field key={i} def={fieldDef} parent={msgName} optChange={onChange} idx={i} />);
  }

  return (
    <div className='form-group'>
      <div className='card'>
        <div className='card-header p-2'>
          <h4 className='card-title m-0'>
            {`${name}${isOptional(def) ? '' : '*'}`}
          </h4>
          <Button
            color="danger"
            className={`float-right p-1${min ? ' disabled' : ''}`}
            onClick={removeOpt}
          >
            <FontAwesomeIcon icon={faMinusSquare} size="lg" />
          </Button>
          <Button
            color="primary"
            className={`float-right p-1${max ? ' disabled' : ''}`}
            onClick={addOpt}
          >
            <FontAwesomeIcon icon={faPlusSquare} size="lg" />
          </Button>
          {comment ? <small className='card-subtitle text-muted'>{comment}</small> : ''}
        </div>

        <div className='card-body mx-3'>
          {fields}
        </div>
      </div>
    </div>
  );
}

export default ArrayOfField;
