// Dependencies
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons/faClipboardCheck';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Input, Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import split from 'lodash/split';

// Module Specific
import { getAllConformanceTests, runConformanceTest } from './Api';
import ConformanceChart from './ConformanceChart';
import { sbToastError } from 'components/common/SBToast';
import { getAllSchemas } from 'reducers/util';
import { useDispatch, useSelector } from 'react-redux';
import { loadFile } from 'actions/util';


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
  total: 0,
  error: 0,
  failure: 0,
  success: 0,
  expected_failure: 0,
  skipped: 0,
  unexpected_success: 0
};

const ResultsObj = {
  stats: {
    overall: StatsObj
  },
  language: {
    success: {},
    expected_failure: {},
    skipped: {},
    unexpected_success: {},
    failure: {},
    error: {}
  },
  slpf: {
    success: {},
    expected_failure: {},
    skipped: {},
    unexpected_success: {},
    failure: {},
    error: {}
  }
};

// TODO: Move to a utils class
const PrettyPrintJson = (props: any) => {
  const { data } = props;
  return (<div><pre>{JSON.stringify(data, null, 2)}</pre></div>);
};

const TabTitleWithBadge = (props: any) => {
  const { tabTitle, badgeValue, badgeType } = props;
  const badgeClasses = `badge ${badgeType} badge-pill ml-2`;
  return (
    <span className="d-flex justify-content-between align-items-center">
      {tabTitle}
      <span className={badgeClasses}>
        {badgeValue}
      </span>
    </span>
  );
};

class TestResult {
  title = '';
  details: string[] = [''];

