import React, { useState } from 'react';
import Field from '../Field';
import { isOptional } from '../../GenMsgLib';
import { InfoConfig, SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { useAppSelector } from '../../../../../../reducers';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import { getTagField, validateOptDataElem } from '../../utils';
import FormattedField from './formattedField';
import { hasProperty } from 'components/utils';
import { TagIDField } from './Types';

// Interface
interface ArrayFieldProps {
  def: StandardFieldArray;
  optChange: (n: string, v: any) => void;
  parent?: string;
  config: InfoConfig;
}

// Component
const ArrayField = (props: ArrayFieldProps) => {
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN
  var optData: Record<string, any> = {};

  const { def, optChange, parent, config } = props;
  const [_idx, name, _type, _args, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');
  const [data, setData] = useState({}); //track elements
  const [errMsg, setErrMsg] = useState<string[]>([]);

  const onChange = (_k: string, v: any, i: number) => {
    if (!v) {
      v = null;
    }
    const updatedData = { ...data, [i + 1]: v };
    setData(updatedData);
    const updatedArr = Object.values(updatedData);

    const errCheck = validateOptDataElem(config, optData, updatedArr, optData.format ? true : false);
    setErrMsg(errCheck);
    optChange(msgName, updatedArr);
  }

  const typeDefs = schema.types.filter(t => t[0] === def[2]);
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  if (typeDef) {
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

  const fieldDef = (!Array.isArray(typeDef[typeDef.length - 1]) || typeDef[typeDef.length - 1].length == 0) ?
    <div> No fields </div> :
    typeDef[typeDef.length - 1].map((d: any, i: number) => {
      const [didx, dname, _dtype, dargs, dcomment] = d;
      const fieldOptData = opts2obj(dargs);

      //if field has tagID
      if (hasProperty(fieldOptData, 'tagid')) {
        const enumField = getTagField(typeDef, msgName, fieldOptData.tagid.toString());
        const enumFieldIndex = fieldOptData.tagid.toString();
        if (enumFieldIndex && Object.keys(data).includes(enumFieldIndex)) {
          //create choice field based on selected enum
          const selected = data[enumFieldIndex];
          return (
            <div className="col my-1 px-0">
              <TagIDField key={didx} def={d} parent={msgName} optChange={onChange} idx={i} selectedEnum={selected} config={config} />
            </div>
          );

        } else {
          //please select enum
          return (
            <div className="col my-1 px-0">
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
            </div>
          );
        }
      } else {
        //field with no tagID
        return (
          <div className="col my-1 px-0">
            <Field key={didx} def={d} parent={msgName} optChange={onChange} idx={i} config={config} />
          </div>
        );
      }
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
            {fieldDef}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArrayField;
