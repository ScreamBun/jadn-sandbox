import React, { useState } from 'react';
import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { InfoConfig, SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { validateOptDataElem } from '../../utils';
import FormattedField from './formattedField';
import { hasProperty } from 'components/utils';
import SBToggleBtn from 'components/common/SBToggleBtn';

// Interface
interface ArrayFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any) => void;
  parent?: string;
  config: InfoConfig;
  children?: JSX.Element;
  value: any;
}

// Component
const ArrayField = (props: ArrayFieldProps) => {
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN
  var optData: Record<string, any> = {};

  const { def, optChange, parent, config, children, value = [] } = props;
  const [_idx, name, _type, _args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');
  const [data, setData] = useState<string[]>(value); //track elements
  const [errMsg, setErrMsg] = useState<string[]>([]);
  const [toggle, setToggle] = useState(true);

  const onChange = (_k: string, v: any, i: number) => {
    var updatedArr;
    if (data.length - 1 < i) {
      //add 
      setData([...data, v]);
      updatedArr = [...data, v];

    } else {
      //update arr at index
      updatedArr = data.map((field, idx) => {
        if (idx === i) {
          return v;
        } else {
          return field;
        }
      });
      setData(updatedArr);
    }
    //remove empty fields?
    const errCheck = validateOptDataElem(config, optData, updatedArr, optData.format ? true : false);
    setErrMsg(errCheck);

    optChange(name, updatedArr);
  }

  const typeDefs = schema.types.filter(t => t[0] === def[2]);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  if (typeDef.length != 0) {
    optData = (opts2obj(typeDef[2]));
  }

  const err = errMsg.map((msg, index) =>
    <div key={index}><small className='form-text' style={{ color: 'red' }}>{msg}</small></div>
  );

  if (hasProperty(optData, 'format')) {
    return (<FormattedField
      basicProps={props} optData={optData} config={config}
      errMsg={errMsg} setErrMsg={setErrMsg}
    />);
  }

  //Expected: fields (typeDef.length  == 5)
  let fieldDef;
  if (Array.isArray(typeDef[typeDef.length - 1]) && typeDef[typeDef.length - 1].length != 0) {
    fieldDef = typeDef[typeDef.length - 1].map((d: any, i: number) =>
      <Field key={d[0]} def={d} parent={msgName} optChange={onChange} idx={i} config={config} value={data[i]} />
    )
  } else {
    <div className='p-2'> No Fields </div>
  }


  return (
    <div className='form-group'>
      <div className='card'>
        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
          <div>
            <SBToggleBtn toggle={toggle} setToggle={setToggle} >
              <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
              {comment ? <small className='card-subtitle form-text text-muted text-wrap'>{comment}</small> : ''}
              {err}
            </SBToggleBtn>
          </div>
          {children}
        </div>

        <div className={`card-body mx-2 ${toggle ? '' : 'collapse'}`}>
          {fieldDef}
        </div>
      </div>
    </div>
  );
}

export default ArrayField;
