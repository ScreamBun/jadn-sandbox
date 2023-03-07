
//ArrayOf
import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { SchemaJADN, StandardFieldArray, TypeArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';
import { opts2obj } from '../../../../schema/structure/editors/options/consts';
import { hasProperty } from '../../../../../utils';

// Interface
interface ArrayOfFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any, i?: number) => void;
  parent?: string;
}

// ArrayOf Field Component
const ArrayOfField = (props: ArrayOfFieldProps) => {
  const { def, parent, optChange } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;

  const [min, setMin] = useState(false);
  const [max, setMax] = useState(false);
  const [count, setCount] = useState(1);
  const [opts, setOpts] = useState([]);
  const [isValid, setisValid] = useState('');

  var optData: Record<string, any> = {};
  const [_idx, name, type, _args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');

  const addOpt = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setisValid('');
    const maxCount = hasProperty(optData, 'maxv') && optData.maxv != 0 ? optData.maxv : 100;
    const maxBool = count < maxCount;
    if (!maxBool) {
      setisValid('Error: Maximum of ' + maxCount)
    }
    setCount(maxBool ? count => count + 1 : count);
    setMax(maxBool => !maxBool);
    setOpts(opts => [...opts, undefined]);
  }

  const removeOpt = (e: React.MouseEvent<HTMLButtonElement>) => {
    setisValid('');
    e.preventDefault();
    const minCount = hasProperty(optData, 'minv') ? optData.minv : 0;

    const minBool = count > minCount;
    if (minBool) {
      setOpts(opts.slice(0, -1));
      const tmpOpts = opts;
      tmpOpts.pop();
      const filteredOpts = tmpOpts.filter(data => {
        return data != null;
      });

      if (hasProperty(optData, 'unique') && optData.unique || hasProperty(optData, 'set') && optData.set) {
        optChange(msgName, Array.from(new Set(Object.values(filteredOpts))));
      } else {
        optChange(msgName, Array.from(Object.values(filteredOpts)));
      }
    } else {
      setisValid('Error: Minimum of ' + minCount)
    }

    setCount(minBool ? count => count - 1 : count);
    setMin(minBool => !minBool);
  }

  const onChange = (_k: string, v: any, i: number) => {
    if (Number.isNaN(v)) {
      v = undefined;
    }

    let updatedOpts;
    if (i < opts.length) {
      updatedOpts = opts.map((data, index) => {
        if (index == i) {
          return v;
        } else {
          return data;
        }
      });
      setOpts(updatedOpts);
    } else {
      setOpts(opts => [...opts, v]);
      updatedOpts = [...opts, v];
    }

    if (hasProperty(optData, 'unique') && optData.unique || hasProperty(optData, 'set') && optData.set) {
      optChange(msgName, Array.from(new Set(Object.values(updatedOpts))));
    } else {
      optChange(msgName, Array.from(Object.values(updatedOpts)));
    }
  }

  const typeDefs: TypeArray[] = schema.types.filter(t => t[0] === type);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : def;

  if (typeDef) {
    optData = (opts2obj(typeDef[2]));
    // TODO optData : must include vtype
    // TODO optData: MUST NOT include more than one collection option (set, unique, or unordered).
    if (optData.vtype.startsWith("#") || optData.vtype.startsWith(">")) {
      optData.vtype = optData.vtype.slice(1);
    }
    //console.log(optData);
  }

  const arrDefs: TypeArray[] = schema.types.filter((t: any) => t[0] === optData.vtype);
  const arrDef = arrDefs.length === 1 ? arrDefs[0] : def;
  console.log(arrDef)

  const fieldDef = arrDefs.length === 1 ? [0, arrDef[0].toLowerCase(), arrDef[0], [], arrDef[arrDef.length - 2]]
    : [0, name, 'String', [], ''];

  const fields: any[] = [];
  for (let i = 0; i < count; ++i) {
    fields.push(<Field key={i} def={fieldDef} parent={msgName} optChange={onChange} idx={i} />);
  }

  return (
    <div className='form-group'>
      <div className='card'>
        <div className='card-header p-2'>
          <p className='card-title m-0'>
            {`${name}${isOptional(def) ? '' : '*'}`}
          </p>
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
          {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
          <div><small className='form-text' style={{ color: 'red' }}> {isValid}</small></div>
        </div>

        <div className='card-body mx-2'>
          {fields}
        </div>
      </div>
    </div>
  );
}

export default ArrayOfField;
