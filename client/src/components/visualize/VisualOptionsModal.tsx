import React, { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { ModalSize } from "components/create/schema/structure/editors/options/ModalSize";
import { LANG_GRAPHVIZ, LANG_PLANTUML } from "components/utils/constants";

export const VisualOptionsModal = (props: any) => {
    const {
        isOpen,
        title = 'Confirm Options',
        modalSize = ModalSize.md,
        conversions = [],
        onResponse } = props;

    const conc: string = "conceptual";
    const logi: string = "logical";
    const info: string = "information";

    const [opts, setOpts] = useState({ graphVizOpt: info, pumlOpt: info });
    const [showGvOpts, setShowGvOpts] = useState(false);
    const [showPumlOpts, setShowPumlOpts] = useState(false);

    useEffect(() => {
        setShowGvOpts(false);
        setShowPumlOpts(false);
        for (const conv of conversions) {
            if (conv.value == LANG_PLANTUML) {
                setShowPumlOpts(true);
            }
            if (conv.value == LANG_GRAPHVIZ) {
                setShowGvOpts(true);
            }
        }
    }, [conversions]);    

    const onCloseClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onResponse(false, null);
    };

    const onYesClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onResponse(true, opts);
    };

    const onNoClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onResponse(false, null);
    };

    return (
        <>
            {createPortal(
                <div id="confirmationModal" className={`modal fade ${isOpen ? 'show d-block' : 'd-none'}`} tabIndex={-1} role='dialog'>
                    <div className={`modal-dialog modal-dialog-centered ${modalSize}`} role='document'>
                        <div className='modal-content'>
                            <div className="modal-header">
                                <h5 className='modal-title'>
                                    {title}
                                </h5>
                                <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' title='Close' onClick={onCloseClick} />
                            </div>
                            <div className="modal-body">
                                {showGvOpts && <>
                                    <p className="mb-1">GraphViz</p>
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="form-check">
                                                <input 
                                                    id="gvConceptualRadio" 
                                                    name="gvConceptualRadio" 
                                                    type="radio" 
                                                    className="form-check-input" 
                                                    value={opts.graphVizOpt} 
                                                    onClick={() => {
                                                        setOpts({...opts, graphVizOpt: conc});
                                                    }}
                                                    checked={opts.graphVizOpt === conc} />
                                                <label className="form-check-label" title="Least detailed option" for="gvConceptualRadio">Conceptual</label>
                                            </div>
                                            <div className="form-check">
                                                <input 
                                                    id="gvLogicalRadio" 
                                                    name="gvLogicalRadio" 
                                                    type="radio" 
                                                    className="form-check-input" 
                                                    value={opts.graphVizOpt}  
                                                    onClick={() => {
                                                        setOpts({...opts, graphVizOpt: logi});
                                                    }}                                             
                                                    checked={opts.graphVizOpt === logi} />
                                                <label className="form-check-label" for="gvLogicalRadio">Logical</label>
                                            </div>
                                            <div className="form-check">
                                                <input 
                                                    id="gvInformationRadio" 
                                                    name="gvInformationRadio" 
                                                    type="radio" 
                                                    className="form-check-input" 
                                                    value={opts.graphVizOpt}  
                                                    onClick={() => {
                                                        setOpts({...opts, graphVizOpt: info});
                                                    }}                                                
                                                    checked={opts.graphVizOpt === info} />
                                                <label className="form-check-label" title="Most detailed option" for="gvInformationRadio">Informational</label>
                                            </div>
                                        </div>
                                    </div>
                                </> }
                                {showPumlOpts && <>
                                    <p className="mb-1 mt-2">PlantUML</p>
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="form-check">
                                                <input 
                                                    id="pumlConceptualRadio" 
                                                    name="pumlConceptualRadio" 
                                                    type="radio" 
                                                    className="form-check-input" 
                                                    value={opts.pumlOpt} 
                                                    onClick={() => {
                                                        setOpts({...opts, pumlOpt: conc});
                                                    }}
                                                    checked={opts.pumlOpt === conc} />
                                                <label className="form-check-label" title="Least detailed option" for="pumlConceptualRadio">Conceptual</label>
                                            </div>
                                            <div className="form-check">
                                                <input 
                                                    id="pumlLogicalRadio" 
                                                    name="pumlLogicalRadio" 
                                                    type="radio" 
                                                    className="form-check-input" 
                                                    value={opts.pumlOpt} 
                                                    onClick={() => {
                                                        setOpts({...opts, pumlOpt: logi});
                                                    }}                                                 
                                                    checked={opts.pumlOpt === logi} />
                                                <label className="form-check-label" for="pumlLogicalRadio">Logical</label>
                                            </div>
                                            <div className="form-check">
                                                <input 
                                                    id="pumlInformationalRadio" 
                                                    name="pumlInformationalRadio" 
                                                    type="radio" 
                                                    className="form-check-input" 
                                                    value={opts.pumlOpt} 
                                                    onClick={() => {
                                                        setOpts({...opts, pumlOpt: info});
                                                    }}                                                   
                                                    checked={opts.pumlOpt === info} />
                                                <label className="form-check-label" title="Most detailed option" for="pumlInformationalRadio">Informational</label>
                                            </div> 
                                        </div>
                                    </div>   
                                </> }                                                                                         
                            </div>
                            <div className="modal-footer">
                                <button type='button' className='btn btn-sm btn-secondary' onClick={onNoClick}>Close</button>
                                <button type='button' className='btn btn-sm btn-success' onClick={onYesClick}>OK</button>
                            </div>
                        </div>
                    </div>
                    <div className={`modal-backdrop fade ${isOpen ? 'show' : ''}`} style={{
                        zIndex: -1
                    }}></div>
                </div>,
                document.body)}
        </>
    )
};

