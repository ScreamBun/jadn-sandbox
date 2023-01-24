import RunConformanceTests from "components/conformance/RunConformanceTests";
import ViewConformanceTests from "components/conformance/ViewConformanceTests";
import React, { useState } from "react";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";

const SchemaGenerator = (props: any) => {
    const { generatedSchema } = props;

    const [activeConformanceView, setActiveConformanceView] = useState('tests');

    return (
        <>
            <Nav tabs>
                <NavItem>
                    <NavLink
                        style={activeConformanceView == 'tests' ? { textDecoration: 'underline' } : { textDecoration: 'none' }}
                        onClick={() => setActiveConformanceView('tests')}>
                        Tests
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        style={activeConformanceView == 'test-results' ? { textDecoration: 'underline' } : { textDecoration: 'none' }}
                        onClick={() => setActiveConformanceView('test-results')}>
                        Tests Results
                    </NavLink>
                </NavItem>
            </Nav>

            <TabContent activeTab={activeConformanceView}>
                <TabPane tabId='tests'>
                    <div className='card'>
                        <div className='card-body p-0' style={{ height: '40em' }}>
                            <ViewConformanceTests />
                        </div>
                    </div>
                </TabPane>
                <TabPane tabId='test-results'>
                    <div className='card'>
                        <div className='card-body p-0' style={{ height: '40em' }}>
                            <RunConformanceTests schema={generatedSchema} />
                        </div>
                    </div>
                </TabPane>
            </TabContent>
        </>
    );
}

export default SchemaGenerator 