
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Button, TabContent, TabPane } from "reactstrap";
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
                            <h5 className='m-0' style={{ display: 'inline' }}> Schema Conformance </h5>
                            <Button color="danger" className='float-right ml-1 btn-sm' type="reset" onClick={onReset}>Reset</Button>
                            <Button onClick={() => setActiveView('tests')} className={`float-right btn-sm m1-1 ${activeView == 'tests' ? ' d-none' : ''}`} color="info">View Tests</Button>
                            <Button onClick={() => setActiveView('test-results')} className={`float-right btn-sm m1-1 ${activeView == 'test-results' ? ' d-none' : ''}`} color="info">View Test Results</Button>
                        </div>
                        <div className='card-body p-0' style={{ height: '40em', overflowY: 'auto' }}>
                            <TabContent activeTab={activeView}>
                                <TabPane tabId='tests'>
                                    <ViewConformanceTests />
                                </TabPane>

                                <TabPane tabId='test-results'>
                                    <RunConformanceTests selectedFile={selectedSchemaFile} setSelectedFile={setSelectedSchemaFile} />
                                </TabPane>
                            </TabContent>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SchemaGenerator 