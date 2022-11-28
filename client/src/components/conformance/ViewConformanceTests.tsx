import React, { useState, useEffect } from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRefresh} from '@fortawesome/free-solid-svg-icons/faRefresh';
import {Button} from 'reactstrap';
import { toast } from 'react-toastify';

import {getAllConformanceTests} from './Api';


const ViewConformanceTests = () => {

    const [languageTestTitle, setLanguageTestTitle] = useState('');
    const [languageTestProfiles, setLanguageTestProfiles] = useState([]);
    const [languageTests, setLanguageTests] = useState([]);
    const [languageTestSearch, setLanguageTestSearch] = useState('');
    const [filteredLanguageTests, setFilteredLanguageTests] = useState([]);

    const [slpfTestTitle, setSlpfTestTitle] = useState('');
    const [slpfTestProfiles, setSlpfTestProfiles] = useState([]);
    const [slpfTests, setSlpfTests] = useState([]);
    const [slpfTestSearch, setSlpfTestSearch] = useState('');
    const [filteredSlpfTests, setFilteredSlpfTests] = useState([]);

    const setTestState = (data: any) => {
        if (data.Language_UnitTests) {
            if (data.Language_UnitTests.doc) {
                setLanguageTestTitle(data.Language_UnitTests.doc);
            }
            if (data.Language_UnitTests.profiles) {
                setLanguageTestProfiles(data.Language_UnitTests.profiles);
                setFilteredLanguageTests(data.Language_UnitTests.profiles);
            }
            if (data.Language_UnitTests.tests) {
                const langTestData = data.Language_UnitTests.tests;
                const langResult: any = Object.keys(langTestData).map((key) => `${key} : ${langTestData[key]}`);
                setLanguageTests(langResult);
                setFilteredLanguageTests(langResult);
            }
        }

        if (data.SLPF_UnitTests) {
            if (data.SLPF_UnitTests.doc) {
                setSlpfTestTitle(data.SLPF_UnitTests.doc);
            }
            if (data.SLPF_UnitTests.profiles) {
                setSlpfTestProfiles(data.SLPF_UnitTests.profiles);
            }
            if (data.SLPF_UnitTests.tests) {
                const slpfTestData = data.SLPF_UnitTests.tests;
                const slpfResult: any = Object.keys(slpfTestData).map((key) => `${key} : ${slpfTestData[key]}`);
                setSlpfTests(slpfResult);
                setFilteredSlpfTests(slpfResult);
            }
        }

    };

    useEffect(() => {
        getAllConformanceTests()
          .then(data => {
            if (data) {
                setTestState(data);
            }
            return true;
          }).catch(error => {
            console.log(error);
            toast.warn('Unable to grab Conformance Tests');
          });
    }, []);

    useEffect(() => {
        const filteredLangList = languageTests.filter((item) => {
            const stringLower = `${item}`.toLowerCase();
            return stringLower.indexOf(languageTestSearch) > -1;
        });
        setFilteredLanguageTests(filteredLangList);
    }, [languageTests, languageTestSearch]);

    useEffect(() => {
        const filteredSlpfList = slpfTests.filter((item) => {
            const stringLower = `${item}`.toLowerCase();
            return stringLower.indexOf(slpfTestSearch) > -1;
        });
        setFilteredSlpfTests(filteredSlpfList);
    }, [slpfTests, slpfTestSearch]);

    const onLangTestKeyUpHandler = (e:any) => {
        setLanguageTestSearch(e.target.value.toLowerCase());
    };

    const onSlpfTestKeyUpHandler = (e:any) => {
        setSlpfTestSearch(e.target.value.toLowerCase());
    };

    const fetchAllData = () => {
        getAllConformanceTests()
            .then(data => {
                if (data) {
                    setTestState(data);
                }
                return true;
            }).catch(error => {
            console.log(error);
            toast.warn('Unable to grab all Conformance Tests');
        });
    };

    return (

      <div className='p-2'>
        <div className='row mb-2'>
          <div className='col'>
            <Button
              id='reloadTests'
              className='btn btn-info'
              onClick={ fetchAllData }
            >
              <FontAwesomeIcon className='mr-2' icon={ faRefresh } />
              Reload Tests
            </Button>
          </div>
        </div>
        <div className='row mb-2'>
          <div className='col'>
            <div className='card'>
              <div className='card-header'>
                {languageTestTitle}
              </div>
              <div className='card-body'>
                <div className='card mb-2'>
                  <div className='card-header bg-primary'>
                    Valid Profiles
                    <span className='ml-2 badge bg-light rounded-pill'>
                      { Object.keys(languageTestProfiles).length }
                    </span>
                  </div>
                  <div className='card-body p-0'>
                    <ul className='list-group list-group-flush'>
                      { Object.keys(languageTestProfiles).map((lProfileKey: any) => {
                        return (
                          <li key={ lProfileKey } className='list-group-item'>{languageTestProfiles[ lProfileKey ]}</li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
                <div className='card mb-2'>
                  <div className='card-header bg-primary'>
                    <div className='row'>
                      <div className='col pt-2'>
                        Tests (Name and Description)
                        <span className='ml-2 badge bg-light rounded-pill'>
                          { Object.keys(filteredLanguageTests).length }
                        </span>
                      </div>
                      <div className='col float-right'>
                        <input
                          id='langTestSearchFilter'
                          type='text'
                          className='form-control'
                          defaultValue={ languageTestSearch }
                          placeholder='Filter Tests'
                          onKeyUp={ onLangTestKeyUpHandler }
                        />
                      </div>
                    </div>
                  </div>
                  <div className='card-body p-0'>
                    <ul className='list-group list-group-flush'>
                      { Object.keys(filteredLanguageTests).map((lKey: any) => {
                        return (
                          <li key={ lKey } className='list-group-item'>{ filteredLanguageTests[lKey] }</li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='row mb-2'>
          <div className='col'>
            <div className='card'>
              <div className='card-header'>
                {slpfTestTitle}
              </div>
              <div className='card-body'>
                <div className='card mb-2'>
                  <div className='card-header bg-primary'>
                    Valid Profiles
                    <span className='ml-2 badge bg-light rounded-pill'>
                      { Object.keys(slpfTestProfiles).length }
                    </span>
                  </div>
                  <div className='card-body p-0'>
                    <ul className='list-group list-group-flush'>
                      { Object.keys(slpfTestProfiles).map((sProfileKey: any) => {
                          return (
                            <li key={ sProfileKey } className='list-group-item'>{slpfTestProfiles[sProfileKey]}</li>
                          );
                      })}
                    </ul>
                  </div>
                </div>
                <div className='card mb-2'>
                  <div className='card-header bg-primary'>
                    <div className='row'>
                      <div className='col pt-2'>
                        Tests (Name and Description)
                        <span className='ml-2 badge bg-light rounded-pill'>
                          { Object.keys(filteredSlpfTests).length }
                        </span>
                      </div>
                      <div className='col float-right'>
                        <input
                          id='slpfTestSearch'
                          type='text'
                          className='form-control'
                          defaultValue={ slpfTestSearch }
                          placeholder='Filter Tests'
                          onKeyUp={ onSlpfTestKeyUpHandler }
                        />
                      </div>
                    </div>
                  </div>
                  <div className='card-body p-0'>
                    <ul className='list-group list-group-flush'>
                      { Object.keys(filteredSlpfTests).map((sKey: any) => {
                          return (
                            <li key={ sKey } className='list-group-item'>{ filteredSlpfTests[sKey] }</li>
                          );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ViewConformanceTests;