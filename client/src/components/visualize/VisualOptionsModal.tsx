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

    interface GvOpts {
        detail: string;
        show_links: boolean;
        show_label_name: boolean;
        show_headlabel: boolean;
        show_taillabel: boolean;
        enums_allowed: number;
        link_horizontal: boolean;
        per_type_attrs: PerTypeAttrs;
    }

    interface PumlOpts {
        detail: string;
        show_links: boolean;
        show_fields: boolean;
        show_multiplicity: boolean;
        show_primitive_types: boolean;
        title: string;
        theme: string;
    }

    interface VisualOpts {
        gv: GvOpts;
        puml: PumlOpts;
    }

    const [opts, setOpts] = useState<VisualOpts>({ 
        gv: {
            detail: info,
            show_links: true,
            show_label_name: true,
            show_headlabel: true,
            show_taillabel: true,
            enums_allowed: 10,
            link_horizontal: false,
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
        },
        puml: {
            detail: info,
            show_links: true,
            show_fields: true,
            show_multiplicity: true,
            show_primitive_types: true,
            title: '',
            theme: 'aws-orange'
        }
    });
    const [showGvOpts, setShowGvOpts] = useState(false);
    const [showPumlOpts, setShowPumlOpts] = useState(false);
    const [showTypeOptsCollapsed, setShowTypeOptsCollapsed] = useState(true);
    
    const isHexColor = (s: string) => /^#([0-9A-Fa-f]{6})$/.test(s);
    const validShapes: ShapeType[] = ['none', 'plain', 'ellipse'];

    const validation = useMemo(() => {
        const errs: string[] = [];
        const p = opts.gv.per_type_attrs || {};
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
                            <div className="modal-body p-1">
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

                                                        const currentValue = detailOptions.find(o => o.value === opts.gv.detail) || detailOptions[2];

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
                                                                                    setOpts({ ...opts, gv: { ...opts.gv, detail: sel.value as string } });
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
                                                                        const currentLink = linkOptions.find(o => o.value === opts.gv.link_horizontal) || linkOptions[0];
                                                                        return (
                                                                            <div style={{ minWidth: '8rem' }}>
                                                                                <SBSelect
                                                                                    id={'gvLinkOrientation'}
                                                                                    data={linkOptions}
                                                                                    value={currentLink}
                                                                                    onChange={(sel: Option | null) => {
                                                                                        if (sel && typeof sel === 'object' && 'value' in sel) {
                                                                                            // Map selection to boolean link_horizontal
                                                                                            setOpts({ ...opts, gv: { ...opts.gv, link_horizontal: Boolean(sel.value) } });
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
                                                            value={opts.gv.enums_allowed}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                const v = e.currentTarget.valueAsNumber;
                                                                const nv = Number.isFinite(v) ? Math.max(0, Math.trunc(v)) : 0;
                                                                setOpts({ ...opts, gv: { ...opts.gv, enums_allowed: nv } });
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
                                                                setOpts({ ...opts, gv: { ...opts.gv, show_links: e.currentTarget.checked } });
                                                            }}
                                                            checked={opts.gv.show_links} />
                                                        <label className="form-check-label" title="Show Links" htmlFor="gvShowLinksCheckbox">Show Links</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            id="gvShowLabelNameCheckbox"
                                                            name="gvShowLabelNameCheckbox"
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            onChange={(e) => {
                                                                setOpts({ ...opts, gv: { ...opts.gv, show_label_name: e.currentTarget.checked } });
                                                            }}
                                                            checked={opts.gv.show_label_name} />
                                                        <label className="form-check-label" title="Show Label Names" htmlFor="gvShowLinksCheckbox">Show Label Names</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            id="gvShowHeadLabelCheckbox"
                                                            name="gvShowHeadLabelCheckbox"
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            onChange={(e) => {
                                                                setOpts({ ...opts, gv: { ...opts.gv, show_headlabel: e.currentTarget.checked } });
                                                            }}
                                                            checked={opts.gv.show_headlabel} />
                                                        <label className="form-check-label" title="Show Head Labels" htmlFor="gvShowHeadLabelCheckbox">Show Head Labels</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            id="gvShowTailLabelCheckbox"
                                                            name="gvShowTailLabelCheckbox"
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            onChange={(e) => {
                                                                setOpts({ ...opts, gv: { ...opts.gv, show_taillabel: e.currentTarget.checked } });
                                                            }}
                                                            checked={opts.gv.show_taillabel} />
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
                                                                    {Object.keys(opts.gv.per_type_attrs || {}).map((tkey) => {
                                                                        const typeCfg = opts.gv.per_type_attrs[tkey] || { fillcolor: '#ffffff', shape: 'plain' };
                                                                        const shapeOptions: Option[] = [
                                                                            { label: 'None', value: 'none' },
                                                                            { label: 'Rectangle', value: 'plain' },
                                                                            { label: 'Ellipse', value: 'ellipse' }
                                                                        ];
                                                                        const currentShape = shapeOptions.find(s => s.value === typeCfg.shape) || shapeOptions[1];
                                                                        return (
                                                                            <div className="col-md-6 mb-2" key={tkey}>
                                                                                <div className="d-flex align-items-center">
                                                                                        <div style={{ minWidth: '3.25rem' }} className="me-2 small text-truncate" title={tkey}>{tkey === 'Enumerated' ? 'Enum' : tkey}</div>
                                                                                        <input
                                                                                            type="color"
                                                                                            title={`Fill color for ${tkey}`}
                                                                                            className="form-control form-control-color me-2"
                                                                                            style={{ width: '2.25rem', padding: 0 }}
                                                                                            value={typeCfg.fillcolor}
                                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                                        const newColor = e.currentTarget.value;
                                                                                                setOpts({ 
                                                                                                    ...opts, 
                                                                                                    gv: { 
                                                                                                        ...opts.gv, 
                                                                                                        per_type_attrs: { 
                                                                                                            ...opts.gv.per_type_attrs, 
                                                                                                            [tkey]: { 
                                                                                                                ...opts.gv.per_type_attrs[tkey], 
                                                                                                                fillcolor: newColor 
                                                                                                            } 
                                                                                                        } 
                                                                                                    } 
                                                                                                });
                                                                                    }} />
                                                                                        <div style={{ flex: '1 1 0', minWidth: 0 }}>
                                                                                        <SBSelect
                                                                                            id={`shape-${tkey}`}
                                                                                            data={shapeOptions}
                                                                                            value={currentShape}
                                                                                            onChange={(sel: any) => {
                                                                                                if (sel && typeof sel === 'object' && 'value' in sel) {
                                                                                                    const newShape = sel.value as ShapeType;
                                                                                                    setOpts({ 
                                                                                                        ...opts, 
                                                                                                        gv: { 
                                                                                                            ...opts.gv, 
                                                                                                            per_type_attrs: { 
                                                                                                                ...opts.gv.per_type_attrs, 
                                                                                                                [tkey]: { 
                                                                                                                    ...opts.gv.per_type_attrs[tkey], 
                                                                                                                    shape: newShape 
                                                                                                                } 
                                                                                                            } 
                                                                                                        } 
                                                                                                    });
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
                                            <div className="row">
                                                <div className="col">
                                                    {(() => {
                                                        const pumlDetailOptions: Option[] = [
                                                            { label: 'Conceptual', value: conc },
                                                            { label: 'Logical', value: logi },
                                                            { label: 'Informational', value: info }
                                                        ];

                                                        const currentValue = pumlDetailOptions.find(o => o.value === opts.puml.detail) || pumlDetailOptions[2];

                                                        return (
                                                            <div>
                                                                <div className="d-flex align-items-center">
                                                                    <label className="form-check-label mb-0 me-2" title="PlantUML Title" htmlFor="pumlTitleInput">Title</label>
                                                                    <input
                                                                        id="pumlTitleInput"
                                                                        name="pumlTitleInput"
                                                                        type="text"
                                                                        className="form-control form-control-sm"
                                                                        value={opts.puml.title}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                            setOpts({ ...opts, puml: { ...opts.puml, title: e.currentTarget.value } });
                                                                        }}
                                                                        placeholder="Enter title" />
                                                                </div>
                                                                <div className="mt-2 d-flex align-items-center">
                                                                    <label className="form-check-label mb-0 me-2" title="Detail" htmlFor="puml-detail-select">Detail</label>
                                                                    <div style={{ flex: '1 1 0', minWidth: 0 }}>
                                                                        <SBSelect
                                                                            id="puml-detail-select"
                                                                            data={pumlDetailOptions}
                                                                            onChange={(sel: Option | null) => {
                                                                                if (sel && typeof sel === 'object' && 'value' in sel) {
                                                                                    setOpts({ ...opts, puml: { ...opts.puml, detail: sel.value as string } });
                                                                                }
                                                                            }}
                                                                            value={currentValue}
                                                                            isSmStyle
                                                                            isClearable={false}
                                                                            ariaLabelledBy={'puml-detail-label'}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {/* visually-hidden label for screen readers */}
                                                                <span id="puml-detail-label" className="visually-hidden">plant uml detail level</span>
                                                                <div className="mt-2 d-flex align-items-center">
                                                                    <label className="form-check-label mb-0 me-2" title="PlantUML Theme" htmlFor="puml-theme-select">Theme</label>
                                                                    <div style={{ flex: '1 1 0', minWidth: 0 }}>
                                                                        {(() => {
                                                                            const themeOptions: Option[] = [
                                                                                { label: 'Amiga', value: 'amiga' },
                                                                                { label: 'AWS Orange', value: 'aws-orange' },
                                                                                { label: 'Black Knight', value: 'black-knight' },
                                                                                { label: 'Blue Gray', value: 'bluegray' },
                                                                                { label: 'Blueprint', value: 'blueprint' },
                                                                                { label: 'Carbon Gray', value: 'carbon-gray' },
                                                                                { label: 'Cerulean', value: 'cerulean' },
                                                                                { label: 'Cloudscape Design', value: 'cloudscape-design' },
                                                                                { label: 'CRT Amber', value: 'crt-amber' },
                                                                                { label: 'Cyborg', value: 'cyborg' },
                                                                                { label: 'Hacker', value: 'hacker' },
                                                                                { label: 'Light Gray', value: 'lightgray' },
                                                                                { label: 'Mars', value: 'mars' },
                                                                                { label: 'Materia', value: 'materia' },
                                                                                { label: 'Metal', value: 'metal' },
                                                                                { label: 'Mimeograph', value: 'mimeograph' },
                                                                                { label: 'Minty', value: 'minty' },
                                                                                { label: 'Mono', value: 'mono' },
                                                                                { label: 'None', value: '_none_' },
                                                                                { label: 'Plain', value: 'plain' },
                                                                                { label: 'Reddress Dark Blue', value: 'reddress-darkblue' },
                                                                                { label: 'Reddress Light Blue', value: 'reddress-lightblue' },
                                                                                { label: 'Sandstone', value: 'sandstone' },
                                                                                { label: 'Silver', value: 'silver' },
                                                                                { label: 'Sketchy', value: 'sketchy' },
                                                                                { label: 'Spacelab', value: 'spacelab' },
                                                                                { label: 'Sunlust', value: 'sunlust' },
                                                                                { label: 'Superhero', value: 'superhero' },
                                                                                { label: 'Toy', value: 'toy' },
                                                                                { label: 'United', value: 'united' },
                                                                                { label: 'Vibrant', value: 'vibrant' }
                                                                            ];

                                                                            const currentTheme = themeOptions.find(o => o.value === opts.puml.theme) || themeOptions.find(o => o.value === 'aws-orange');

                                                                            return (
                                                                                <SBSelect
                                                                                    id="puml-theme-select"
                                                                                    data={themeOptions}
                                                                                    onChange={(sel: Option | null) => {
                                                                                        if (sel && typeof sel === 'object' && 'value' in sel) {
                                                                                            setOpts({ ...opts, puml: { ...opts.puml, theme: sel.value as string } });
                                                                                        }
                                                                                    }}
                                                                                    value={currentTheme}
                                                                                    isSmStyle
                                                                                    isClearable={false}
                                                                                    ariaLabelledBy={'puml-theme-label'}
                                                                                />
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                                {/* visually-hidden label for screen readers */}
                                                                <span id="puml-theme-label" className="visually-hidden">PlantUML theme selection</span>
                                                            </div>
                                                        );
                                                    })()}                                              
                                                </div>                                                
                                                <div className="col">
                                                    <div className="form-check">

                                                    </div>
                                                    <div className="form-check">

                                                    </div>
                                                    <div className="form-check">

                                                    </div>
                                                    <div className="form-check">

                                                    </div>
                                                </div>                                                                                  
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

