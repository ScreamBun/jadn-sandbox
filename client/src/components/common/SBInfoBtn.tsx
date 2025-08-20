import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThemeContext } from "components/static/ThemeProvider";
import React, { useContext, useState } from "react";
import { getSelectTheme } from "./SBSelect";

interface SBInfoProps {
    comment?: string;
}

const SBInfoBtn = (props: SBInfoProps) => {
    const { comment } = props;
    const [showTooltip, setShowTooltip] = useState(false);
    const { theme } = useContext(ThemeContext);
    const themeColors = getSelectTheme(theme);
    

    if (!comment) {
        return null;
    }

    const toggleTooltip = () => {
      setShowTooltip((prev) => !prev)
    };

    return (
      <div className="position-relative d-inline-block">
        <button 
            type="button" 
            className="btn btn-sm"
            onClick = {toggleTooltip}
        >
            <FontAwesomeIcon icon={faInfoCircle}/>
        </button>
        {showTooltip && (
            <div 
            className={`alert p-0 ms-1 me-1 position-absolute start-100 top-0 border-2 ${
              theme === 'dark' 
              ? 'alert-secondary border-secondary text-white' 
              : 'alert-info border-info text-dark'
            }`}
            style={{
              zIndex: 1050,
              whiteSpace: 'normal',
              fontSize: '0.875rem',
              minWidth: '15rem',
              maxWidth: '30rem',
              backgroundColor: themeColors?.neutral0,
              color: themeColors?.primary25,
              borderColor: themeColors?.primary25
            }}
            role="alert"
            dangerouslySetInnerHTML={{ __html: comment }}
            >
            </div>
        )}
      </div>
    );
}
export default SBInfoBtn;