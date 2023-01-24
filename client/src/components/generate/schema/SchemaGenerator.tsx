import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { Button, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import SchemaCreator from './SchemaCreator'
import { getPageTitle } from 'reducers/util'
import { info } from 'actions/util'
import SchemaConformance from './SchemaConformance'


const SchemaGenerator = () => {
    const dispatch = useDispatch();

    const [activeView, setActiveView] = useState('editor');
    const [selectedSchemaFile, setSelectedSchemaFile] = useState('');
    const [generatedSchema, setGeneratedSchema] = useState(
        {
            types: []
        });

    const meta_title = useSelector(getPageTitle) + ' | Generate Schema'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setGeneratedSchema({
            types: []
        })
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
                            <h5 className='m-0'> Generate Schema</h5>
                        </div>
                        <div className='card-body p-2'>
                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        style={activeView == 'editor' ? { textDecoration: 'underline' } : { textDecoration: 'none' }}
                                        onClick={() => setActiveView('editor')}>
                                        Creator
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        style={activeView == 'conformance' ? { textDecoration: 'underline' } : { textDecoration: 'none' }}
                                        onClick={() => setActiveView('conformance')}>
                                        Conformance
                                    </NavLink>
                                </NavItem>
                            </Nav>
                            <TabContent activeTab={activeView}>
                                <TabPane tabId='editor'>
                                    <SchemaCreator
                                        selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile}
                                        generatedSchema={generatedSchema} setGeneratedSchema={setGeneratedSchema} />
                                </TabPane>
                                <TabPane tabId='conformance'>
                                    <SchemaConformance
                                        generatedSchema={generatedSchema} />
                                </TabPane>
                            </TabContent>
                        </div>
                        <div className='card-footer p-2'>
                            <Button color="danger" className='float-right ml-1' type="reset" onClick={onReset}>Reset</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default SchemaGenerator 