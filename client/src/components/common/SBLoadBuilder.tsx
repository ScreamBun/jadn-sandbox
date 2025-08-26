import React, { useEffect, useState } from 'react';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SBSpinner from './SBSpinner';
import { sbToastError, sbToastSuccess, sbToastWarning } from './SBToast';
import { FILENAME_RULE } from 'components/utils/constants';
import { destructureField } from 'components/create/data/lib/utils';
import SBSelect from './SBSelect';

interface SBLoadBuilderProps { // Props for the load builder component
    customClass?: string;
    onLoad: (payload: { root: string | null; message: any; fields: any[]; name: string }) => void;
    fieldDefs: null | JSX.Element | JSX.Element[];
    selection?: { value: string; label: string } | null;
    generatedMessage?: any;
}

interface SavedBuilderEntry { // Props for a saved builder entry
    version?: number;
    saved_at?: string;
    root: string | null;
    message: any;
    fields: any[];
}

const STORAGE_KEY = 'sb_data_builders';

const SBLoadBuilder = (props: SBLoadBuilderProps) => {
    const { customClass, onLoad, fieldDefs, selection, generatedMessage } = props;
    const [toggleDialog, setToggleDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [savedItems, setSavedItems] = useState<{ name: string; data: SavedBuilderEntry }[]>([]);
    const [selectedName, setSelectedName] = useState('');
    // Save states
    const [fileNameInput, setFileNameInput] = useState('');
    const [existingNames, setExistingNames] = useState<string[]>([]);
    const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
    const [pendingOverwriteName, setPendingOverwriteName] = useState('');

    // Run if modal is opened or closed
    useEffect(() => {
        if (toggleDialog) {
            try {
                const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
                const entries = Object.keys(raw).map(name => ({ name, data: raw[name] as SavedBuilderEntry }))
                    .sort((a, b) => (a.name.localeCompare(b.name)));
                setSavedItems(entries);
                setExistingNames(Object.keys(raw));
            } catch (err) {
                setSavedItems([]);
                setExistingNames([]);
            }
        } else {
            // reset save form when closing
            setFileNameInput('');
            setShowOverwriteConfirm(false);
            setPendingOverwriteName('');
            setSelectedName('');
        }
    }, [toggleDialog]);

    const open = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setToggleDialog(true);
    };

    // Serialize field defs
    const serializeFields = (): any[] => {
        if (!fieldDefs) return [];
        const items = Array.isArray(fieldDefs) ? fieldDefs : [fieldDefs];
        return items.filter(React.isValidElement).map(el => {
            const { field, parent } = (el as any).props || {};
            let [_idx, name] = destructureField(field);
            const liveVal = generatedMessage && name in generatedMessage ? generatedMessage[name] : undefined;
            return {
                field,
                parent: parent || null,
                value: liveVal !== undefined ? liveVal : null
            };
        });
    };

    // Handle save fieldDefs
    const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const name = fileNameInput.trim().length > 0 ? fileNameInput.trim() : `${selection?.value}-${new Date().toLocaleDateString('en-CA')}`;
        if (!name) { sbToastWarning('Enter a name.'); return; }
        if (!FILENAME_RULE.test(name)) { sbToastWarning('Invalid name. Use letters, numbers, dash, underscore.'); return; }
        const rawFields = serializeFields();
        if (rawFields.length === 0) { sbToastWarning('No builder fields to save'); return; }
        try {
            const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            if (store[name] && !showOverwriteConfirm) {
                setPendingOverwriteName(name);
                setShowOverwriteConfirm(true);
                return;
            }
            store[name] = {
                version: 1,
                saved_at: new Date().toISOString(),
                root: selection?.value || null,
                message: generatedMessage || null,
                fields: rawFields
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
            sbToastSuccess(`Saved as ${name}`);
            // refresh list
            const entries = Object.keys(store).map(n => ({ name: n, data: store[n] as SavedBuilderEntry })).sort((a,b)=>a.name.localeCompare(b.name));
            setSavedItems(entries);
            setExistingNames(Object.keys(store));
            setShowOverwriteConfirm(false);
            setPendingOverwriteName('');
        } catch (err: any) {
            sbToastError(err?.message || 'Save failed');
        }
    };

    // Handle overwrite existing saved state
    const cancelOverwrite = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setShowOverwriteConfirm(false);
        setPendingOverwriteName('');
    };

    // Handle loading state
    const handleLoad = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!selectedName) {
            sbToastWarning('Select a saved builder.');
            return;
        }
        const entry = savedItems.find(i => i.name === selectedName);
        if (!entry) {
            sbToastError('Selected builder not found.');
            return;
        }
        // Enforce that a root is selected and matches the saved builder's root before loading
        const savedRoot = entry.data.root;
        if (savedRoot) {
            if (!selection || !selection.value) {
                sbToastError(`Select root "${savedRoot}" before loading this builder.`);
                return;
            }
            if (selection.value !== savedRoot) {
                sbToastError(`Root mismatch: current root "${selection.value}" vs saved "${savedRoot}".`);
                return;
            }
        } else {
            sbToastError('Saved builder is missing root metadata.');
            return;
        }
        setIsLoading(true);
        try {
            onLoad({ root: entry.data.root, message: entry.data.message, fields: entry.data.fields, name: selectedName });
            sbToastSuccess(`Loaded builder ${selectedName}`);
            setToggleDialog(false);
        } catch (err: any) {
            sbToastError(err?.message || 'Failed to load builder');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle deleting state
    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!selectedName) {
            sbToastWarning('Select a saved builder to delete.');
            return;
        }
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            if (!raw[selectedName]) {
                sbToastWarning('Item already removed.');
            } else {
                delete raw[selectedName];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
                setSavedItems(prev => prev.filter(p => p.name !== selectedName));
                sbToastSuccess(`Deleted ${selectedName}`);
                setSelectedName('');
            }
        } catch (err:any) {
            sbToastError(err?.message || `Failed to delete ${selectedName}`);
        }
    };

    return (
        <>
            {isLoading ? <SBSpinner color={'primary'} /> : (
                <button type='button' id='loadSaveBuilder' title='Load / Save Builder' className={'btn btn-primary btn-sm ' + (customClass || '')} onClick={open}>
                    <FontAwesomeIcon icon={faFolderOpen} />
                </button>
            )}

            <div id='loadBuilderModal' className={`modal fade ${toggleDialog ? 'show d-block' : 'd-none'}`} tabIndex={-1} role='dialog'>
                <div className='modal-dialog modal-lg modal-dialog-centered' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Load / Save Builder</h5>
                            <button type='button' className='btn-close' title='Close' onClick={() => setToggleDialog(false)} />
                        </div>
                        <div className='modal-body'>
                            <div className='row'>
                                <div className='col-md-6 border-end'>
                                    <h6>Save Current</h6>
                                    <div className='mb-2'>
                                        <label htmlFor='builderSaveName' className='form-label small'>Name</label>
                                        <input id='builderSaveName' className='form-control form-control-sm' type='text' value={fileNameInput} placeholder={`${selection?.value}-${new Date().toLocaleDateString('en-CA')}`}
                                            onChange={(e)=>{setFileNameInput(e.target.value); setShowOverwriteConfirm(false);}} />
                                    </div>
                                    {existingNames.length > 0 && (
                                        <div className='mb-2'>
                                            <label className='form-label small'>Existing</label>
                                            <SBSelect
                                                value={existingNames
                                                    .map(item => ({ label: item, value: item }))
                                                    .find(opt => opt.value === fileNameInput) || null}
                                                onChange={(option: any) => {setFileNameInput(option ? option.value : ''); setShowOverwriteConfirm(false);}}
                                                data={existingNames.map(item => ({
                                                    label: item,
                                                    value: item
                                                }))}
                                                isClearable
                                                isSmStyle
                                                placeholder="Select existing builder"
                                            />
                                        </div>
                                    )}
                                    {!showOverwriteConfirm && <button type='button' className='btn btn-success btn-sm' onClick={handleSave} disabled={!fieldDefs}>Save</button>}
                                    {showOverwriteConfirm && (
                                        <div className='alert alert-danger p-2 mt-2'>
                                            Overwrite <strong>{pendingOverwriteName}</strong>?<br/>
                                            <div className='mt-2 d-flex gap-2'>
                                                <button className='btn btn-sm btn-danger' onClick={handleSave}>Confirm</button>
                                                <button className='btn btn-sm btn-secondary' onClick={cancelOverwrite}>Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className='col-md-6'>
                                    <h6>Load Saved</h6>
                                    {savedItems.length === 0 ? (
                                        <div className='text-muted small'>No saved builders found.</div>
                                    ) : (
                                        <div className='mb-2'>
                                            <label htmlFor='savedBuilderSelect' className='form-label small'>Saved Builders</label>
                                            <SBSelect
                                                id='savedBuilderSelect'
                                                value={savedItems
                                                    .map(item => ({ label: item.name, value: item.name }))
                                                    .find(opt => opt.value === selectedName) || null}
                                                onChange={(option: any) => setSelectedName(option ? option.value : '')}
                                                data={savedItems.map(item => ({
                                                    label: item.name,
                                                    value: item.name
                                                }))}
                                                isClearable
                                                isSmStyle
                                                placeholder="Select saved builder"
                                            />
                                            {selectedName && (
                                                <div className='mt-1 small text-muted'>
                                                    Saved: {new Date(savedItems.find(i => i.name === selectedName)?.data.saved_at || '').toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-success btn-sm' disabled={!selectedName} onClick={handleLoad}>Load</button>
                            <button type='button' className='btn btn-outline-danger btn-sm' disabled={!selectedName} onClick={handleDelete}>Delete</button>
                            <button type='button' className='btn btn-secondary btn-sm' onClick={() => setToggleDialog(false)}>Close</button>
                        </div>
                    </div>
                </div>
                <div className={`modal-backdrop fade ${toggleDialog ? 'show' : ''}`} style={{ zIndex: -1 }} />
            </div>
        </>
    );
};

export default SBLoadBuilder;