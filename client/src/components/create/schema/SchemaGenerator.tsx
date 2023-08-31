import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { Button, ButtonGroup, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap'
import { getPageTitle } from 'reducers/util'
import { info } from 'actions/util'
import SchemaCreator from './structure/editors/DragStyle/SchemaCreator'
import { dismissAllToast } from 'components/common/SBToast'
import { Option } from 'components/common/SBSelect'
import SchemaCreatorBtnStyle from './structure/editors/BtnStyle/SchemaCreatorBtnStyle'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const SchemaGenerator = () => {
    const dispatch = useDispatch();

    const [selectedSchemaFile, setSelectedSchemaFile] = useState<Option | null>();
    const [generatedSchema, setGeneratedSchema] = useState('');
    const [isButtonStyle, setIsButtonStyle] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const meta_title = useSelector(getPageTitle) + ' | Schema Creation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedSchemaFile(null);
        setGeneratedSchema('');
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

                            <Dropdown className='float-right' isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(prevState => !prevState)}>
                                <DropdownToggle size='sm' title='More Options...'>
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu >
                                    <DropdownItem header>Editor Style</DropdownItem>
                                    <ButtonGroup className='float-right'>
                                        <Button onClick={() => { setIsButtonStyle(false); setIsDropdownOpen(false); }} className='btn btn-sm m-1' color={isButtonStyle == false ? 'success' : ''}>Drag and Drop</Button>
                                        <Button onClick={() => { setIsButtonStyle(true); setIsDropdownOpen(false); }} className='btn btn-sm m-1' color={isButtonStyle == true ? 'success' : ''}>Button</Button>
                                    </ButtonGroup>
                                </DropdownMenu>
                            </Dropdown>

                            <Button color="danger" className='float-right ml-1 btn-sm' type="reset" onClick={onReset}>Reset</Button>

                        </div>
                        <div className='card-body p-2'>
                            {isButtonStyle ?
                                <SchemaCreatorBtnStyle
                                    selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile}
                                    generatedSchema={generatedSchema} setGeneratedSchema={setGeneratedSchema} /> :
                                <SchemaCreator
                                    selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile}
                                    generatedSchema={generatedSchema} setGeneratedSchema={setGeneratedSchema} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default SchemaGenerator 