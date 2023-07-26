import React from "react";
import SBEditor from "../common/SBEditor";

export const onHTMLPopOutClick = (convertedSchema: any) => {
    const blob = new Blob([convertedSchema], { type: "text/html" });
    const data = URL.createObjectURL(blob);
    window.open(data);
}

const SBHtmlPreviewer = (props: any) => {

    const { htmlText, showPreviewer, conversion } = props;
    const previewerClassName = "previewer " + (showPreviewer ? "hide" : "");

    return (
        <>
            <SBEditor data={htmlText} isReadOnly={true} convertTo={conversion} height="20em"></SBEditor>

            <div className="card bg-secondary" style={{ 'height': "20em", 'overflow': 'auto' }}>
                <div className={previewerClassName}>
                    <div id="preview"
                        className="previewer-content"
                        dangerouslySetInnerHTML={{ __html: htmlText }}
                    >
                    </div>
                </div>
            </div>
        </>
    )
}
export default SBHtmlPreviewer;