  constructor(title?: string, details?: string[]) {
    if (title) {
      this.title = title;
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
      {map(formattedTestResults, (testResult, z) => {
        return (
          <li key={z} className='list-group-item p-1'>
            <span className='font-weight-bold'>
              {testResult.title}
            </span>
            <ul className='list-group list-group-flush'>
              {map(testResult.details, (detail, x) => {
                return (
                  <li key={x} className='list-group-item p-1'>
                    <span>
                      {detail}
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

const emptyArray: [] = [];
const RunConformanceTests = (props: any) => {
  const dispatch = useDispatch();

  const [profilesOptions] = useState([] as string[]);
  const [profileSelection, setProfileSelection] = useState('');
  const [schemaToTest, setSchemaToTest] = useState({});
  const [testResults, setTestResults] = useState(ResultsObj);
  const [activeTab, setActiveTab] = useState(SUCCESS);

  const { schema = emptyArray, selectedFile, setSelectedFile } = props;
  const schemaOpts = useSelector(getAllSchemas);

  useMemo(() => {
    setSchemaToTest(schema);
  }, [schema]);

  const setProfileTypes = (profilesTypes: string[]) => {
    profilesTypes.map((profileType: string) => {
      if (!profilesOptions.includes(profileType)) {
        profilesOptions.push(profileType);
      }
    });
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
      }).catch((_err: any) => {
        console.log(_err);
      });
  }, []);

  const onRunTests = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profileSelection) {
      sbToastError(`A Profile Type is required`);
      return;
    }

    if (JSON.stringify(schemaToTest) == '{}' || !selectedFile) {
      sbToastError(`A Schema is required`);
      return;
    }

    setTestResults(ResultsObj);
    runConformanceTest(profileSelection, schemaToTest)
      .then(returnData => {
        if (returnData) {
          setTestResults(returnData);
        }
        return true;
      }).catch((_err: any) => {
        setTestResults(ResultsObj);
        sbToastError(`An error occurred while running tests`);
        console.log(_err);
      });
  };

  useEffect(() => {
    if (selectedFile == "file") {
      setSchemaToTest({});

    } else {
      try {
        dispatch(loadFile('schemas', selectedFile))
          .then((loadFileVal) => {
            try {
              let schemaObj = loadFileVal.payload.data;
              setSchemaToTest(schemaObj);
            } catch (err) {
              if (err instanceof Error) {
                sbToastError(err.message);
                return;
              }
            }
          })
          .catch((loadFileErr) => {
            console.log(loadFileErr);
          })
      } catch (err) {
        console.log(err);
      }
    }
  }, [selectedFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const fileReader = new FileReader();
      fileReader.onload = (ev: ProgressEvent<FileReader>) => {
        if (ev.target) {
          let data = ev.target.result;
          try {
            setSchemaToTest(JSON.parse(data));
          } catch (err) {
            console.log(err);
            sbToastError(`Schema cannot be loaded`);
          }
        }
      };
      fileReader.readAsText(file);
    }
  }

  const onToggleTabs = (view: string) => {
    if (activeTab !== view) {
      setActiveTab(view);
    }
  };

  return (
    <div className='card m-2'>
      <div className='card-header p-2'>
        <form onSubmit={onRunTests}>
          <div className='row no-gutters'>
            <div className='col-md-3'>
              <select id="schema-list" name="schema-list" className="form-control form-control-sm" value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
                <option value="">Select a Schema...</option>
                <optgroup label="Testers">
                  {schemaOpts.map((s: any) => <option key={s} value={s} >{s}</option>)}
                </optgroup>
                <optgroup label="Custom">
                  <option value="file">File...</option>
                </optgroup>
              </select>
              <Input type="file" id="schema-file" name="schema-file" className={`form-control ${selectedFile == 'file' ? '' : ' d-none'}`} accept=".jadn" onChange={onFileChange} />
            </div>

            <div className='col-md-3'>
              <select required className="form-control form-control-sm" value={profileSelection} onChange={(e) => setProfileSelection(e.target.value)}>
                <option value=''>Select a Profile Type</option>
                {profilesOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className='col-md-6'>
              <span className='badge badge-info badge-pill ml-2 p-2 float-right'>
                <span className='mr-2'>Total Test Results</span>
                {testResults.stats.overall.total}
              </span>

              <Button id='runTests' type='submit' color={SUCCESS} className='float-right btn-sm mr-1'>
                <FontAwesomeIcon className='mr-2' icon={faClipboardCheck} color='white' />
                Run Tests
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className='card-body'>
        <div className='row mt-2'>
          <div className='float-right'>
            <ConformanceChart testStats={testResults?.stats} />
          </div>
        </div>
        <div className='row mt-2'>
          <div className='col'>
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === SUCCESS })}
                  onClick={() => onToggleTabs(SUCCESS)}
                >
                  <TabTitleWithBadge tabTitle='Success' badgeValue={testResults.stats.overall.success} badgeType='badge-success' />
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === EXPECTED_FAILURE })}
                  onClick={() => onToggleTabs(EXPECTED_FAILURE)}
                >
                  <TabTitleWithBadge tabTitle='Expected Failure' badgeValue={testResults.stats.overall.expected_failure} badgeType='badge-success' />
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === SKIPPED })}
                  onClick={() => onToggleTabs(SKIPPED)}
                >
                  <TabTitleWithBadge tabTitle='Skipped' badgeValue={testResults.stats.overall.skipped} badgeType='badge-secondary' />
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === UNEXPECTED_SUCCESS })}
                  onClick={() => onToggleTabs(UNEXPECTED_SUCCESS)}
                >
                  <TabTitleWithBadge tabTitle='Unexpected Success' badgeValue={testResults.stats.overall.unexpected_success} badgeType='badge-warning' />
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === FAILURE })}
                  onClick={() => onToggleTabs(FAILURE)}
                >
                  <TabTitleWithBadge tabTitle='Failure' badgeValue={testResults.stats.overall.failure} badgeType='badge-danger' />
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === ERROR })}
                  onClick={() => onToggleTabs(ERROR)}
                >
                  <TabTitleWithBadge tabTitle='Error' badgeValue={testResults.stats.overall.error} badgeType='badge-danger' />
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === 'json' })}
                  onClick={() => onToggleTabs('json')}
                >
                  JSON
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId={SUCCESS}>
                <div className='card'>
                  <div className='card-body'>
                    <TestContent profileType={profileSelection} allResults={testResults} resultType={SUCCESS} />
                  </div>
                </div>
              </TabPane>
              <TabPane tabId={EXPECTED_FAILURE}>
                <div className='card'>
                  <div className='card-body'>
                    <TestContent profileType={profileSelection} allResults={testResults} resultType={EXPECTED_FAILURE} />
                  </div>
                </div>
              </TabPane>
              <TabPane tabId={SKIPPED}>
                <div className='card'>
                  <div className='card-body'>
                    <TestContent profileType={profileSelection} allResults={testResults} resultType={SKIPPED} />
                  </div>
                </div>
              </TabPane>
              <TabPane tabId={UNEXPECTED_SUCCESS}>
                <div className='card'>
                  <div className='card-body'>
                    <TestContent profileType={profileSelection} allResults={testResults} resultType={UNEXPECTED_SUCCESS} />
                  </div>
                </div>
              </TabPane>
              <TabPane tabId={FAILURE}>
                <div className='card'>
                  <div className='card-body'>
                    <TestContent profileType={profileSelection} allResults={testResults} resultType={FAILURE} />
                  </div>
                </div>
              </TabPane>
              <TabPane tabId={ERROR}>
                <div className='card'>
                  <div className='card-body'>
                    <TestContent profileType={profileSelection} allResults={testResults} resultType={ERROR} />
                  </div>
                </div>
              </TabPane>
              <TabPane tabId='json'>
                <div className='card'>
                  <div className='card-body'>
                    <PrettyPrintJson data={testResults} />
                  </div>
                </div>
              </TabPane>
            </TabContent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunConformanceTests;