import {faClipboardCheck} from '@fortawesome/free-solid-svg-icons/faClipboardCheck';
import React, {useEffect, useMemo, useState} from 'react';
import {toast} from 'react-toastify';
import {Button} from 'reactstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {getAllConformanceTests, runConformanceTest} from './Api';


const PrettyPrintJson = ({data}: any) => {
    return (<div><pre>{ JSON.stringify(data, null, 2) }</pre></div>);
};

const emptyObj: [] = [];
const RunConformanceTests = (props: any) => {

  const [profilesOptions, setProfilesOptions] = useState([] as string[]);
  const [profileSelection, setProfileSelection] = useState('');
  const [testResults, setTestResults] = useState({});
  const [schemaToTest, setSchemaToTest] = useState({});

  const { schema = emptyObj } = props;

    // useEffect(() => {
    //     console.log('useEffect \ setSchemaToTest');
    //     if(props.schema) {
    //         setSchemaToTest(props.schema)
    //         console.log('useEffect \ setSchemaToTest: ' + props.schema);
    //     }
    // }, [props.schema, setSchemaToTest])

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
            .then(data => {
                if (data) {
                  // TODO: May need a loop here to dynamically grab more tests
                  if (data.Language_UnitTests && data.Language_UnitTests.profiles) {
                    setProfileTypes(data.Language_UnitTests.profiles);
                  }
                  if (data.SLPF_UnitTests && data.SLPF_UnitTests.profiles) {
                    setProfileTypes(data.SLPF_UnitTests.profiles);
                  }
                }
                return true;
            }).catch((_err:any) => {
                console.log(_err);
            });
    }, []);

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
            .then(data => {
                console.log('runTest / runConformanceTest');
                console.log(data);
                if (data) {
                    setTestResults(data);
                }
                return true;
            }).catch((_err:any) => {
                console.log(_err);
            });
    };

    const onProfileTypeChange = (e:any) => {
        console.log(`Profile Type Selected: ${e.target.value}`);
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
                    <FontAwesomeIcon icon={ faClipboardCheck } color='white' />
                    Run Tests
                  </Button>
                </div>
              </div>
            </form>
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