import React, { useState } from 'react';
import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { InfoConfig, SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { validateOptDataElem } from '../../utils';
import SBToggleBtn from 'components/common/SBToggleBtn';

// Interface
interface RecordFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any) => void;
  parent?: string;
  config: InfoConfig;
  children?: JSX.Element;
  value: any;
}

// Component
const RecordField = (props: RecordFieldProps) => {
  const { def, optChange, parent, config, children, value = {} } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
  var optData: Record<string, any> = {};

  const [_idx, name, type, _args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');
  const [data, setData] = useState(value); //track elements
  const [errMsg, setErrMsg] = useState<string[]>([]);
  const [toggle, setToggle] = useState(true);

  const onChange = (k: string, v: any) => {
    let updatedData = { ...data };
    if ((!v || (typeof v == "object" && Object.keys(v).length == 0)) && (data && k in data)) {
      delete updatedData[k]
    } else {
      updatedData = { ...data, [k]: v };
    }
    setData(updatedData);

    const validMsg = validateOptDataElem(config, optData, Object.entries(updatedData));
    setErrMsg(validMsg);

    optChange(name, updatedData);
  }

  const typeDefs = schema.types.filter(t => t[0] === type);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  if (typeDef.length != 0) {
    optData = (opts2obj(typeDef[2]));
  }

  const fieldDef = (!Array.isArray(typeDef[typeDef.length - 1]) || typeDef[typeDef.length - 1].length == 0) ?
    <div className='p-2'> No fields </div> :
    typeDef[typeDef.length - 1]?.map((d: any) => <Field key={d[0]} def={d} parent={msgName} optChange={onChange} config={config} value={data[d[1]]} />);

  const err = errMsg.map((msg, index) =>
    <div key={index}><small className='form-text' style={{ color: 'red' }}>{msg}</small></div>
  );

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

export default RecordField;
