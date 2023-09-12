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
}

// Component
const RecordField = (props: RecordFieldProps) => {
  const { def, optChange, parent, config, children } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
  var optData: Record<string, any> = {};

  const [_idx, name, type, _args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');
  const [data, setData] = useState<string[]>([]); //track elements
  const [errMsg, setErrMsg] = useState<string[]>([]);
  const [toggle, setToggle] = useState(true);

  const onChange = (k: string, v: any) => {
    let updatedData: any[] = [];
    if (!data.includes(k)) {
      //add
      updatedData = [...data, k];

    } else {
      if (v == '' || v == undefined || v == null || (typeof v == 'object' && v.length == 0) || Number.isNaN(v) || !v) {
        //remove
        updatedData = data.filter((elem) => {
          return elem != k;
        });
      }//else value is updated
    }
    
    //TODO : fix
    setData(updatedData);
    console.log(updatedData)
    const filteredData = updatedData.filter((elem) => elem != '');
    console.log(filteredData)
    const validMsg = validateOptDataElem(config, optData, filteredData);
    setErrMsg(validMsg);


    //TODO?: filter - remove null values
    console.log(k, v)
    console.log(msgName, filteredData)
    optChange(k, v)
  }

  const typeDefs = schema.types.filter(t => t[0] === type);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  if (typeDef.length != 0) {
    optData = (opts2obj(typeDef[2]));
  }

  const fieldDef = (!Array.isArray(typeDef[typeDef.length - 1]) || typeDef[typeDef.length - 1].length == 0) ?
    <div className='p-2'> No fields </div> :
    typeDef[typeDef.length - 1].map((d: any) => <Field key={d[0]} def={d} parent={msgName} optChange={onChange} config={config} />);

  const err = errMsg.map((msg, index) =>
    <div key={index}><small className='form-text' style={{ color: 'red' }}>{msg}</small></div>
  );

  return (
    <div className='form-group'>
      <div className='card border-secondary'>
        <div className={`card-header p-2 ${children ? 'd-flex justify-content-between' : ''}`}>
          <div>
            <SBToggleBtn toggle={toggle} setToggle={setToggle} >
              <p className='card-title m-0'>{`${name}${isOptional(def) ? '' : '*'}`}</p>
              {comment ? <small className='card-subtitle form-text text-muted'>{comment}</small> : ''}
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
