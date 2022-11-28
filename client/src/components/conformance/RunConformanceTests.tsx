// Dependencies
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons/faClipboardCheck';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'reactstrap';
import React, { useEffect, useMemo, useState } from 'react';
// import {
//  BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip
// } from 'chart.js';
// import { Bar } from 'react-chartjs-2';
// import cloneDeep from 'lodash/cloneDeep';

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

const emptyObj: [] = [];
const RunConformanceTests = (props: any) => {

  const [profilesOptions, setProfilesOptions] = useState([] as string[]);
  const [profileSelection, setProfileSelection] = useState('');
  const [schemaToTest, setSchemaToTest] = useState({});
  const [testResults, setTestResults] = useState(StatsObj);

  const { schema = emptyObj } = props;

  // useEffect(() => {
  //   console.log('RunConformanceTests init');
  // }, []);

  useMemo( () => {
    // console.log(`useMemo props.schema : ${JSON.stringify(schema, null, 2)}`);
    // console.log(`RunConformance / useMemo / props.schema updated`);
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
                  // setTestResults(returnData);
                  // updateChartData(testResults);
              }
              return true;
          }).catch((_err:any) => {
              console.log(_err);
          });
    };

    const onProfileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setProfileSelection(e.target.value);
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
                  <Button id='runTests' type='submit' color='success'>
                    <FontAwesomeIcon className='mr-2' icon={ faClipboardCheck } color='white' />
                    Run Tests
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className='row mt-2'>
          <div className='col'>
            <div className='card'>
              <div className='card-header'>
                Results Summary
                <span className='badge badge-info badge-pill ml-2'>
                  { testResults.stats.overall.total }
                </span>
              </div>
              <div className='card-body'>
                <div className='row'>
                  <div className='col-6'>
                    <ul className="list-group">
                      <ListItemWithBadge itemLabel='Success' itemValue={ testResults.stats.overall.success } bsBadgeType='badge-success' />
                      <ListItemWithBadge itemLabel='Expected Failure' itemValue={ testResults.stats.overall.failure } bsBadgeType='badge-success' />
                      <ListItemWithBadge itemLabel='Skipped' itemValue={ testResults.stats.overall.skipped } bsBadgeType='badge-secondary' />
                    </ul>
                  </div>
                  <div className='col-6'>
                    <ListItemWithBadge itemLabel='Unexpected Success' itemValue={ testResults.stats.overall.unexpected_success } bsBadgeType='badge-warning' />
                    <ListItemWithBadge itemLabel='Failure' itemValue={ testResults.stats.overall.failure } bsBadgeType='badge-danger' />
                    <ListItemWithBadge itemLabel='Error' itemValue={ testResults.stats.overall.error } bsBadgeType='badge-danger' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='row mt-2'>
          <div className='col'>
            <div className='card'>
              <div className='card-header'>
                Tests that Passed
              </div>
              <div className='card-body'>
                <ul className='list-group list-group-flush'>
                  {/* Left off here, need to pull this into a function and change depending on lang or slpf, then show errors */}
                  { Object.keys(testResults.language.success).map((key) => {
                    return (
                      <li key={ key } className='list-group-item'>{ key }</li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className='row mt-2'>
          <div className='col'>
            <div className='card'>
              <div className='card-header'>
                JSON Data
              </div>
              <div className='card-body'>
                <PrettyPrintJson data={ testResults } />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default RunConformanceTests;