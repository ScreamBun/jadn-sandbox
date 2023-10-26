import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getValidFormatOpts } from 'actions/format'
import { info } from 'actions/util'
import { getPageTitle } from 'reducers/util'
import { dismissAllToast } from 'components/common/SBToast'
import { Option } from 'components/common/SBSelect'
import SchemaCreator from './structure/editors/DragStyle/SchemaCreator'
import SchemaCreatorBtnStyle from './structure/editors/BtnStyle/SchemaCreatorBtnStyle'
import { DragItem } from './structure/editors/DragStyle/SBOutline'

const SchemaGenerator = () => {
    const dispatch = useDispatch();

    const [selectedSchemaFile, setSelectedSchemaFile] = useState<Option | null>();
    const [generatedSchema, setGeneratedSchema] = useState('');
    const [cardsState, setCardsState] = useState<DragItem[]>([]);
    const [isButtonStyle, setIsButtonStyle] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const meta_title = useSelector(getPageTitle) + ' | Schema Creation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
        dispatch(getValidFormatOpts());
        dismissAllToast();
    }, [dispatch])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedSchemaFile(null);
        setGeneratedSchema('');
        setCardsState([]);
    }

    return (
        <div>
            <Helmet>
                <title>{meta_title}</title>
                <link rel="canonical" href={meta_canonical} />
            </Helmet>
            <div className='row'>
                <div className='col-md-12'>
                    <div className='card'>
                        <div className='card-header p-2'>
                            <h5 style={{ display: 'inline' }}><span className='align-middle'>Schema Creation</span></h5>

                            <div className='btn-group float-end'>
                                <button type='reset' className='btn btn-sm btn-danger ms-1' onClick={onReset}>Reset</button>
                                <div className='dropdown'>
                                    <button className="btn btn-sm btn-secondary"
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
                                    <ul className={`dropdown-menu dropdown-menu-right ${isDropdownOpen ? 'show' : ''}`} aria-labelledby="dropdownMenuButton">
                                        <li><h6 className="dropdown-header">Editor Style</h6></li>
                                        <li><a href="#" onClick={() => { setIsButtonStyle(false); setIsDropdownOpen(false); }} className={`dropdown-item ${isButtonStyle == false ? 'active' : ''}`}>Drag and Drop</a></li>
                                        <li><a href="#" onClick={() => { setIsButtonStyle(true); setIsDropdownOpen(false); }} className={`dropdown-item ${isButtonStyle == true ? 'active' : ''}`}>Button</a></li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                        <div className='card-body p-2'>
                            {isButtonStyle ?
                                <SchemaCreatorBtnStyle
                                    selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile}
                                    generatedSchema={generatedSchema} setGeneratedSchema={setGeneratedSchema}
                                    cardsState={cardsState} setCardsState={setCardsState} /> :
                                <SchemaCreator
                                    selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile}
                                    generatedSchema={generatedSchema} setGeneratedSchema={setGeneratedSchema}
                                    cardsState={cardsState} setCardsState={setCardsState} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default SchemaGenerator 