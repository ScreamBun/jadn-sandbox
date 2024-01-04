import React from "react";
import * as d3 from "d3-graphviz";
import SBEditor from "../common/SBEditor";
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const convertToGvSplitView = (data: any, height = 320, width = 920) => {
    d3.graphviz("#gv")
        .fit(true)
        .height(height)
        .width(width)
        .zoomScaleExtent([1, 10])
        .renderDot(data);
}

export const convertToGvFullView = (data: any) => {
    var margin = 20; // to avoid scrollbars
    var width = window.innerWidth - margin;
    var height = window.innerHeight - margin;

    d3.graphviz("#fullGV")
        .fit(true)
        .height(height)
        .width(width)
        .zoom(true)
        .renderDot(data);
}

export const onGVPopOutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    var newWindowContent = document.getElementById('fullGV')?.innerHTML;
    var newWindow = window.open("");
    newWindow?.document.write(newWindowContent || 'Error: Cannot display Graphviz');
}

const SBGvPreviewer = (props: any) => {

    const { conversion, convertedSchema } = props;

    const onDiagramReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        d3.graphviz("#gv").resetZoom();
    }

    return (
        <>
            <SBEditor data={convertedSchema} isReadOnly={true} convertTo={conversion} height="35vh"></SBEditor>

            <div id="content" className="card bg-secondary" style={{ 'height': "35vh", overflow: 'hidden' }}>
                <div className="tools">
                    <button type="button" title="Reset" className="btn btn-sm"
                        onClick={onDiagramReset}>
                        <FontAwesomeIcon icon={faUndo} />
                    </button>
                </div>
                <div id="gv" style={{ 'height': "35vh", textAlign: 'center', zIndex: '0' }}>
                </div>
                <div id="fullGV" style={{ visibility: 'hidden', overflow: 'hidden' }}>
                </div>
            </div>
        </>
    );
}
export default SBGvPreviewer;