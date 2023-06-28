import React, { useState } from 'react';
import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { InfoConfig, SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { validateOptDataElem } from '../../utils';

// Interface
interface RecordFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any) => void;
  parent?: string;
  config: InfoConfig;
}

// Component
const RecordField = (props: RecordFieldProps) => {
  const { def, optChange, parent, config } = props;
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
  var optData: Record<string, any> = {};

  const [_idx, name, type, _args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');
  const [data, setData] = useState<string[]>([]); //track elements
  const [errMsg, setErrMsg] = useState<string[]>([]);


  const onChange = (k: string, v: any) => {
    if (!data.includes(k)) {
      //add
      const updatedData = [...data, k];
      setData(updatedData);
      const validMsg = validateOptDataElem(config, optData, updatedData);
      setErrMsg(validMsg);
    } else {
      if (v == '' || v == undefined || v == null || (typeof v == 'object' && v.length == 0) || Number.isNaN(v) || !v) {
        //remove
        const updatedData = data.filter((elem) => {
          return elem != k;
        });
        setData(updatedData);
        const validMsg = validateOptDataElem(config, optData, updatedData);
        setErrMsg(validMsg);
      }//else value is updated
    }
    //TODO?: filter - remove null values
    optChange(k, v)
  }

  const typeDefs = schema.types.filter(t => t[0] === type);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  if (typeDef) {
    optData = (opts2obj(typeDef[2]));
  }

  const fieldDef = (!Array.isArray(typeDef[typeDef.length - 1]) || typeDef[typeDef.length - 1].length == 0) ?
    <div> No fields </div> :
    typeDef[typeDef.length - 1].map((d: any) => <Field key={d[0]} def={d} parent={msgName} optChange={onChange} config={config} />);

  const err = errMsg.map((msg, index) =>
    <div key={index}><small className='form-text' style={{ color: 'red' }}>{msg}</small></div>
  );

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

export default RecordField;
