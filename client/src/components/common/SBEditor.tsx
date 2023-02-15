import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { githubLight } from '@uiw/codemirror-themes-all';

const SBEditor = (props: any) => {

    const code = 'const a = 0;';

    const onChange = React.useCallback((value, viewUpdate) => {
        console.log('value:', value);
      }, []);


    //   new EditorView({
    //     doc: "console.log('hello')\n",
    //     extensions: [basicSetup, javascript()],
    //     parent: document.body
    //   })

      return (
        <CodeMirror
            value={code}
            height="40em"
            theme={githubLight}        
            extensions={[javascript({ jsx: true })]}
            onChange={onChange}
        />
      );
  }

  export default SBEditor;  