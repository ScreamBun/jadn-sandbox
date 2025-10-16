import React from "react";
import SBEditor from "../common/SBEditor";
import HTMLReactParser from "html-react-parser";
import DOMPurify from 'dompurify'
const { sanitize } = DOMPurify

export const onHTMLPopOutClick = (convertedSchema: any) => {
    const sanitizedData = sanitize(convertedSchema, { FORCE_BODY: true });
    const blob = new Blob([sanitizedData], { type: "text/html" });
    const data = URL.createObjectURL(blob);
    window.open(data);
}

const SBHtmlPreviewer = (props: any) => {

    const { htmlText, showPreviewer, conversion } = props;
    const previewerClassName = "previewer " + (showPreviewer ? "hide" : "");
    const sanitizedData = sanitize(htmlText, { FORCE_BODY: true });

    return (
        <>
            <SBEditor data={htmlText} isReadOnly={true} convertTo={'html'} height="35vh"></SBEditor>

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
export default SBHtmlPreviewer;