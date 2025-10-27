import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from 'react-dom';
import { ModalSize } from "components/create/schema/structure/editors/options/ModalSize";
import { LANG_GRAPHVIZ, LANG_PLANTUML } from "components/utils/constants";
import SBSelect, { Option } from "components/common/SBSelect";

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

    // Types for options
    type ShapeType = 'none' | 'plain' | 'ellipse';
    type PerTypeAttrs = { [key: string]: { fillcolor: string; shape: ShapeType } };

    interface VisualOpts {
        detail: string;
        show_links: boolean;
        show_label_name: boolean;
        show_headlabel: boolean;
        show_taillabel: boolean;
        enums_allowed: number;
        link_horizontal: boolean;
        pumlOpt: string;
        per_type_attrs: PerTypeAttrs;
    }

    const [opts, setOpts] = useState<VisualOpts>({ 
                                        detail: info,
                                        show_links: true,
                                        show_label_name: true,
                                        show_headlabel: true,
                                        show_taillabel: true,
                                        enums_allowed: 10,
                                        link_horizontal: false,
                                        pumlOpt: info,
                                        // per_type_attrs mirrors GvGenerator.STYLE_DEFAULT.per_type_attrs
                                        per_type_attrs: {
                                            'Record': { fillcolor: '#87CEFA', shape: 'plain' },
                                            'Map': { fillcolor: '#87CEFA', shape: 'plain' },
                                            'Array': { fillcolor: '#87CEFA', shape: 'plain' },
                                            'Choice': { fillcolor: '#87CEFA', shape: 'plain' },
                                            'Enumerated': { fillcolor: '#98FB98', shape: 'plain' },
                                            'Integer': { fillcolor: '#98FB98', shape: 'ellipse' },
                                            'String': { fillcolor: '#98FB98', shape: 'ellipse' },
                                            'Binary': { fillcolor: '#98FB98', shape: 'ellipse' },
                                            'Boolean': { fillcolor: '#98FB98', shape: 'ellipse' },
                                            'Number': { fillcolor: '#98FB98', shape: 'ellipse' }
                                        }
                                    });
    const [showGvOpts, setShowGvOpts] = useState(false);
    const [showPumlOpts, setShowPumlOpts] = useState(false);
    const [showTypeOptsCollapsed, setShowTypeOptsCollapsed] = useState(true);
    // validation computed below using useMemo
    
    const isHexColor = (s: string) => /^#([0-9A-Fa-f]{6})$/.test(s);
    const validShapes: ShapeType[] = ['none', 'plain', 'ellipse'];

    const validation = useMemo(() => {
        const errs: string[] = [];
        const p = opts.per_type_attrs || {};
        for (const [k, v] of Object.entries(p)) {
            if (!isHexColor(v.fillcolor)) {
                errs.push(`${k}: invalid color`);
            }
            if (!validShapes.includes(v.shape as ShapeType)) {
                errs.push(`${k}: invalid shape`);
            }
        }
        return { ok: errs.length === 0, errs };
    }, [opts]);

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
                                                    {(() => {
                                                        const detailOptions: Option[] = [
                                                            { label: 'Conceptual', value: conc },
                                                            { label: 'Logical', value: logi },
                                                            { label: 'Informational', value: info }
                                                        ];

                                                        const currentValue = detailOptions.find(o => o.value === opts.detail) || detailOptions[2];

                                                        return (
                                                            <div>
                                                                <div className="d-flex align-items-center">
                                                                    <label className="form-check-label mb-0 me-2" title="Detail" htmlFor="gv-detail-select">Detail</label>
                                                                    <div style={{ flex: '1 1 0', minWidth: 0 }}>
                                                                        <SBSelect
                                                                            id="gv-detail-select"
                                                                            data={detailOptions}
                                                                            onChange={(sel: Option | null) => {
                                                                                if (sel && typeof sel === 'object' && 'value' in sel) {
                                                                                    setOpts({ ...opts, detail: sel.value as string });
                                                                                }
                                                                            }}
                                                                            value={currentValue}
                                                                            isSmStyle
                                                                            isClearable={false}
                                                                            ariaLabelledBy={'gv-detail-label'}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {/* visually-hidden label for screen readers */}
                                                                <span id="gv-detail-label" className="visually-hidden">GraphViz detail level</span>
                                                                <div className="mt-2 d-flex align-items-center">
                                                                    <label className="form-check-label mb-0 me-2" title="Link Orientation" htmlFor="gvLinkOrientation">Orientation</label>
                                                                    {(() => {
                                                                        const linkOptions: Option[] = [
                                                                            { label: 'Vertical', value: false },
                                                                            { label: 'Horizontal', value: true }
                                                                        ];
                                                                        const currentLink = linkOptions.find(o => o.value === opts.link_horizontal) || linkOptions[0];
                                                                        return (
                                                                            <div style={{ minWidth: '8rem' }}>
                                                                                <SBSelect
                                                                                    id={'gvLinkOrientation'}
                                                                                    data={linkOptions}
                                                                                    value={currentLink}
                                                                                    onChange={(sel: Option | null) => {
                                                                                        if (sel && typeof sel === 'object' && 'value' in sel) {
                                                                                            // Map selection to boolean link_horizontal
                                                                                            setOpts({ ...opts, link_horizontal: Boolean(sel.value) });
                                                                                        }
                                                                                    }}
                                                                                    isSmStyle
                                                                                    isClearable={false}
                                                                                    ariaLabelledBy={'gv-linkorientation-label'}
                                                                                />
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                                <span id="gv-linkorientation-label" className="visually-hidden">Link orientation for GraphViz (vertical or horizontal)</span>
                                                            </div>
                                                        );
                                                    })()}
                                                    <div className="mt-2 d-flex align-items-center">
                                                        <label className="form-check-label mb-0 me-2" title="Number of Enumerations Allowed" htmlFor="gvEnumsAllowedInput">Enumerations</label>
                                                        <input
                                                            id="gvEnumsAllowedInput"
                                                            name="gvEnumsAllowedInput"
                                                            type="number"
                                                            min={0}
                                                            step={1}
                                                            className="form-control form-control-sm"
                                                            value={opts.enums_allowed}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                const v = e.currentTarget.valueAsNumber;
                                                                const nv = Number.isFinite(v) ? Math.max(0, Math.trunc(v)) : 0;
                                                                setOpts({ ...opts, enums_allowed: nv });
                                                            }} />
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
                                                </div>                                                                                  
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-12">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <p className="mb-0">Type Specific Options</p>
                                                        <button type="button" className="btn btn-link p-0" onClick={() => setShowTypeOptsCollapsed(s => !s)}>
                                                            {showTypeOptsCollapsed ? 'Show' : 'Hide'}
                                                        </button>
                                                    </div>
                                                    {!showTypeOptsCollapsed && (
                                                        <div className="card">
                                                            <div className="card-body">
                                                                <div className="row">
                                                                    {Object.keys(opts.per_type_attrs || {}).map((tkey) => {
                                                                        const typeCfg = opts.per_type_attrs[tkey] || { fillcolor: '#ffffff', shape: 'plain' };
                                                                        const shapeOptions: Option[] = [
                                                                            { label: 'none', value: 'none' },
                                                                            { label: 'plain', value: 'plain' },
                                                                            { label: 'ellipse', value: 'ellipse' }
                                                                        ];
                                                                        const currentShape = shapeOptions.find(s => s.value === typeCfg.shape) || shapeOptions[1];
                                                                        return (
                                                                            <div className="col-md-6 mb-2" key={tkey}>
                                                                                <div className="d-flex align-items-center">
                                                                                        <div style={{ minWidth: '4rem' }} className="me-2 small text-truncate" title={tkey}>{tkey === 'Enumerated' ? 'Enum' : tkey}</div>
                                                                                        <input
                                                                                            type="color"
                                                                                            title={`Fill color for ${tkey}`}
                                                                                            className="form-control form-control-color me-2"
                                                                                            style={{ width: '2.25rem', padding: 0 }}
                                                                                            value={typeCfg.fillcolor}
                                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                                        const newColor = e.currentTarget.value;
                                                                                                setOpts({ ...opts, per_type_attrs: { ...(opts.per_type_attrs as PerTypeAttrs), [tkey]: { ...((opts.per_type_attrs as PerTypeAttrs)[tkey] || {}), fillcolor: newColor } } });
                                                                                    }} />
                                                                                        <div style={{ flex: '1 1 0', minWidth: 0 }}>
                                                                                        <SBSelect
                                                                                            id={`shape-${tkey}`}
                                                                                            data={shapeOptions}
                                                                                            value={currentShape}
                                                                                            onChange={(sel: any) => {
                                                                                                if (sel && typeof sel === 'object' && 'value' in sel) {
                                                                                                    const newShape = sel.value as ShapeType;
                                                                                                    setOpts({ ...opts, per_type_attrs: { ...(opts.per_type_attrs as PerTypeAttrs), [tkey]: { ...((opts.per_type_attrs as PerTypeAttrs)[tkey] || {}), shape: newShape } } });
                                                                                                }
                                                                                            }}
                                                                                            isSmStyle
                                                                                            isClearable={false}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
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

