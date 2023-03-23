import React from "react";
import { Button } from "reactstrap";
import * as d3 from "d3-graphviz";

export const convertToGvSplitView = (data: any, height=320, width=920) => {
    d3.graphviz("#gv")
    .fit(true)
    .height(height)
    .width(width)
    .zoomScaleExtent([1, 10])
    .renderDot(data);
}

export const convertToGvFullView = (data: any) => {
    d3.graphviz("#fullGV")
    .fit(true)
    .renderDot(data);
}

const SBGvPreviewer = (props: any) => {

    const { height = "20em" } = props;

    const onDiagramReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        d3.graphviz("#gv").resetZoom();
    }

    return (
        <div id="content" className="card bg-secondary" style={{ 'height': height, overflow: 'hidden' }}>
            <Button id="diagramReset" title="Reset the View" color="info" className="btn-sm m-1" style={{ zIndex: '1', position: 'absolute' }} onClick={onDiagramReset}>Reset</Button>
            <div id="gv" style={{ 'height': height, textAlign: 'center', zIndex: '0' }}>
            </div>
            <div id="fullGV" style={{ visibility: 'hidden' }}>
            </div>
        </div>
    );
}
export default SBGvPreviewer;