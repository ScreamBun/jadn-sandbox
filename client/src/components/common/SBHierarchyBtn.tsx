import { faArrowTurnDown, faSitemap } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThemeContext } from "components/static/ThemeProvider";
import React, { useContext, useState, useMemo } from "react";
import { getSelectTheme } from "./SBSelect";
import { useSelector } from "react-redux";
import { getSelectedSchema } from "reducers/util";
import { destructureField } from "components/create/data/lib/utils";

interface SBHierarchyProps {
    ancestor: string;
    current: any[];
}

const SBHierarchyBtn = (props: SBHierarchyProps) => {
    const { ancestor, current } = props;
    const [showModal, setShowModal] = useState(false);
    const { theme } = useContext(ThemeContext);
    const themeColors = getSelectTheme(theme);

    const [_idx, name, _type, _options, _comment, _children] = destructureField(current);

    if (!ancestor) {
        return null;
    }

    const toggleModal = () => {
        setShowModal((prev) => !prev);
    };

    const schemaObj = useSelector(getSelectedSchema);

    const hierarchyData = useMemo(() => {
        const familyTree = (curr: string, visited: Array<{key: string, fields: any[], relationshipType?: string}>) => {
          if (!schemaObj || !schemaObj.types) return visited;
          
          const targetType = schemaObj.types.filter((type: any) => type[0] === curr);
          if (targetType.length === 0) { 
            return visited; // base case
          }
          
          const [_idx, _name, _type, options, _comment, children] = destructureField(targetType[0]);
          
          const inheritanceOption = options?.find((option: string) => option.startsWith("r") || option.startsWith("e"));
          const relationshipType = inheritanceOption?.startsWith("r") ? "Restricts" : inheritanceOption?.startsWith("e") ? "Extends" : undefined;
          
          if (!visited.some(v => v.key === curr)) {
              visited.push({key: curr, fields: children || [], relationshipType}); // Add fields and relationship type
          }
          
          const hasInheritedFields = options?.some((option: string) => option.startsWith("r") || option.startsWith("e"));

          if (!hasInheritedFields) { // Base
              return visited; 
          }
          
          const ancestorField = inheritanceOption?.slice(1);
          if (!ancestorField) return visited;
            
          return familyTree(ancestorField, visited); // Recurse
        }
        
        const result = familyTree(ancestor, [{key: name, fields: _children || []}] ) || [];
        
        // Set relationship type for the current type (first in the array) if it has inheritance
        if (result.length > 1 && schemaObj && schemaObj.types) {
            const currentType = schemaObj.types.filter((type: any) => type[0] === name);
            if (currentType.length > 0) {
                const [_idx, _name, _type, options] = destructureField(currentType[0]);
                const inheritanceOption = options?.find((option: string) => option.startsWith("r") || option.startsWith("e"));
                if (inheritanceOption) {
                    result[0].relationshipType = inheritanceOption.startsWith("r") ? "Restricts" : "Extends";
                }
            }
        }
        
        return result;
    }, [ancestor, schemaObj, name, _children]);

    return (
        <>
            <div className="position-relative d-inline-block">
                <button 
                    type="button" 
                    className="btn btn-sm"
                    onClick={toggleModal}
                >
                    <FontAwesomeIcon icon={faSitemap}/>
                </button>
            </div>

            {showModal && (
                <div 
                    className="modal show d-block" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={toggleModal}
                >
                    <div 
                        className="modal-dialog modal-lg modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div 
                            className={`modal-content ${
                                theme === 'dark' ? 'bg-dark text-white' : 'bg-white text-dark'
                            }`}
                            style={{
                                backgroundColor: themeColors?.neutral0,
                                color: themeColors?.neutral80,
                                borderColor: themeColors?.primary25
                            }}
                        >
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title">
                                    <FontAwesomeIcon icon={faSitemap} className="me-2" />
                                    Type Hierarchy Path
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={toggleModal}
                                    style={{
                                        filter: theme === 'dark' ? 'invert(1)' : 'none'
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex flex-column">
                                    {hierarchyData.length > 0 ? (
                                        hierarchyData.map((type, index) => (
                                            <div key={type.key}>
                                                <div 
                                                    className={`card ${
                                                        theme === 'dark' ? 'bg-secondary border-secondary' : 'bg-light border-primary'
                                                    }`}
                                                    style={{
                                                        backgroundColor: index === 0 
                                                            ? themeColors?.primary25 
                                                            : themeColors?.neutral10,
                                                        borderColor: themeColors?.primary25,
                                                        opacity: index === 0 ? 1 : 0.8
                                                    }}
                                                >
                                                    <div className="card-body py-2 px-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="fw-bold">{type.key}</span>
                                                            {index === 0 && (
                                                                <small className="badge bg-primary">Current</small>
                                                            )}
                                                            {index === hierarchyData.length - 1 && index !== 0 && (
                                                                <small className="badge bg-success">Root</small>
                                                            )}
                                                        </div>
                                                        {type.fields && type.fields.length > 0 && (
                                                            <div className="mt-2">
                                                                <small className="text-muted me-2">Fields:</small>
                                                                {type.fields.map((field: any, fieldIndex: number) => {
                                                                    const [fieldId, fieldName] = destructureField(field);
                                                                    return (
                                                                        <span 
                                                                            key={fieldIndex}
                                                                            className="badge bg-primary me-1 mb-1"
                                                                            style={{ fontSize: '0.7em' }}
                                                                        >
                                                                            {fieldId}: {fieldName}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {index < hierarchyData.length - 1 && (
                                                    <div className="text-center my-2">
                                                        <div className="text-muted small">
                                                            {type.relationshipType || "Inherits"}
                                                            <FontAwesomeIcon icon={faArrowTurnDown} className="mx-2" />
                                                        </div>
                                                        <div className="text-muted">
                                                            <i className="fas fa-arrow-down"></i>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted">
                                            <p>No hierarchy path found for this type.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer border-top">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={toggleModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default SBHierarchyBtn;