// Dependencies
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons/faClipboardCheck';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
Button, Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import split from 'lodash/split';
import {
 Chart as ChartJS, ArcElement, Tooltip, Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Module Specific
import { getAllConformanceTests, runConformanceTest } from './Api';
import ConformanceChart from './ConformanceChart';


const LANGUAGE = 'language';
const LANGUAGE_ANYTHING = 'language-anything';
const SLPF = 'slpf';
const SLPF_ANYTHING = 'slpf-anything';
const SUCCESS = 'success';
const EXPECTED_FAILURE = 'expected_failure';
const SKIPPED = 'skipped';
const UNEXPECTED_SUCCESS = 'unexpected_success';
const FAILURE = 'failure';
const ERROR = 'error';
const TEST_RESULT_DELIMITER = '->';

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

const initChartData = {
  labels: ['Success', 'expected_failure', 'skipped', 'unexpected_success', 'failure', 'error'],
  datasets: [
    {
      label: 'Test Results',
      data: [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }
  ]
};

// TODO: Move to a utils class
const PrettyPrintJson = (props: any) => {
  const { data } = props;
  return (<div><pre>{ JSON.stringify(data, null, 2) }</pre></div>);
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

class TestResult {
  title = '';
  details: string[] = [''];

  constructor(title?: string, details?: string[]) {
    if (title) {
      this.title= title;
    }
    if (details) {
      this.details = details;
    }
  }
}

const convertAndFormat = (data: any) => {
  if (!data || isEmpty(data)) {
    return null;
  }

  const dataToFormat = data;
  const testResults: TestResult[] = [];
  map(dataToFormat, (value, key) => {
    const testResult = new TestResult();

    if (key && value) {
      const resultsArray = split(value, TEST_RESULT_DELIMITER);
      // eslint-disable-next-line prefer-destructuring
      testResult.title = resultsArray[0];
      map(resultsArray, (rValue, rKey) => {
        if (rKey !== 0) {
          testResult.details.push(rValue);
        }
      });

    } else {
      testResult.title = key;
    }

    testResults.push(testResult);
  });

  return testResults;
};

const getDataFromNestedObject = (data: any, path: string) => {
  if (!data || isEmpty(data) || !path) {
    return null;
  }

  const returnVal = get(data, path);
  if (!returnVal || isEmpty(returnVal)) {
    return null;
  }

  return returnVal;
};

const TestContent = (props: any) => {
  const { profileType, allResults, resultType } = props;

  if (!resultType || isEmpty(allResults) || (isEmpty(allResults.language) && isEmpty(allResults.slpf))) {
    return (
      <span>No results</span>
    );
  }

  ChartJS.register(ArcElement, Tooltip, Legend);

  let path = '';
  if (allResults.language && (profileType === LANGUAGE || profileType === LANGUAGE_ANYTHING)) {
    path = `${LANGUAGE}.${resultType}`;
  } else if (allResults.slpf && (profileType === SLPF || profileType === SLPF_ANYTHING)) {
    path = `${SLPF}.${resultType}`;
  }

  const specificResults = getDataFromNestedObject(allResults, path);
  const formattedTestResults = convertAndFormat(specificResults);
  if (!formattedTestResults || isEmpty(formattedTestResults)) {
    return (
      <span>No results</span>
    );
  }

  return (
    <ul className='list-group list-group-flush'>
      { map(formattedTestResults, (testResult, z) => {
        return (
          <li key={ z } className='list-group-item p-1'>
            <span className='font-weight-bold'>
              { testResult.title }
            </span>
            <ul className='list-group list-group-flush'>
              { map(testResult.details, (detail, x) => {
                return (
                  <li key={ x } className='list-group-item p-1'>
                    <span>
                      { detail }
                    </span>
                  </li>
                );
              })}
            </ul>
          </li>
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
  const [chartData, setChartData] = useState(initChartData);

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
                // TODO: May need a loop here to dynamically grab different schema types
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

    setTestResults(StatsObj);
    runConformanceTest(profileSelection, schemaToTest)
      .then(returnData => {
          if (returnData) {
            setTestResults(returnData);

            const statsData = [];
            const labelData = ['Success', 'expected_failure', 'skipped', 'unexpected_success', 'failure', 'error'];
            // eslint-disable-next-line no-restricted-syntax
            for (const dataObj of returnData.stats.overall) {
              statsData.push(dataObj);
            }

            // TODO: Left off trying to show a chart

            setChartData({
                labels: labelData,
                datasets: [
                  {
                    label: 'Test Results',
                    data: statsData,
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(153, 102, 255, 0.2)',
                      'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                      'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                  }
                ]
              });

          }
          return true;
      }).catch((_err:any) => {
        setTestResults(StatsObj);

        toast('An error occurred while running tests', {type: toast.TYPE.ERROR});
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
        <div className='w-75 pl-3'>
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
        <div className='w-25 float-right'>
          <ConformanceChart />
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
                <TabTitleWithBadge tabTitle='Expected Failure' badgeValue={ testResults.stats.overall.expected_failure } badgeType='badge-success' />
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
                  <TestContent profileType={ profileSelection } allResults={ testResults } resultType={ SUCCESS } />
                </div>
              </div>
            </TabPane>
            <TabPane tabId={ EXPECTED_FAILURE }>
              <div className='card'>
                <div className='card-body'>
                  <TestContent profileType={ profileSelection } allResults={ testResults } resultType={ EXPECTED_FAILURE } />
                </div>
              </div>
            </TabPane>
            <TabPane tabId={ SKIPPED }>
              <div className='card'>
                <div className='card-body'>
                  <TestContent profileType={ profileSelection } allResults={ testResults } resultType={ SKIPPED } />
                </div>
              </div>
            </TabPane>
            <TabPane tabId={ UNEXPECTED_SUCCESS }>
              <div className='card'>
                <div className='card-body'>
                  <TestContent profileType={ profileSelection } allResults={ testResults } resultType={ UNEXPECTED_SUCCESS } />
                </div>
              </div>
            </TabPane>
            <TabPane tabId={ FAILURE }>
              <div className='card'>
                <div className='card-body'>
                  <TestContent profileType={ profileSelection } allResults={ testResults } resultType={ FAILURE } />
                </div>
              </div>
            </TabPane>
            <TabPane tabId={ ERROR }>
              <div className='card'>
                <div className='card-body'>
                  <TestContent profileType={ profileSelection } allResults={ testResults } resultType={ ERROR } />
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