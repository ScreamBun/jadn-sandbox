import React from "react";
import SBEditor from "../common/SBEditor";
import { marked } from "marked";

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
    const blob = new Blob([htmlContent], { type: "text/html" });
    const data = URL.createObjectURL(blob);
    window.open(data);
}

const SBMarkdownPreviewer = (props: any) => {

    const { markdownText, showPreviewer, conversion } = props;
    const htmlContent = markdownToHTML(markdownText);
    const previewerClassName = "previewer " + (showPreviewer ? "hide" : "");

    return (
        <>
            <SBEditor data={markdownText} isReadOnly={true} convertTo={conversion} height="20em"></SBEditor>

            <div className="card bg-secondary" style={{ 'height': "20em", 'overflow': 'auto' }}>
                <div className={previewerClassName}>
                    <div id="preview"
                        className="previewer-content"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}>
                    </div>
                </div>
            </div>
        </>
    )
}
export default SBMarkdownPreviewer;