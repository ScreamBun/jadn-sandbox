
//ArrayOf
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { InfoConfig, SchemaJADN, StandardFieldArray, TypeArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';
import { opts2obj } from '../../../../schema/structure/editors/options/consts';
import { hasProperty } from '../../../../../utils';
import { merge } from 'lodash';
import { validateOptDataElem } from '../../utils';
import { $MINV } from 'components/create/consts';
import SBToggleBtn from 'components/common/SBToggleBtn';

// Interface
interface ArrayOfFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any, i?: number) => void;
  parent?: string;
  config: InfoConfig;
  children?: JSX.Element;
  value: any;
}

// ArrayOf Field Component
const ArrayOfField = (props: ArrayOfFieldProps) => {
  const { def, parent, optChange, config, children, value = [''] } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;

  var optData: Record<string, any> = {};
  const [_idx, name, type, args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');

  const [opts, setOpts] = useState<any[]>(Array.isArray(value) ? value : [value]); //track elem of vtype

  const MAX_COUNT = hasProperty(optData, 'maxv') && optData.maxv != 0 ? optData.maxv : config.$MaxElements;
  const MIN_COUNT = hasProperty(optData, 'minv') && optData.minv != 0 ? optData.minv : $MINV;

  const [count, setCount] = useState(opts ? opts.length : 1);
  const [min, setMin] = useState((count <= MIN_COUNT) || (MIN_COUNT == 0 && count == 1));
  const [max, setMax] = useState(MAX_COUNT <= count);

  const [errMsg, setErrMsg] = useState<string[]>([]);
  const [toggle, setToggle] = useState(true);

  useEffect(() => {
    setMax(MAX_COUNT <= count);
    setMin((count <= MIN_COUNT) || (MIN_COUNT == 0 && count == 1));
  }, [count])

  const addOpt = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (MAX_COUNT <= count + 1) {
      return;
    }
    // add placeholder
    const updatedOpts = [...opts, ''];
    setOpts(updatedOpts);
    setCount((count) => count + 1);
  }

  const removeOpt = (e: React.MouseEvent<HTMLButtonElement>, removedIndex: number) => {
    e.preventDefault();
    if (count - 1 <= MIN_COUNT) {
      return;
    }

    //remove from arr
    var updatedOpts = opts.filter((_opt, i) => i != removedIndex);
    setOpts(updatedOpts);

    //remove empty placeholders
    let filteredOpts = updatedOpts.filter((opt) => opt != '');

    //validate filtered data
    const errCheck = validateOptDataElem(config, optData, filteredOpts);
    setErrMsg(errCheck);

    //update data
    const updatedOptArr = Array.from(Object.values(updatedOpts));

    optChange(name, updatedOptArr);
    setCount((count) => count - 1);
  }

  const onChange = (k: string, v: any, i: number) => {
    if (Number.isNaN(v)) {
      v = undefined;
    }

    const arrKeys = msgName.split(".");
    const valKeys = k.split(".");

    if ((arrKeys.length < valKeys.length - 1) && (valKeys.length - arrKeys.length != 1)) {
      //create nested obj based on keys
      const nestedKeys = valKeys.slice(arrKeys.length + 1);
      let nestedObj = {};
      nestedKeys.reduce((obj, key, index) => {
        if (index == nestedKeys.length - 1) {
          return obj[key] = v;
        } else {
          return obj[key] = {};
        }
      }, nestedObj);

      v = nestedObj;

      //merge and update v obj at opt[i] 
      //if the old V has more items than the new value, then a value has been removed and
      //if value exists in old V and if value is null; do not merge
      if (opts.length != 0) {
        let oldV = opts[i];

        if (oldV) {
          if (typeof oldV[valKeys[valKeys.length - 1]] != 'object' && v == '') {
            v = undefined;
          } else if (typeof oldV[valKeys[valKeys.length - 1]] == 'object' && Object.keys(oldV).includes(valKeys[valKeys.length - 1])) {
            if (oldV[valKeys[valKeys.length - 1]].length >= v[valKeys[valKeys.length - 1]].length) {
              oldV[valKeys[valKeys.length - 1]] = v[valKeys[valKeys.length - 1]]; //TODO: delete
              v = oldV;
            }
          } else {
            v = merge(oldV, v);
          }
        } //if oldV is not null
      }
    } //else v is an arrayOf string

    let updatedOpts;
    if (i < opts.length) {
      //update
      updatedOpts = opts.map((data, index) => {
        if (index == i) {
          return v;
        } else {
          return data;
        }
      });
    } else {
      //add
      updatedOpts = [...opts, v];
    }
    setOpts(updatedOpts);

    //send up arrayOf data
    let filteredOpts = updatedOpts.filter((opt) => opt != '');
    const errCheck = validateOptDataElem(config, optData, filteredOpts);
    setErrMsg(errCheck);

    const updatedOptArr = Array.from(Object.values(updatedOpts));

    optChange(name, updatedOptArr);
  }

  const typeDefs: TypeArray[] = schema.types.filter(t => t[0] === type);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : []; //type is not model defined; arrayOf
  if (typeDef.length != 0) {
    optData = (opts2obj(typeDef[2]));
  } else {
    optData = (opts2obj(args));
  }
  // MUST include vtype
  // MUST NOT include more than one collection option (set, unique, or unordered).

  // if vtype is enum/pointer = derived enum
  var fieldDef;
  if (optData.vtype.startsWith("#") || optData.vtype.startsWith(">")) {
    optData.vtype = optData.vtype.slice(1);

    const arrDefs: TypeArray[] = schema.types.filter((t: any) => t[0] === optData.vtype);
    const arrDef = arrDefs.length === 1 ? arrDefs[0] : def;

    fieldDef = [0, arrDef[0].toLowerCase(), 'Enumerated', [], arrDef[arrDef.length - 1]];

  } else {
    const arrDefs: TypeArray[] = schema.types.filter((t: any) => t[0] === optData.vtype);
    const arrDef = arrDefs.length === 1 ? arrDefs[0] : optData.vtype;

    //vtype is defined
    //vtype is primitive or vtype is not found (create string field)
    // TODO? : definition not found = unresolved schema (validate JADN should have failed)
    fieldDef = arrDefs.length === 1 ? [0, arrDef[0].toLowerCase(), arrDef[0], [], arrDef[arrDef.length - 2]]
      : [0, arrDef.toLowerCase(), arrDef, [], ''];
  }

  const fields = opts.map((opt, i) => {
    return (
      <Field key={self.crypto.randomUUID()} def={fieldDef} parent={msgName} optChange={onChange} idx={i} config={config} value={opt}>
        <>
          {!min && <button
            type='button'
            className={`btn btn-danger btn-sm p-1${min ? ' disabled' : ''}`}
            onClick={(e) => removeOpt(e, i)}
          >
            <FontAwesomeIcon icon={faMinusSquare} size="lg" />
          </button>}
        </>
      </Field>
    )
  });

  const err = errMsg.map((msg, index) =>
    <div key={index}><small className='form-text' style={{ color: 'red' }}>{msg}</small></div>
  );

  return (
    <div className='form-group'>
      <div className='card'>
        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
          <div>
            <SBToggleBtn toggle={toggle} setToggle={setToggle} >
              <p className='card-title m-0'>
                {`${name}${isOptional(def) ? '' : '*'}`}
              </p>
              {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
              {err}
            </SBToggleBtn>
          </div>
          {children}
        </div>

        <div className={`card-body mx-2 ${toggle ? '' : 'collapse'}`}>
          {fields}
          {!max && <button
            type='button'
            className={`btn btn-primary btn-sm btn-block p-1${max ? ' disabled' : ''}`}
            title={`Add Field to ${name}`}
            onClick={addOpt}
          >
            <FontAwesomeIcon icon={faPlusSquare} size="lg" />
          </button>}
        </div>
      </div>
    </div>
  );
}

export default ArrayOfField;
