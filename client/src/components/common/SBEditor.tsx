import React, { useContext } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { githubDark, githubLight } from '@uiw/codemirror-themes-all';
import { langs } from '@uiw/codemirror-extensions-langs';
import { LANG_HTML, LANG_MARKDOWN, LANG_XML, LANG_XSD } from 'components/utils/constants';
import { FormatJADN } from 'components/utils';
import { ThemeContext } from 'components/static/ThemeProvider';

// References:
// https://reactjsexample.com/codemirror-component-for-react/
// https://uiwjs.github.io/react-codemirror/
// https://uiwjs.github.io/react-codemirror/#/extensions/basic-setup
// https://uiwjs.github.io/react-codemirror/#/theme/data/xcode/light
// Possible dark theme: abcdef

const SBEditor = (props: any) => {

    const {
        data,
        height = "70vh",
        isReadOnly = false,
        convertTo,
        onChange
    } = props;

    const { theme } = useContext(ThemeContext);

    let extensions = [langs.json()]
    if (convertTo != null && typeof convertTo != 'object') {
        switch (convertTo.toLowerCase()) {
            case LANG_HTML:
                extensions = [langs.html()];
                break;
            case LANG_MARKDOWN:
                extensions = [langs.markdown()];
                break;
            case LANG_XML:
                extensions = [langs.xml()];
                break;
            case LANG_XSD:
                extensions = [langs.xml()];
                break;                
            default:
                extensions = [langs.json()];
                break;
        }
    }

    let formattedData = typeof data == "object" ? FormatJADN(data) : data;

    return (
        <CodeMirror
            value={formattedData}
            height={height}
            maxHeight='100%'
            readOnly={isReadOnly}
            theme={theme == "light" ? githubLight : githubDark}
            extensions={extensions}
            onChange={onChange}
        />
    );
}

export default SBEditor;  