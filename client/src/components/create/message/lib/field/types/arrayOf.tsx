
//ArrayOf
import React, { useState } from 'react';
import { Button } from 'reactstrap';
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
}

// ArrayOf Field Component
const ArrayOfField = (props: ArrayOfFieldProps) => {
  const { def, parent, optChange, config } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;

  const [count, setCount] = useState(1);
  const [min, setMin] = useState(false);
  const [max, setMax] = useState(false);
  const [opts, setOpts] = useState<any[]>([]); //track elem of vtype
  const [errMsg, setErrMsg] = useState<string[]>([]);
  const [toggle, setToggle] = useState(true);

  var optData: Record<string, any> = {};
  const [_idx, name, type, args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');

  const addOpt = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    //check if max fields has been created
    const maxCount = hasProperty(optData, 'maxv') && optData.maxv != 0 ? optData.maxv : config.$MaxElements;
    setMax(maxCount <= count);
    if (maxCount <= count) {
      return;
    }
    // const updatedOpts = [...opts, ''];
    //setOpts(updatedOpts);
    setCount(count + 1);
  }

  const removeOpt = (removedIndex: number) => {
    //e.preventDefault();
    //check if min fields exist
    const minCount = hasProperty(optData, 'minv') && optData.minv != 0 ? optData.minv : $MINV;
    setMin(count <= minCount);
    if (count <= minCount) {
      return;
    }
    //remove from arr
    var updatedOpts = opts.splice(removedIndex, 0);

    setOpts(updatedOpts);

    //validate data
    const errCheck = validateOptDataElem(config, optData, updatedOpts);
    setErrMsg(errCheck);

    //update data
    if (hasProperty(optData, 'unique') && optData.unique || hasProperty(optData, 'set') && optData.set) {
      updatedOpts = Array.from(new Set(Object.values(updatedOpts)));
    } else {
      updatedOpts = Array.from(Object.values(updatedOpts));
    }

    optChange(msgName, updatedOpts);
    setCount(count - 1);
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
    const errCheck = validateOptDataElem(config, optData, updatedOpts);
    setErrMsg(errCheck);

    if (hasProperty(optData, 'unique') && optData.unique || hasProperty(optData, 'set') && optData.set) {
      updatedOpts = Array.from(new Set(Object.values(updatedOpts)));
    } else {
      updatedOpts = Array.from(Object.values(updatedOpts));
    }

    optChange(msgName, updatedOpts);
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

  const fields: any[] = [];
  for (let i = 0; i < count; ++i) {
    fields.push(
      <div key={i}>
        <Field key={i} def={fieldDef} parent={msgName} optChange={onChange} idx={i} config={config} />

        <Button
          color="danger"
          className={`float-right p-1${min ? ' disabled' : ''}`}
          onClick={() => removeOpt(i)}
        >
          <FontAwesomeIcon icon={faMinusSquare} size="lg" />
        </Button>

      </div>
    );
  }

  const err = errMsg.map((msg, index) =>
    <div key={index}><small className='form-text' style={{ color: 'red' }}>{msg}</small></div>
  );

  return (
    <div className='form-group'>
      <div className='card border-secondary'>
        <div className='card-header p-2'>
          <SBToggleBtn toggle={toggle} setToggle={setToggle} >
            <p className='card-title m-0'>
              {`${name}${isOptional(def) ? '' : '*'}`}
            </p>
            {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
            {err}
          </SBToggleBtn>
        </div>

        <div className={`card-body mx-2 ${toggle ? '' : 'collapse'}`}>
          {fields}
          <Button
            color="primary"
            className={`btn-block p-1${max ? ' disabled' : ''}`}
            title='Add Field'
            onClick={addOpt}
          >
            <FontAwesomeIcon icon={faPlusSquare} size="lg" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ArrayOfField;
