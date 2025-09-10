import React, { useContext, useState, useEffect, useMemo } from 'react';
import CodeMirror, { Decoration, DecorationSet, EditorView, Extension, StateField } from '@uiw/react-codemirror';
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
        onChange,
        initialHighlightWords = [],
        highlightClass = 'cm-sb-highlight'
    } = props;

    const { theme } = useContext(ThemeContext);

    // Local state for highlight words
    const [highlightWords, setHighlightWords] = useState<string[]>(initialHighlightWords);

    // shallow-equal arrays
    const sameArray = (a?: string[], b?: string[]) => {
        if (a === b) return true;
        if (!a || !b) return false;
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
        return true;
    };
    useEffect(() => {
        const incoming = Array.isArray(initialHighlightWords) ? initialHighlightWords : [];
        if (!sameArray(highlightWords, incoming)) {
        setHighlightWords(incoming);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialHighlightWords]);



    // Build highlight extension
    const highlightExt = useMemo<Extension | null>(() => {
        if (!Array.isArray(highlightWords) || highlightWords.length === 0) return null;

        const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = highlightWords
            .filter(w => typeof w === 'string' && w.length > 0)
            .map(escape)
            .join('|');

        if (!pattern) return null;
        const re = new RegExp(pattern, 'g');
        const buildDecos = (docText: string) => {
            const ranges: any[] = [];
            let m: RegExpExecArray | null;
            while ((m = re.exec(docText)) !== null) {
                const from = m.index;
                const to = from + m[0].length;
                ranges.push(Decoration.mark({ class: highlightClass }).range(from, to));
                if (m.index === re.lastIndex) re.lastIndex++;
            }
            return Decoration.set(ranges, true);
        }

        const field = StateField.define<DecorationSet>({
            create(state) { return buildDecos(state.doc.toString()); },
            update(decos, tr) {
                if (tr.docChanged) {
                    return buildDecos(tr.state.doc.toString());
                }
                return decos.map(tr.changes);
            },
            provide: f => EditorView.decorations.from(f)
        });
        
        const baseTheme = EditorView.baseTheme({
            [`.${highlightClass}`]: {
                backgroundColor: 'rgba(255, 230, 150, 0.6)',
                borderBottom: '1px dotted #cc8f00'
            }
        });

        return [field, baseTheme];

    }, [highlightWords, highlightClass]);

    let ext = [langs.json()]
    if (convertTo != null && typeof convertTo != 'object') {
        switch (convertTo.toLowerCase()) {
            case LANG_HTML:
                ext = [langs.html()];
                break;
            case LANG_MARKDOWN:
                ext = [langs.markdown()];
                break;
            case LANG_XML:
                ext = [langs.xml()];
                break;
            case LANG_XSD:
                ext = [langs.xml()];
                break;                
            default:
                ext = [langs.json()];
                break;
        }
    }

    let formattedData = typeof data == "object" ? FormatJADN(data) : data;

    const extensions: Extension[] = React.useMemo(() => {
        const base: any = [...ext];
        if (highlightExt) base.push(highlightExt);
        return base;
    }, [ext, highlightExt]);

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