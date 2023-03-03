import React from "react";
import { markdownToHTML } from "./SBMarkdownConverter";

const SBMarkdownPreviewer = (props: any) => {

    const { markdownText, showPreviewer, height = "20em" } = props;
    const htmlContent = markdownToHTML(markdownText);
    const previewerClassName = "previewer " + (showPreviewer ? "hide" : "");

    return (
        <div className="card bg-secondary" style={{ 'height': height, 'overflow': 'auto' }}>
            <div className={previewerClassName}>
                <div id="preview"
                    className="previewer-content"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}>
                </div>
            </div>
        </div>
    )
}
export default SBMarkdownPreviewer;