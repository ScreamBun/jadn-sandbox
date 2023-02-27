import React from "react";
import { htmlToHTML } from "./SBHtmlConverter";
import { markdownToHTML } from "./SBMarkdownConverter";

const SBHtmlPreviewer = (props: any) => {

    const { htmlText, showPreviewer, height = "20em"} = props;
    const previewerClassName = "previewer " + (showPreviewer ? "hide" : "");

    return (
        <div className="card text-white bg-secondary" style={{ 'height': height, 'overflow': 'auto'}}>
            <div className={previewerClassName}>
                <div id="preview"
                className="previewer-content"
                dangerouslySetInnerHTML={{ __html: htmlText}}>
                </div>
            </div>
        </div>
      )
}
export default SBHtmlPreviewer;