// Dependencies
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons/faClipboardCheck';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
Button, Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';

// Module Specific
import { getAllConformanceTests, runConformanceTest } from './Api';

interface StatsInterface {
  stats : {
    overall: {
      total: 0,
      error: 0,
      failure: 0,
      success: 0,
      expected_failure: 0,
      skipped: 0,
      unexpected_success: 0
    }
  },
  language : {
    success: { [key: string]: string },
    expected_failure: { [key: string]: string },
    skipped: { [key: string]: string },
    unexpected_success: { [key: string]: string },
    failure: { [key: string]: string },
    error: { [key: string]: string }
  },
  slpf : {
    success: { [key: string]: string },
    expected_failure: { [key: string]: string },
    skipped: { [key: string]: string },
    unexpected_success: { [key: string]: string },
    failure: { [key: string]: string },
    error: { [key: string]: string }
  }
}

const SUCCESS = 'success';
const EXPECTED_FAILURE = 'expected_failure';
const SKIPPED = 'skipped';
const UNEXPECTED_SUCCESS = 'unexpected_success';
const FAILURE = 'failure';
const ERROR = 'error';

const StatsObj = {
  stats : {
    overall: {
      total: 0,
      error: 0,
      failure: 0,
      success: 0,
      expected_failure: 0,
      skipped: 0,
      unexpected_success: 0
    }
  },
  language : {
    success: {},
    expected_failure: {},
    skipped: {},
    unexpected_success: {},
    failure: {},
    error: {}
  },
  slpf : {
    success: {},
    expected_failure: {},
    skipped: {},
    unexpected_success: {},
    failure: {},
    error: {}
  }
};

const PrettyPrintJson = (props: any) => {
  const { data } = props;
  return (<div><pre>{ JSON.stringify(data, null, 2) }</pre></div>);
};

const ListItemWithBadge = (props: any) => {
  const { itemLabel, itemValue, bsBadgeType } = props;
  const badgeClasses = `badge ${  bsBadgeType  } badge-pill`;
  return (
    <li className="list-group-item d-flex justify-content-between align-items-center">
      { itemLabel }
      <span className={ badgeClasses }>
        { itemValue }
      </span>
    </li>
  );
};

const TabTitleWithBadge = (props: any) => {
  const { tabTitle, badgeValue, badgeType } = props;
  const badgeClasses = `badge ${  badgeType  } badge-pill ml-2`;
  return (
    <span className="d-flex justify-content-between align-items-center">
      { tabTitle }
      <span className={ badgeClasses }>
        { badgeValue }
      </span>
    </span>
  );
};

const TestsPassedContent = (props: any) => {
  const { profileType, results } = props;
  let resultsData = StatsObj.language;

  if (results.language && (profileType === 'language' || profileType === 'language-any')) {
    resultsData = results.language;
  } else if (results.slpf && (profileType === 'slpf' || profileType === 'slpf-any')) {
    resultsData = results.slpf;
  }

  // let testData: string[] = [];
  // // eslint-disable-next-line no-restricted-syntax
  // for (const [k, v] of Object.entries(resultsData.success)) {
  //   const stringData = `${k  } ${  v}`;
  //   testData.push(stringData);
    // return (
    //   <li key={ k } className='list-group-item'>
    //     <span className='mr-2'>{ k }</span>
    //     <span>{ v }</span>
    //   </li>
    // );
  // }

  return (
    <ul className='list-group list-group-flush'>
      { Object.keys(resultsData.success).map((key) => {
        return (
          <li key={ key } className='list-group-item p-1'>{ key }</li>
        );
      })}
    </ul>
  );
};

