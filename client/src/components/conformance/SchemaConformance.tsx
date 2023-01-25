
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Button, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import RunConformanceTests from "components/conformance/RunConformanceTests";
import ViewConformanceTests from "components/conformance/ViewConformanceTests";
import { getPageTitle } from "reducers/util";
import { info } from "actions/util";

const SchemaGenerator = () => {
    const dispatch = useDispatch();

    const [selectedSchemaFile, setSelectedSchemaFile] = useState('');
    const [activeView, setActiveView] = useState('tests');

    const meta_title = useSelector(getPageTitle) + ' | Generate Schema'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedSchemaFile('');
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
                            <h5 className='m-0'> Schema Conformance </h5>
                        </div>
                        <div className='card-body p-2'>
                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        style={activeView == 'tests' ? { textDecoration: 'underline' } : { textDecoration: 'none' }}
                                        onClick={() => setActiveView('tests')}>
                                        Tests
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        style={activeView == 'test-results' ? { textDecoration: 'underline' } : { textDecoration: 'none' }}
                                        onClick={() => setActiveView('test-results')}>
                                        Tests Results
                                    </NavLink>
                                </NavItem>
                            </Nav>

                            <TabContent activeTab={activeView}>
                                <TabPane tabId='tests'>
                                    <div className='card'>
                                        <div className='card-body p-0' style={{ height: '40em', overflowY: 'auto' }}>
                                            <ViewConformanceTests />
                                        </div>
                                    </div>
                                </TabPane>

                                <TabPane tabId='test-results'>
                                    <div className='card'>
                                        <div className='card-body p-0' style={{ height: '40em', overflowY: 'auto' }}>
                                            <RunConformanceTests selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile} />
                                        </div>
                                    </div>
                                </TabPane>
                            </TabContent>
                        </div>
                        <div className='card-footer p-2'>
                            <Button color="danger" className='float-right ml-1 btn-sm' type="reset" onClick={onReset}>Reset</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SchemaGenerator 