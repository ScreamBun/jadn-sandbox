import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import encoder from "plantuml-encoder";
import SBEditor from "../common/SBEditor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUndo } from "@fortawesome/free-solid-svg-icons";

export const convertToPuml = (data: any) => {
    const encoded = encoder.encode(data);
    const url = 'http://www.plantuml.com/plantuml/img/' + encoded;
    return url;
}

const SBPumlPreviewer = (props: any) => {

    const { convertedSchema, conversion, data } = props;

    return (
        <>
            <SBEditor data={convertedSchema} isReadOnly={true} convertTo={conversion} height="35vh"></SBEditor>

            <div id="content" className="card bg-secondary" style={{ 'height': "35vh" }}>
                <TransformWrapper
                    initialScale={0.5}
                    minScale={0.2}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <React.Fragment>
                            <div className="tools">
                                <button type="button" className="btn btn-sm" title="Zoom In" onClick={(e) => { e.preventDefault(); zoomIn() }}>+</button>
                                <button type="button" className="btn btn-sm" title="Zoom Out" onClick={(e) => { e.preventDefault(); zoomOut() }}>-</button>
                                <button type="button" className="btn btn-sm" title="Reset" onClick={(e) => { e.preventDefault(); resetTransform() }}>
                                    <FontAwesomeIcon icon={faUndo} />
                                </button>
                            </div>
                            <TransformComponent
                                wrapperStyle={{
                                    width: "100%",
                                    height: "100%",
                                    overflow: 'auto'
                                }}
                            >
                                <img src={data}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                    }}
                                    onLoad={(e) => { e.preventDefault(); resetTransform() }}
                                    alt="PlantUML preview"
                                ></img>
                            </TransformComponent>
                        </React.Fragment>
                    )}
                </TransformWrapper>
            </div>
        </>
    );
}
export default SBPumlPreviewer;