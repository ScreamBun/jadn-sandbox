import React from "react";
import { markdownToHTML } from "./SBMarkdownConverter";
import SBEditor from "./SBEditor";

export const onMDPopOutClick = (convertedSchema) => {
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