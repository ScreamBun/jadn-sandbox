import React, { useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { markdown } from '@codemirror/lang-markdown';
import { xml } from '@codemirror/lang-xml';
import { githubLight} from '@uiw/codemirror-themes-all';
import { LANG_HTML, LANG_JADN, LANG_JSON, LANG_MARKDOWN, LANG_XML } from 'components/utils/constants';

// References:
// https://reactjsexample.com/codemirror-component-for-react/
// https://uiwjs.github.io/react-codemirror/
// https://uiwjs.github.io/react-codemirror/#/extensions/basic-setup
// https://uiwjs.github.io/react-codemirror/#/theme/data/xcode/light

const SBEditor = (props: any) => {

    const { 
        data, 
        setData, 
        height = "40em", 
        isReadOnly = false, 
        convertTo,
        onEditorChange
    } = props;

    let lang = json();

    useEffect(() => {
        if(convertTo){
            switch(convertTo.toLowerCase()) {
                case LANG_JADN:
                    lang = json();
                    break;                
                case LANG_JSON:
                    lang = json();
                    break;
                case LANG_HTML:
                    lang = html();
                    break; 
                case LANG_MARKDOWN:
                    lang = markdown();
                    break;
                case LANG_XML:
                    lang = xml();
                    break;                              
                default:
                    lang = json();
                break;
            }
        }
    }, [convertTo])    

    const onChange = React.useCallback((value: any, viewUpdate: any) => {
        // console.log('value:', value);
        setData(value);
        // onChangeToParent();
      }, []);

      return (
        <CodeMirror
            value={data}
            height={height}
            readOnly={isReadOnly}
            theme={githubLight}        
            extensions={[lang]}
            onChange={onChange}
        />
      );
  }

  export default SBEditor;  