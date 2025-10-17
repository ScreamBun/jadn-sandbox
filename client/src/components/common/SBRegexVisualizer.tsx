import { faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import RegExper from 'regexper'

interface SBRegexVisualizerProps {
    regex: string;
    isBtnPrimary?: boolean;
}

const SBRegexVisualizer = (props: SBRegexVisualizerProps) => {
    const { regex, isBtnPrimary = false } = props;

    const visualizeRegex = (pattern: string) => {
        let newWindow = window.open("");
        if (newWindow && newWindow.document && newWindow.document.body) {
            try { 
                RegExper.render(pattern, newWindow.document.body);
            } catch (error) {
                
            }
        }
    }

    return (
        <>
            <div className="position-relative d-inline-block">
                <button 
                    type="button" 
                    className={`btn ${isBtnPrimary ? 'btn-primary' : ''} btn-medium p-2`}
                    onClick={() => visualizeRegex(regex)}
                    title={`Visualize regex`}
                >
                    <FontAwesomeIcon icon={faImage}/>
                </button>
            </div>
        </>
    );
}

export default SBRegexVisualizer;