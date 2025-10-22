import { faHighlighter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { highlight as highlightAction, clearHighlight } from "actions/highlight";

interface SBHighlightProps {
    highlightWords: Array<string | number | boolean | null | undefined>;
}

const SBHighlightButton = (props: SBHighlightProps) => {
    const { highlightWords } = props;
    const dispatch = useDispatch();

    const [toggleHighlight, setToggleHighlight] = useState(false);

    // Track the words this button has currently contributed to the global store
    const prevWordsRef = useRef<string[]>([]);
    const globalWords: string[] = useSelector((s: any) => s.Highlight.highlightWords || []);

    const sanitize = (arr: Array<string | number | boolean | null | undefined>) =>
        (Array.isArray(arr) ? arr : [])
            .filter(v => v !== null && v !== undefined && v !== '')
            .map(v => String(v));

    const uniq = (arr: string[]) => Array.from(new Set(arr));

    const removeSubset = (all: string[], subset: string[]) => {
        if (!subset.length) return all;
        const set = new Set(subset);
        return all.filter(w => !set.has(w));
    };

    // Handle toggle changes
    useEffect(() => {
        const newWords = sanitize(highlightWords);

        if (toggleHighlight) {
            // Add current words to global (de-duped)
            const merged = uniq([...globalWords, ...newWords]);
            dispatch<any>(highlightAction(merged));
            prevWordsRef.current = newWords;
        } else {
            // Remove this button's previously-added words from global
            const filtered = removeSubset(globalWords, prevWordsRef.current);
            if (filtered.length > 0) {
                dispatch<any>(highlightAction(filtered));
            } else {
                dispatch<any>(clearHighlight());
            }
            prevWordsRef.current = [];
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleHighlight]);

    // If this field's words change while toggle is ON, update global by replacing the subset
    useEffect(() => {
        if (!toggleHighlight) return;

        const current = sanitize(highlightWords);
        const prev = prevWordsRef.current;

        // No change
        if (current.join('|') === prev.join('|')) return;

        // Remove previous subset, then add current subset, de-duped
        const withoutPrev = removeSubset(globalWords, prev);
        const merged = uniq([...withoutPrev, ...current]);

        dispatch<any>(highlightAction(merged));
        prevWordsRef.current = current;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightWords]);

    return (
      <div className="position-relative d-inline-block">
        <button 
            type="button" 
            className={`btn btn-sm pe-1 ps-1 ${toggleHighlight ? 'btn-warning' : ''}`}
            onClick={() => setToggleHighlight(!toggleHighlight)}
        >
            <FontAwesomeIcon icon={faHighlighter}/>
        </button>
      </div>
    );
}
export default SBHighlightButton;