import React from "react";
import SBEditor from "../common/SBEditor";
import { marked } from "marked";
import HTMLReactParser from "html-react-parser";
import * as DOMPurify from 'dompurify';

// markdownToHTML: ALLOWS LINE BREAKS WITH RETURN BUTTON
marked.setOptions({
    breaks: true,
});

// markdownToHTML: INSERTS target="_blank" INTO HREF TAGS (required for codepen links)
const renderer = new marked.Renderer();
renderer.link = function (href: any, _title: any, text: any) {
    return `<a target="_blank" href="${href}">${text}</a>`;
}

function markdownToHTML(markdownText: string) {
    try {
        return marked(markdownText, { renderer: renderer });
    } catch (error) {
        console.error("Something bad happened");
        return error;
    }
}

export const onMDPopOutClick = (convertedSchema: string) => {
    const htmlContent = markdownToHTML(convertedSchema);
    const sanitizedData = DOMPurify.sanitize(htmlContent, { FORCE_BODY: true });
    const blob = new Blob([sanitizedData], { type: "text/html" });
    const data = URL.createObjectURL(blob);
    window.open(data);
}

const SBMarkdownPreviewer = (props: any) => {

    const { markdownText, showPreviewer, conversion } = props;
    const htmlContent = markdownToHTML(markdownText);
    const previewerClassName = "previewer " + (showPreviewer ? "hide" : "");
    const sanitizedData = DOMPurify.sanitize(htmlContent, { FORCE_BODY: true });

    return (
        <>
            <SBEditor data={markdownText} isReadOnly={true} convertTo={conversion} height="35vh"></SBEditor>

            <div className="card bg-secondary" style={{ 'height': "35vh", 'overflow': 'auto' }}>
                <div className={previewerClassName}>
                    <div id="preview"
                        className="previewer-content"
                    >
                        {HTMLReactParser(sanitizedData)}
                    </div>
                </div>
            </div>
        </>
    )
}
export default SBMarkdownPreviewer;