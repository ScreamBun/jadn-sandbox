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


const PrettyPrintJson = ({data}: any) => {
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
  const [testResults, setTestResults] = useState({});
  const [statsTotal, setStatsTotal] = useState(0);
  const [statsSuccess, setStatsSuccess] = useState(0);
  const [statsExpectedFailure, setStatsExpectedFailure] = useState(0);
  const [statsSkipped, setStatsSkipped] = useState(0);
  const [statsUnexpectedSuccess, setStatsUnexpectedSuccess] = useState(0);
  const [statsFailure, setStatsFailure] = useState(0);
  const [statsError, setStatsError] = useState(0);

  const { schema = emptyObj } = props;

  useEffect(() => {
    console.log('RunConformanceTests init');
  }, []);

  useMemo( () => {
    // console.log(`useMemo props.schema : ${JSON.stringify(schema, null, 2)}`);
    console.log(`RunConformance / useMemo / props.schema updated`);
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

  const calcStats = (returnData: any) => {
    setTestResults(returnData);
    if (returnData.stats && returnData.stats.overall) {
      if (returnData.stats.overall) {
        if (returnData.stats.overall.total) {
          setStatsTotal(returnData.stats.overall.total);
        }
        if (returnData.stats.overall.success) {
          setStatsSuccess(returnData.stats.overall.success);
        }
        if (returnData.stats.overall.expected_failure) {
          setStatsExpectedFailure(returnData.stats.overall.expected_failure);
        }
        if (returnData.stats.overall.skipped) {
          setStatsSkipped(returnData.stats.overall.skipped);
        }
        if (returnData.stats.overall.unexpected_success) {
          setStatsUnexpectedSuccess(returnData.stats.overall.unexpected_success);
        }
        if (returnData.stats.overall.failure) {
          setStatsFailure(returnData.stats.overall.failure);
        }
        if (returnData.stats.overall.error) {
          setStatsError(returnData.stats.overall.error);
        }
      }
    }
  };

  const onRunTests = (e:any) => {
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

    const onProfileTypeChange = (e:any) => {
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
                  { statsTotal }
                </span>
              </div>
              <div className='card-body'>
                <div className='row'>
                  <div className='col-6'>
                    <ul className="list-group">
                      <ListItemWithBadge itemLabel='Success' itemValue={ statsSuccess } bsBadgeType='badge-success' />
                      <ListItemWithBadge itemLabel='Expected Failure' itemValue={ statsExpectedFailure } bsBadgeType='badge-success' />
                      <ListItemWithBadge itemLabel='Skipped' itemValue={ statsSkipped } bsBadgeType='badge-secondary' />
                    </ul>
                  </div>
                  <div className='col-6'>
                    <ListItemWithBadge itemLabel='Unexpected Success' itemValue={ statsUnexpectedSuccess } bsBadgeType='badge-warning' />
                    <ListItemWithBadge itemLabel='Failure' itemValue={ statsFailure } bsBadgeType='badge-danger' />
                    <ListItemWithBadge itemLabel='Error' itemValue={ statsError } bsBadgeType='badge-danger' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='row mt-2'>
          <div className='col'>
            <PrettyPrintJson data={ testResults } />
          </div>
        </div>
      </div>
    );
};

export default RunConformanceTests;