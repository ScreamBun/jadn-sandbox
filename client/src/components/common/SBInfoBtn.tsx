import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

interface SBInfoProps {
    comment?: string;
}

const SBInfoBtn = (props: SBInfoProps) => {
    const { comment } = props;
    const [showTooltip, setShowTooltip] = useState(false);

    if (!comment) {
        return null;
    }

    return (
      <div className="position-relative d-inline-block">
        <button 
            type="button" 
            className="btn btn-sm"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <FontAwesomeIcon icon={faInfoCircle} />
        </button>
        {showTooltip && (
          <div 
            className="alert alert-secondary p-2 position-absolute start-100 top-0 ms-2 border-secondary border-2 text-white"
            style={{ zIndex: 1050, whiteSpace: 'normal', fontSize: '0.875rem', minWidth: '15rem', maxWidth: '30rem' }}
            role="alert"
          >
              {comment}
          </div>
        )}
      </div>
    );
}
export default SBInfoBtn;