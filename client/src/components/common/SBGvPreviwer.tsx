import React from "react";
import { Button } from "reactstrap";
import * as d3 from "d3-graphviz";

const SBGvPreviewer = (props: any) => {

    const { height = "20em" } = props;

    const onDiagramReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        d3.graphviz("#gv").resetZoom();
    }

    return (
        <div id="content" className="card bg-secondary" style={{ 'height': height }}>
            <Button id="diagramReset" color="info" className="btn-sm m-1" style={{ zIndex: '1', position: 'absolute' }} onClick={onDiagramReset}>reset</Button>
            <div id="gv" style={{ textAlign: 'center', zIndex: '0' }}>
            </div>
        </div>
    );
}
export default SBGvPreviewer;