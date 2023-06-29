import React, { useState } from 'react';
import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { InfoConfig, SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { getTagField, validateOptDataElem } from '../../utils';
import { hasProperty } from 'components/utils';
import { TagIDField } from './Types';

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

  const [idx, name, type, _args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');
  const [data, setData] = useState({}); //track elements
  const [errMsg, setErrMsg] = useState<string[]>([]);

  const onChange = (k: string, v: any) => {
    if (!v) {
      v = '';
    }
    const updatedData = { ...data, [k]: v };
    setData(updatedData);
    const validMsg = validateOptDataElem(config, optData, Object.entries(updatedData));
    setErrMsg(validMsg);
    optChange(k, v);
  }

  const typeDefs = schema.types.filter(t => t[0] === type);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  if (typeDef) {
    optData = (opts2obj(typeDef[2]));
  }

  const fieldDef = (!Array.isArray(typeDef[typeDef.length - 1]) || typeDef[typeDef.length - 1].length == 0) ?
    <div> No fields </div> :
    typeDef[typeDef.length - 1].map((d: any) => {
      const [didx, dname, _dtype, dargs, dcomment] = d;
      const fieldOptData = opts2obj(dargs);

      //if field has tagID
      if (hasProperty(fieldOptData, 'tagid')) {
        const enumField = getTagField(typeDef, msgName, fieldOptData.tagid.toString());
        if (enumField && Object.keys(data).includes(enumField)) {
          //create choice field based on selected enum
          const selected = data[enumField];
          return (<TagIDField key={didx} def={d} parent={msgName} optChange={onChange} selectedEnum={selected} config={config} />);

        } else {
          //please select enum
          return (
            <div className='form-group' key={didx}>
              <div className='card'>
                <div className='card-header p-2'>
                  <p className='card-title m-0'>{`${dname}${isOptional(d) ? '' : '*'}`}</p>
                  {dcomment ? <small className='card-subtitle form-text text-muted'>{dcomment}</small> : ''}
                  {err}
                </div>

                <div className='card-body mx-2'>
                  <span className='text-muted'> {`Please select enum from ${enumField?.split('.')[enumField.split('.').length - 1]}`} </span>
                </div>
              </div>
            </div>
          );
        }
      } else {
        //field with no tagID
        return (<Field key={didx} def={d} parent={msgName} optChange={onChange} config={config} />);
      }
    });

  const err = errMsg.map((msg, index) =>
    <div key={index}><small className='form-text' style={{ color: 'red' }}>{msg}</small></div>
  );

  return (
    <div className='form-group' key={idx}>
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
