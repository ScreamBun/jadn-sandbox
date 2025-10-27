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
    const info: string = "informational";

    const [opts, setOpts] = useState({ 
                                        detail: info,
                                        show_links: true,
                                        show_label_name: true,
                                        show_headlabel: true,
                                        show_taillabel: true,
                                        enums_allowed: 10,
                                        link_horizontal: false,
                                        pumlOpt: info 
                                    });
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
                                            <div className="row">
                                                <div className="col">
                                                    <div className="form-check">
                                                        <input 
                                                            id="gvConceptualRadio" 
                                                            name="gvConceptualRadio" 
                                                            type="radio" 
                                                            className="form-check-input" 
                                                            value={opts.detail} 
                                                            onClick={() => {
                                                                setOpts({...opts, detail: conc});
                                                            }}
                                                            checked={opts.detail === conc} />
                                                        <label className="form-check-label" title="Least detailed option" htmlFor="gvConceptualRadio">Conceptual</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input 
                                                            id="gvLogicalRadio" 
                                                            name="gvLogicalRadio" 
                                                            type="radio" 
                                                            className="form-check-input" 
                                                            value={opts.detail}  
                                                            onClick={() => {
                                                                setOpts({...opts, detail: logi});
                                                            }}                                             
                                                            checked={opts.detail === logi} />
                                                        <label className="form-check-label" htmlFor="gvLogicalRadio">Logical</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input 
                                                            id="gvInformationRadio" 
                                                            name="gvInformationRadio" 
                                                            type="radio" 
                                                            className="form-check-input" 
                                                            value={opts.detail}  
                                                            onClick={() => {
                                                                setOpts({...opts, detail: info});
                                                            }}                                                
                                                            checked={opts.detail === info} />
                                                        <label className="form-check-label" title="Most detailed option" htmlFor="gvInformationRadio">Informational</label>
                                                    </div>                                                    
                                                </div>
                                                <div className="col">
                                                    <div className="form-check">
                                                        <input
                                                            id="gvShowLinksCheckbox"
                                                            name="gvShowLinksCheckbox"
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            onChange={(e) => {
                                                                setOpts({ ...opts, show_links: e.currentTarget.checked });
                                                            }}
                                                            checked={opts.show_links} />
                                                        <label className="form-check-label" title="Show Links" htmlFor="gvShowLinksCheckbox">Show Links</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            id="gvShowLabelNameCheckbox"
                                                            name="gvShowLabelNameCheckbox"
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            onChange={(e) => {
                                                                setOpts({ ...opts, show_label_name: e.currentTarget.checked });
                                                            }}
                                                            checked={opts.show_label_name} />
                                                        <label className="form-check-label" title="Show Label Names" htmlFor="gvShowLinksCheckbox">Show Label Names</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            id="gvShowHeadLabelCheckbox"
                                                            name="gvShowHeadLabelCheckbox"
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            onChange={(e) => {
                                                                setOpts({ ...opts, show_headlabel: e.currentTarget.checked });
                                                            }}
                                                            checked={opts.show_headlabel} />
                                                        <label className="form-check-label" title="Show Head Labels" htmlFor="gvShowHeadLabelCheckbox">Show Head Labels</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            id="gvShowTailLabelCheckbox"
                                                            name="gvShowTailLabelCheckbox"
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            onChange={(e) => {
                                                                setOpts({ ...opts, show_taillabel: e.currentTarget.checked });
                                                            }}
                                                            checked={opts.show_taillabel} />
                                                        <label className="form-check-label" title="Show Tail Labels" htmlFor="gvShowTailLabelCheckbox">Show Tail Labels</label>
                                                    </div>
                                                    <div className="mb-2 d-flex align-items-center">
                                                        <label className="form-check-label mb-0 me-2" title="Number of Enumerations Allowed" htmlFor="gvEnumsAllowedInput">Enumerations</label>
                                                        <input
                                                            id="gvEnumsAllowedInput"
                                                            name="gvEnumsAllowedInput"
                                                            type="number"
                                                            min={0}
                                                            step={1}
                                                            className="form-control form-control-sm"
                                                            style={{ width: '5rem' }}
                                                            value={opts.enums_allowed}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                const v = e.currentTarget.valueAsNumber;
                                                                const nv = Number.isFinite(v) ? Math.max(0, Math.trunc(v)) : 0;
                                                                setOpts({ ...opts, enums_allowed: nv });
                                                            }} />
                                                    </div>
                                                </div>                                                                                  
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
                                                <label className="form-check-label" title="Least detailed option" htmlFor="pumlConceptualRadio">Conceptual</label>
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
                                                    <label className="form-check-label" htmlFor="pumlLogicalRadio">Logical</label>
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
                                                    <label className="form-check-label" title="Most detailed option" htmlFor="pumlInformationalRadio">Informational</label>
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