const emptyObj: [] = [];
const RunConformanceTests = (props: any) => {

  const [profilesOptions, setProfilesOptions] = useState([] as string[]);
  const [profileSelection, setProfileSelection] = useState('');
  const [schemaToTest, setSchemaToTest] = useState({});
  const [testResults, setTestResults] = useState(StatsObj);
  const [activeTab, setActiveTab] = useState(SUCCESS);

  const { schema = emptyObj } = props;

  useMemo( () => {
    setSchemaToTest(schema);
  }, [schema]);

  const setProfileTypes = (profilesTypes: string[]) => {
      if (profilesTypes && profilesTypes.length > 0) {
        profilesTypes.map((langProfile: string) => {
            setProfilesOptions(current => [...current, langProfile]);
            return langProfile;
        });
      }
  };

  useEffect(() => {
      getAllConformanceTests()
          .then((confTestData: any) => {
              if (confTestData) {
                // TODO: May need a loop here to dynamically grab more tests
                if (confTestData.Language_UnitTests && confTestData.Language_UnitTests.profiles) {
                  setProfileTypes(confTestData.Language_UnitTests.profiles);
                }
                if (confTestData.SLPF_UnitTests && confTestData.SLPF_UnitTests.profiles) {
                  setProfileTypes(confTestData.SLPF_UnitTests.profiles);
                }
              }
              return true;
          }).catch((_err:any) => {
              console.log(_err);
          });
  }, []);

  const calcStats = (returnData: StatsInterface) => {
    setTestResults(returnData);
  };

  const onRunTests = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let isValid = true;
    if (!profileSelection) {
        toast('A Profile Type is required', {type: toast.TYPE.ERROR});
        isValid = false;
    }

    if (!schemaToTest) {
        toast('A Schema is required', {type: toast.TYPE.ERROR});
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    runConformanceTest(profileSelection, schemaToTest)
      .then(returnData => {
          if (returnData) {
            calcStats(returnData);
          }
          return true;
      }).catch((_err:any) => {
          console.log(_err);
      });
  };

  const onProfileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setProfileSelection(e.target.value);
  };

  const onToggleTabs = (view: string) => {
    if (activeTab !== view) {
      setActiveTab(view);
    }
  };

  return (
    <div>
      <div className='row'>
        <div className='col'>
          <form onSubmit={ onRunTests }>
            <div className='btn-group' role='group'>
              <select required value={ profileSelection } onChange={ onProfileTypeChange }>
                <option value=''>Select a Profile Type</option>
                { profilesOptions.map((option) => (
                  <option key={ option } value={ option }>{ option }</option>
                  ))}
              </select>
              <div className='btn-group'>
                <Button id='runTests' type='submit' color={ SUCCESS }>
                  <FontAwesomeIcon className='mr-2' icon={ faClipboardCheck } color='white' />
                  Run Tests
                </Button>
              </div>
            </div>
            <span className='badge badge-info badge-pill ml-2 p-2'>
              <span className='mr-2'>Total Test Results</span>
              { testResults.stats.overall.total }
            </span>
          </form>
        </div>
      </div>
      <div className='row mt-2'>
        <div className='col'>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={ classnames({active: activeTab === SUCCESS}) }
                onClick={ () => onToggleTabs(SUCCESS) }
              >
                <TabTitleWithBadge tabTitle='Success' badgeValue={ testResults.stats.overall.success } badgeType='badge-success' />
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={ classnames({active: activeTab === EXPECTED_FAILURE}) }
                onClick={ () => onToggleTabs(EXPECTED_FAILURE) }
              >
                <TabTitleWithBadge tabTitle='Expected Failure' badgeValue={ testResults.stats.overall.failure } badgeType='badge-success' />
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={ classnames({active: activeTab === SKIPPED}) }
                onClick={ () => onToggleTabs(SKIPPED) }
              >
                <TabTitleWithBadge tabTitle='Skipped' badgeValue={ testResults.stats.overall.skipped } badgeType='badge-secondary' />
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={ classnames({active: activeTab === UNEXPECTED_SUCCESS}) }
                onClick={ () => onToggleTabs(UNEXPECTED_SUCCESS) }
              >
                <TabTitleWithBadge tabTitle='Unexpected Success' badgeValue={ testResults.stats.overall.unexpected_success } badgeType='badge-warning' />
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={ classnames({active: activeTab === FAILURE}) }
                onClick={ () => onToggleTabs(FAILURE) }
              >
                <TabTitleWithBadge tabTitle='Failure' badgeValue={ testResults.stats.overall.failure } badgeType='badge-danger' />
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={ classnames({active: activeTab === ERROR}) }
                onClick={ () => onToggleTabs(ERROR) }
              >
                <TabTitleWithBadge tabTitle='Error' badgeValue={ testResults.stats.overall.error } badgeType='badge-danger' />
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={ classnames({active: activeTab === 'json'}) }
                onClick={ () => onToggleTabs('json') }
              >
                JSON
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={ activeTab }>
            <TabPane tabId={ SUCCESS }>
              <div className='card'>
                <div className='card-body'>
                  <TestsPassedContent profileType={ profileSelection } results={ testResults } />
                </div>
              </div>
            </TabPane>
            <TabPane tabId={ EXPECTED_FAILURE }>
              <div className='card'>
                <div className='card-body'>
                  expected_failure Content goes here....
                </div>
              </div>
            </TabPane>
            <TabPane tabId={ SKIPPED }>
              <div className='card'>
                <div className='card-body'>
                  skipped Content goes here....
                </div>
              </div>
            </TabPane>
            <TabPane tabId={ UNEXPECTED_SUCCESS }>
              <div className='card'>
                <div className='card-body'>
                  unexpected_success Content goes here....
                </div>
              </div>
            </TabPane>
            <TabPane tabId={ FAILURE }>
              <div className='card'>
                <div className='card-body'>
                  failure Content goes here....
                </div>
              </div>
            </TabPane>
            <TabPane tabId={ ERROR }>
              <div className='card'>
                <div className='card-body'>
                  error Content goes here....
                </div>
              </div>
            </TabPane>
            <TabPane tabId='json'>
              <div className='card'>
                <div className='card-body'>
                  <PrettyPrintJson data={ testResults } />
                </div>
              </div>
            </TabPane>
          </TabContent>
        </div>
      </div>
    </div>
    );
};

export default RunConformanceTests;