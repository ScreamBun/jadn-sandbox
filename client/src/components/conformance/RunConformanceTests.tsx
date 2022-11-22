import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import {Button} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {getAllConformanceTests, runConformanceTest} from "./Api";
import {faClipboardCheck} from "@fortawesome/free-solid-svg-icons/faClipboardCheck";

const PrettyPrintJson = ({data}:any) => {
    return (<div><pre>{ JSON.stringify(data, null, 2) }</pre></div>);
}

const RunConformanceTests = (props: any) => {

    const [profilesOptions, setProfilesOptions] = useState([])
    const [profileSelection, setProfileSelection] = useState('')
    const [testResults, setTestResults] = useState({})
    const [schemaToTest, setSchemaToTest] = useState({})

    useEffect(() => {
        if(props.schema){
            setSchemaToTest(props.schema)
            console.log("useEffect \ setSchemaToTest: " + props.schema);
        }
    }, [setSchemaToTest])

    useEffect(() => {
        getAllConformanceTests()
            .then(data => {
                if(data){
                    setProfileTypes(data);
                }
            }).catch((_err:any) => {
                console.log(_err);
            });
    }, [])

    const setProfileTypes = (data: any) => {
        if(data.Language_UnitTests.profiles){
            data.Language_UnitTests.profiles.map((langProfile) =>
                setProfilesOptions(current => [...current, langProfile])
            );
        }

        if(data.SLPF_UnitTests.profiles){
            data.SLPF_UnitTests.profiles.map((slpfProfile) =>
                setProfilesOptions(current => [...current, slpfProfile])
            );
        }
    };

    const onRunTests = (e) => {
        e.preventDefault();

        let isValid = true;
        if(!profileSelection){
            toast('A Profile Type is required', {type: toast.TYPE.ERROR});
            isValid = false;
        }

        if(!schemaToTest){
            toast('A Schema is required', {type: toast.TYPE.ERROR});
            isValid = false;
        }

        if(!isValid){
            return;
        }

        runConformanceTest(profileSelection, schemaToTest)
            .then(data => {
                console.log('runTest / runConformanceTest')
                console.log(data)
                if(data){
                    setTestResults(data);
                }
            }).catch((_err:any) => {
                console.log(_err);
            });
    }

    const onProfileTypeChange = (e) => {
        console.log("Profile Type Selected: " + e.target.value);
        setProfileSelection(e.target.value);
    }

    return (
        <div>
            <div className='row'>
                <div className='col'>
                    <form onSubmit={onRunTests}>
                        <div className='btn-group' role='group'>
                            <select required value={profileSelection} onChange={onProfileTypeChange}>
                                {profilesOptions.map((option) => (
                                    <option value={option}>{option}</option>
                                ))}
                            </select>
                            <div className="btn-group">
                                <Button id="runTests" type='submit' color="success">
                                    <FontAwesomeIcon icon={ faClipboardCheck} color="white" /> Run Tests
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div className='row mt-2'>
                <div className='col'>
                    <PrettyPrintJson data={testResults} />
                </div>
            </div>
        </div>
    );
}

export default RunConformanceTests;