import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const SBpumlPreviewer = (props: any) => {

    const { data, height = "20em" } = props;

    return (
        <div id="content" className="card bg-secondary" style={{ 'height': height, 'overflow': 'auto' }}>
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
    );
}
export default SBpumlPreviewer;