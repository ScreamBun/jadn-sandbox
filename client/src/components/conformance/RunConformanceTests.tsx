// Dependencies
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons/faClipboardCheck';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'reactstrap';
import React, { useEffect, useMemo, useState } from 'react';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import cloneDeep from 'lodash/cloneDeep';

// Module Specific
import { getAllConformanceTests, runConformanceTest } from './Api';


const PrettyPrintJson = ({data}: any) => {
    return (<div><pre>{ JSON.stringify(data, null, 2) }</pre></div>);
};

const emptyObj: [] = [];
const RunConformanceTests = (props: any) => {

  let initialChartState = {
    options : {
      indexAxis: 'y' as const,
      elements: {
        bar: {
          borderWidth: 2
        }
      },
      responsive: true,
      plugins: {
        legend: {
          position: 'right' as const
        },
        title: {
          display: true,
          text: 'Overall Stats'
        }
      }
    },
    data : {
      labels: ['Results'],
      datasets: [
        {
          label: 'Error',
          data: [0],
          backgroundColor: 'rgb(241,55,55)'
        },
        {
          label: 'Failure',
          data: [0],
          backgroundColor: 'rgba(252,231,4,0.73)'
        },
        {
          label: 'Success',
          data: [0],
          backgroundColor: 'rgba(88,243,124,0.5)'
        },
        {
          label: 'Expected Failure',
          data: [0],
          backgroundColor: 'rgba(241,139,255,0.5)'
        },
        {
          label: 'Skipped',
          data: [0],
          backgroundColor: 'rgba(101,97,97,0.5)'
        },
        {
          label: 'Unexpected Success',
          data: [0],
          backgroundColor: 'rgba(53,162,235,0.5)'
        }
      ]
    }
  };

  const [profilesOptions, setProfilesOptions] = useState([] as string[]);
  const [profileSelection, setProfileSelection] = useState('');
  const [testResults, setTestResults] = useState({});
  const [schemaToTest, setSchemaToTest] = useState({});

  const [chartData, setChartData] = useState(initialChartState);

  const { schema = emptyObj } = props;

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

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

  function updateChartData(testData: any) {
    const chartDataCopy = cloneDeep(chartData);
    if (testData && testData.stats && testData.stats.overall) {
      // TODO: Left off here, chart's data is not loading correctly
      chartDataCopy.data.datasets[0].data = [testData.stats.overall.error];
      chartDataCopy.data.datasets[1].data = [testData.stats.overall.failure];
      chartDataCopy.data.datasets[2].data = [testData.stats.overall.success];
    }
    setChartData(chartDataCopy);
  }

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
                  setTestResults(returnData);
                  updateChartData(testResults);
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
            <Bar options={ chartData.options } data={ chartData.data } />
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