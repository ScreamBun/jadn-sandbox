import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getValidFormatOpts } from 'actions/format'
import { info, setFile } from 'actions/util'
import { getPageTitle, getSelectedFile, getSelectedSchema } from 'reducers/util'
import { dismissAllToast } from 'components/common/SBToast'
import { Option } from 'components/common/SBSelect'
import { SBConfirmModal } from 'components/common/SBConfirmModal';
import { DragItem } from './structure/editors/DragStyle/SBOutline'
import { SchemaCreatorBtnStyle } from './structure/editors/BtnStyle/SchemaCreatorBtn'
import { SchemaCreatorDndStyle } from './structure/editors/DragStyle/SchemaCreatorDnd'
import { clearDuplicate } from 'actions/duplicate';
import { useNavigate } from 'react-router'

const SchemaGenerator = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const loadedSchema = useSelector(getSelectedSchema);
    const selectedSchemaFile = useSelector(getSelectedFile);
    const setSelectedSchemaFile = (file: Option | null) => {
        dispatch(setFile(file));
    }

    const [generatedSchema, setGeneratedSchema] = useState<object | ''>(loadedSchema);
    const [cardsState, setCardsState] = useState<DragItem[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [isButtonStyle, setIsButtonStyle] = useState(false);

    const [infoCollapse, setInfoCollapse] = useState(false);
    const [typesCollapse, setTypesCollapse] = useState(false);
    const [allFieldsCollapse, setAllFieldsCollapse] = useState(false);
    const [fieldCollapseState, setFieldCollapseState] = useState<Boolean[]>([]);
    const fieldCollapseStateRef = useRef<Boolean[]>(fieldCollapseState);

    const meta_title = useSelector(getPageTitle) + ' | Schema Creation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
        // @ts-expect-error
        dispatch(getValidFormatOpts());
        dismissAllToast();
    }, [dispatch])

    const handleDataCreation = () => {
        navigate('/create/data');
    }

    // If a global schema exists and local state is empty, set it so the HOC can build cards
    useEffect(() => {
        if (loadedSchema) {
            setGeneratedSchema(loadedSchema);
            setCardsState([]);
            setFieldCollapseState([]);
        } else {
            setGeneratedSchema('');
            setCardsState([]);
            setFieldCollapseState([]);
        }
    }, [loadedSchema]);

    // When duplicate item is set in store, add a new card at end with "{name} copy"
    const duplicatedItem = useSelector((state: any) => state.Duplicate?.item);
    useEffect(() => {
        if (!duplicatedItem) return;

        const src = duplicatedItem;
        const nextName = src.name ? `${src.name}Copy` : 'Copy';
        const newTypeObject = { ...src, name: nextName };

        const isStructure = Array.isArray(newTypeObject.fields) && newTypeObject.fields.length >= 0;
        const valueArray = isStructure
            ? [
                newTypeObject.name,
                newTypeObject.type,
                newTypeObject.options || [],
                newTypeObject.comment || '',
                newTypeObject.fields || []
            ]
            : [
                newTypeObject.name,
                newTypeObject.type,
                newTypeObject.options || [],
                newTypeObject.comment || ''
            ];

        setGeneratedSchema((prev: any) => {
            const prevTypes = prev?.types || [];
            const newTypes = [...prevTypes, valueArray];
            return { ...(prev || {}), types: newTypes };
        });

        setCardsState((prevCards: any[]) => {
            const newCard = {
                id: self.crypto?.randomUUID ? self.crypto.randomUUID() : Math.random().toString(36).slice(2),
                index: prevCards.length,
                text: newTypeObject.name,
                value: valueArray,
                isStarred: false,
            };
            return [...prevCards, newCard];
        });

        setFieldCollapseState((prev: any[]) => ([...prev, isStructure ? false : undefined]));

        dispatch(clearDuplicate());
    }, [duplicatedItem]);

    const onResetItemClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsConfirmModalOpen(true);
    };

    const resetSchema = (response: boolean) => {
        setIsConfirmModalOpen(false);
        if (response == true) {
            dismissAllToast();
            setSelectedSchemaFile(null);
            setGeneratedSchema('');
            setCardsState([]);
        }
    }

    return (
        <>
            <div>
                <Helmet>
                    <title>{meta_title}</title>
                    <link rel="canonical" href={meta_canonical} />
                </Helmet>
                <div className='row'>
                    <div className='col-md-12'>
                        <div className='card'>
                            <div className='card-header bg-secondary p-2'>
                                <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Schema Creation</span></h5>
                                <div className="btn-toolbar float-end" role="toolbar" aria-label="Toolbar with button groups">
                                    <div className="me-2" role="group" aria-label="First group">
                                        <button type="button" className="btn btn-sm btn-primary me-2" onClick={handleDataCreation}>Data Creation</button>
                                        <button type="reset" className="btn btn-sm btn-danger border-0" onClick={onResetItemClick}>Reset</button>
                                    </div>
                                    <div className="btn-group" role="group" aria-label="Third group">
                                        <div className='dropdown'>
                                            <button className="btn btn-sm btn-primary"
                                                type="button"
                                                id="dropdownMenuButton"
                                                data-bs-toggle="dropdown"
                                                data-bs-display="static"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                                title='More Options...'
                                                onClick={() => setIsDropdownOpen(prevState => !prevState)} >
                                                <FontAwesomeIcon icon={faEllipsisV} />
                                            </button>
                                            <ul className={`dropdown-menu dropdown-menu-end ${isDropdownOpen ? 'show' : ''}`} aria-labelledby="dropdownMenuButton">
                                                <li><h6 className="dropdown-header">Editor Style</h6></li>
                                                <li><a href="#" onClick={() => { setIsButtonStyle(false); setIsDropdownOpen(false); }} className={`dropdown-item ${isButtonStyle == false ? 'active' : ''}`}>Drag and Drop</a></li>
                                                <li><a href="#" onClick={() => { setIsButtonStyle(true); setIsDropdownOpen(false); }} className={`dropdown-item ${isButtonStyle == true ? 'active' : ''}`}>Button</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='card-body p-2'>
                                {isButtonStyle ? <SchemaCreatorBtnStyle
                                    selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile}
                                    generatedSchema={generatedSchema} setGeneratedSchema={setGeneratedSchema}
                                    cardsState={cardsState} setCardsState={setCardsState}
                                    fieldCollapseState={fieldCollapseState}
                                    setFieldCollapseState={setFieldCollapseState}
                                    allFieldsCollapse={allFieldsCollapse}
                                    setAllFieldsCollapse={setAllFieldsCollapse}
                                    infoCollapse={infoCollapse}
                                    setInfoCollapse={setInfoCollapse}
                                    typesCollapse={typesCollapse}
                                    setTypesCollapse={setTypesCollapse}
                                    fieldCollapseStateRef={fieldCollapseStateRef} /> :
                                    <SchemaCreatorDndStyle
                                        selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile}
                                        generatedSchema={generatedSchema} setGeneratedSchema={setGeneratedSchema}
                                        cardsState={cardsState} setCardsState={setCardsState}
                                        fieldCollapseState={fieldCollapseState}
                                        setFieldCollapseState={setFieldCollapseState}
                                        allFieldsCollapse={allFieldsCollapse}
                                        setAllFieldsCollapse={setAllFieldsCollapse}
                                        infoCollapse={infoCollapse}
                                        setInfoCollapse={setInfoCollapse}
                                        typesCollapse={typesCollapse}
                                        setTypesCollapse={setTypesCollapse}
                                        fieldCollapseStateRef={fieldCollapseStateRef} />
                                }

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SBConfirmModal
                isOpen={isConfirmModalOpen}
                title={`Reset Schema`}
                message={`Are you sure you want to reset the Schema?`}
                onResponse={resetSchema}>
            </SBConfirmModal>
        </>
    );
}
export default SchemaGenerator 