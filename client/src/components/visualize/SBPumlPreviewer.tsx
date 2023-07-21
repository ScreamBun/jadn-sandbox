import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import encoder from "plantuml-encoder";
import SBEditor from "../common/SBEditor";
import saveAs from "file-saver";

export const convertToPuml = (data: any) => {
    const encoded = encoder.encode(data);
    const url = 'http://www.plantuml.com/plantuml/img/' + encoded;
    return url;
}

export const onDownloadPNGClick = (pumlURL: any) => {
    saveAs(pumlURL, 'puml.png');
}

const SBPumlPreviewer = (props: any) => {

    const { convertedSchema, conversion, data } = props;

    return (
        <>
            <SBEditor data={convertedSchema} isReadOnly={true} convertTo={conversion} height="20em"></SBEditor>

            <div id="content" className="card bg-secondary" style={{ 'height': "20em", 'overflow': 'auto' }}>
                <TransformWrapper>
                    <TransformComponent>
                        <img src={data}
                            width="100%"
                            height="100%"
                            alt="PlantUML preview"
                        ></img>
                    </TransformComponent>
                </TransformWrapper>
            </div>
        </>
    );
}
export default SBPumlPreviewer;