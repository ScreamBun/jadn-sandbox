import { faHighlighter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { highlight as highlightAction, clearHighlight } from "actions/highlight";

interface SBHighlightProps {
    highlightWords: Array<string | number | boolean | null | undefined>;
}

const SBHighlightButton = (props: SBHighlightProps) => {
    const { highlightWords } = props;
    const dispatch = useDispatch();

    const [toggleHighlight, setToggleHighlight] = useState(false);

    useEffect(() => {
      if (toggleHighlight) {
        const words = (Array.isArray(highlightWords) ? highlightWords : [])
          .filter(v => v !== null && v !== undefined && v !== '')
          .map(v => String(v));
        if (words.length > 0) {
          dispatch<any>(highlightAction(words));
        } else {
          dispatch<any>(clearHighlight());
        }
      } else {
        dispatch<any>(clearHighlight());
      }
    }, [toggleHighlight, highlightWords]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
      <div className="position-relative d-inline-block">
        <button 
            type="button" 
            className={`btn btn-sm ${toggleHighlight ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick = {() => setToggleHighlight(!toggleHighlight)}
        >
            <FontAwesomeIcon icon={faHighlighter}/>
        </button>
      </div>
    );
}
export default SBHighlightButton;
