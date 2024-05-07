import React, { useState } from "react";
import { InfoConfig, SchemaJADN, StandardFieldArray } from '../../../../schema/interface';
import { opts2obj } from 'components/create/schema/structure/editors/options/consts';
import SBECMARegexBtn from 'components/common/SBECMARegexBtn';
import { validateOptDataStr } from '../../utils';
import { sbToastError, sbToastSuccess } from 'components/common/SBToast';
import { useAppSelector } from 'reducers';
import { hasProperty } from 'components/utils';


interface SBPatternInputProps {
    arr?: any;
    def: StandardFieldArray;
    optChange: (n: string, v: any, i?: number) => void;
    label: string;
    parent?: string;
    config: InfoConfig;
    children?: JSX.Element;
    value: string;
}

const SBInput = (props: SBPatternInputProps) => {

  const { arr, def, optChange, parent, config, value = '' } = props; 
  const [idx, name, type, opts, comment] = def;
  const msgName = (parent ? [parent, name] : [name]).join('.');
  const [data, setData] = useState(value);
  const [errMsg, setErrMsg] = useState<string[]>([]);
  

  //used for ECMAScript regex checker button
  const [isECMAScriptValid, setIsECMAScriptValid] = useState(false);
  //used for XML regex checker button
  const [isValidating, setIsValidating] = useState(false);
  const patternOnchg = (patternData: string) => {
      setData(patternData);
      optChange(name, patternData, arr);
  }

  var optData: Record<string, any> = {};
  const schema = useAppSelector((state) => state.Util.selectedSchema) as SchemaJADN;
  const typeDefs = schema.types ? schema.types.filter(t => t[0] === type) : [];
  const typeDef = typeDefs.length === 1 ? typeDefs[0] : [];
  if (typeDef.length != 0) {
    optData = (opts2obj(typeDef[2]));
  } else {
    optData = (opts ? opts2obj(opts) : []);
  }

  if (hasProperty(optData, 'default') && value == '') {
    setData(optData.default);
  }

    return (

      <div className='card-body m-0 p-0'>
          <input
            className="form-control form-control-sm"
            type="text"
            value={props.value}
            onChange={e => {
              setData(e.target.value);
            }}
            onBlur={e => {
              const errCheck = validateOptDataStr(config, optData, e.target.value);
              setErrMsg(errCheck);
              optChange(name, e.target.value, arr);
            }}
            style={{ borderColor: errMsg.length != 0 ? 'red' : '' }} /> 
              <SBECMARegexBtn 
                isECMAScriptValid={isECMAScriptValid}
                setIsECMAScriptValid={setIsECMAScriptValid}
                setIsValidating={setIsValidating}
                patternData={optData.pattern}                         
                onValidateClick={patternOnchg}
              /> 
        </div>
      );
}

export default SBInput;