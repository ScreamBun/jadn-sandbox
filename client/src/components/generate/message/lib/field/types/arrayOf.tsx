
//ArrayOf
import React, { useState, useEffect } from 'react';
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
  const { def, parent } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;

  const [min, setMin] = useState(false);
  const [max, setMax] = useState(false);
  const [count, setCount] = useState(1);
  const [opts, setOpts] = useState({});

  var optData: Record<string, any> = {};
  const [_idx, name, type, _args, comment] = def;

  useEffect(() => {
    const { optChange } = props;
    optChange(msgName, Array.from(new Set(Object.values(opts))));
  })

  const addOpt = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const maxCount = hasProperty(optData, 'max') ? optData.max : 20;
    const maxBool = count < maxCount;
    setCount(maxBool ? count + 1 : count);
    setMax(!maxBool);
  }

  const removeOpt = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const minCount = hasProperty(optData, 'min') ? optData.min : 0;

    const minBool = count > minCount;
    if (minBool) {
      delete opts[Math.max.apply(Math, Object.keys(opts))];
    }

    setCount(minBool ? count - 1 : count);
    setMin(!minBool);
    setOpts(opts);
  }

  const optChange = (_k: string, v: any, i: number) => {
    setOpts({ ...opts, [i]: v })
  }

  const msgName = (parent ? [parent, name] : [name]).join('.');
  const typeDefs: TypeArray[] = schema.types.filter(t => t[0] === type);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  if (typeDef) {
    optData = (opts2obj(typeDef[2]));
  }

  const arrDefs: TypeArray[] = schema.types.filter((t: any) => t[0] === optData.vtype);
  const arrDef = arrDefs.length === 1 ? arrDefs[0] : arrDefs[1];

  const fieldDef = arrDefs.length === 1 ? [0, arrDef[0].toLowerCase(), arrDef[0], [], arrDef[arrDef.length - 2]]
    : [0, arrDef, 'String', [], ''];

  const fields: any[] = [];
  for (let i = 0; i < count; ++i) {
    fields.push(<Field key={i} def={fieldDef} parent={msgName} optChange={optChange} idx={i} />);
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
