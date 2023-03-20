import React, { useEffect, useRef, useState } from 'react';
import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { hasProperty } from 'react-json-editor/dist/utils';
import { $MINV, $MAX_ELEMENTS } from 'components/create/consts';

// Interface
interface MapFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any) => void;
  parent?: string;
}

// Component
const MapField = (props: MapFieldProps) => {
  const { def, optChange, parent } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;

  var optData: Record<string, any> = {};
  const [_idx, name, _type, _args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]); //track elements
  const [isValid, setisValid] = useState({
    color: '',
    msg: []
  });

  const ref = useRef(true);
  useEffect(() => {
    const firstRender = ref.current;
    if (firstRender) {
      ref.current = false;
      validate(count);
    }
  });

  const onChange = (k: string, v: any) => {
    if (!data.includes(k)) {
      //add
      setData(data => [...data, k]);
      setCount(count => count + 1);
      validate(count + 1);
    } else {
      if (v == '' || v == undefined || v == null || (typeof v == 'object' && v.length == 0) || Number.isNaN(v)) {
        //remove
        setData(data => data.filter((elem) => {
          return elem != k;
        }));
        setCount(count => count - 1);
        validate(count - 1);
      }//else value is updated
    }
    optChange(k, v);
  }

  const typeDefs = schema.types.filter(t => t[0] === def[2]);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];

  if (typeDef) {
    optData = (opts2obj(typeDef[2]));
    //TODO type opts: extend
    console.log(optData)
  }

  //if extend
  console.log(typeDef)
  console.log(typeDef[typeDef.length - 1])

  //Expected: fields (typeDef.length  == 5)
  const fieldDef = typeDef[typeDef.length - 1].map((d: any) => <Field key={hasProperty(optData, 'id') && optData.id ? d[0] : d[1]} def={d} parent={msgName} optChange={onChange} />)

  const validate = (count: number) => {
    //check # of elements in record
    let valc = '';
    let valm = [];
    if (optData) {
      if (hasProperty(optData, 'minv')) {
        if (count < optData.minv) {
          valc = 'red';
          valm.push('Minv Error: must include at least ' + optData.minv + ' element(s)');
        }
      } else {
        optData.minv = $MINV;
        if (count < optData.minv) {
          valc = 'red';
          valm.push('Minv Error: must include at least ' + optData.minv + ' element(s)');
        }
      }
      if (hasProperty(optData, 'maxv')) {
        if (count > optData.maxv) {
          valc = 'red';
          valm.push('Maxv Error: must not include more than ' + optData.maxv + ' element(s)');
        }
      } else {
        optData.maxv = $MAX_ELEMENTS;
        if (count > optData.maxv) {
          valc = 'red';
          valm.push('Maxv Error: must not include more than ' + optData.maxv + ' element(s)');
        }
      }
    }
    setisValid({ color: valc, msg: valm });
  }

  let err: any[] = [];
  (isValid.msg).forEach(msg => {
    err.push(<div><small className='form-text' style={{ color: 'red' }}> {msg}</small></div>)
  });

  return (
    <div className='form-group'>
      <div className='card'>
        <div className='card-header p-2'>
          <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
          {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
          {err}
        </div>
        <div className='card-body mx-2'>
          <div className='row'>
            <div className="col my-1 px-0">
              {fieldDef}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapField;
