import React, { useState, useEffect } from 'react';

import {getAllConformanceTests} from "./Api";
import {Button} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";

const ViewConformanceTests = () => {

    const [languageTestTitle, setLanguageTestTitle] = useState('')
    const [languageTestProfiles, setLanguageTestProfiles] = useState([])
    const [languageTests, setLanguageTests] = useState([])
    const [languageTestSearch, setLanguageTestSearch] = useState("");
    const [filteredLanguageTests, setFilteredLanguageTests] = useState([])

    const [slpfTestTitle, setSlpfTestTitle] = useState('')
    const [slpfTestProfiles, setSlpfTestProfiles] = useState([])
    const [slpfTests, setSlpfTests] = useState([])
    const [slpfTestSearch, setSlpfTestSearch,] = useState("");
    const [filteredSlpfTests, setFilteredSlpfTests] = useState([])


    useEffect(() => {
        getAllConformanceTests()
            .then(data => {
                if(data){
                    setTestState(data);
                }
            });
    }, [])

    useEffect(() => {
        const filteredLangList = languageTests.filter((item) => {
            let all_str = `${item}`.toLowerCase();
            return all_str.indexOf(languageTestSearch) > -1;
        });
        setFilteredLanguageTests(filteredLangList);
    }, [languageTestSearch]);

    useEffect(() => {
        const filteredSlpfList = slpfTests.filter((item) => {
            let all_str = `${item}`.toLowerCase();
            return all_str.indexOf(slpfTestSearch) > -1;
        });
        setFilteredSlpfTests(filteredSlpfList);
    }, [slpfTestSearch]);

    const onLangTestKeyUpHandler = (e:any) => {
        setLanguageTestSearch(e.target.value.toLowerCase());
    }

    const onSlpfTestKeyUpHandler = (e:any) => {
        setSlpfTestSearch(e.target.value.toLowerCase());
    }

    const setTestState = (data: any) => {
        if(data.Language_UnitTests){
            if(data.Language_UnitTests.doc){
                setLanguageTestTitle(data.Language_UnitTests.doc);
            }
            if(data.Language_UnitTests.profiles){
                setLanguageTestProfiles(data.Language_UnitTests.profiles);
                setFilteredLanguageTests(data.Language_UnitTests.profiles);
            }
            if(data.Language_UnitTests.tests){
                const langTests = data.Language_UnitTests.tests;
                let langResult = Object.keys(langTests).map((key) => key + " : " + langTests[key]);
                setLanguageTests(langResult);
                setFilteredLanguageTests(langResult);
            }
        }

        if(data.SLPF_UnitTests){
            if(data.SLPF_UnitTests.doc){
                setSlpfTestTitle(data.SLPF_UnitTests.doc);
            }
            if(data.SLPF_UnitTests.profiles){
                setSlpfTestProfiles(data.SLPF_UnitTests.profiles);
            }
            if(data.SLPF_UnitTests.tests){
                const slpfTests = data.SLPF_UnitTests.tests;
                let slpfResult = Object.keys(slpfTests).map((key) => key + " : " + slpfTests[key]);
                setSlpfTests(slpfResult);
                setFilteredSlpfTests(slpfResult);
            }
        }

    }

    const fetchAllData = () => {
        getAllConformanceTests()
            .then(data => {
                console.log('fetchAllUsers / getAllConformanceTests')
                console.log(data)
                if(data){
                    setTestState(data);
                }
            });
    }

    return(

      <div className='p-2'>
          <div className='row mb-2'>
              <div className='col'>
                  <Button
                      id='reloadTests'
                      className='btn btn-info'
                      onClick={fetchAllData}><FontAwesomeIcon icon={faRefresh}></FontAwesomeIcon> Reload Tests
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
                                  <span className="ml-2 badge bg-light rounded-pill">
                                      {Object.keys(languageTestProfiles).length}</span>
                              </div>
                              <div className='card-body p-0'>
                                  <ul className="list-group list-group-flush">
                                      {Object.keys(languageTestProfiles).map(lpKey => {
                                          return (
                                              <li className="list-group-item">{languageTestProfiles[lpKey]}</li>
                                          )
                                      })}
                                  </ul>
                              </div>
                          </div>
                          <div className='card mb-2'>
                              <div className='card-header bg-primary'>
                                  <div className='row'>
                                      <div className='col pt-2'>
                                          Tests (Name and Description)
                                          <span className="ml-2 badge bg-light rounded-pill">
                                      {Object.keys(filteredLanguageTests).length}</span>
                                      </div>
                                      <div className='col float-right'>
                                          <input
                                              id="langTestSearchFilter"
                                              type="text"
                                              className="form-control"
                                              defaultValue={languageTestSearch}
                                              placeholder="Filter Tests"
                                              onKeyUp={onLangTestKeyUpHandler}
                                          />
                                      </div>
                                  </div>
                              </div>
                              <div className='card-body p-0'>
                                  <ul className="list-group list-group-flush">
                                      {Object.keys(filteredLanguageTests).map(lKey => {
                                          return (
                                              <li className="list-group-item">{lKey} : {filteredLanguageTests[lKey]}</li>
                                          )
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
                                  <span className="ml-2 badge bg-light rounded-pill">
                                      {Object.keys(slpfTestProfiles).length}</span>
                              </div>
                              <div className='card-body p-0'>
                                  <ul className="list-group list-group-flush">
                                      {Object.keys(slpfTestProfiles).map(lpKey => {
                                          return (
                                              <li className="list-group-item">{slpfTestProfiles[lpKey]}</li>
                                          )
                                      })}
                                  </ul>
                              </div>
                          </div>
                          <div className='card mb-2'>
                              <div className='card-header bg-primary'>
                                  <div className='row'>
                                      <div className='col pt-2'>
                                          Tests (Name and Description)
                                          <span className="ml-2 badge bg-light rounded-pill">
                                      {Object.keys(filteredSlpfTests).length}</span>
                                      </div>
                                      <div className='col float-right'>
                                          <input
                                              id="slpfTestSearch"
                                              type="text"
                                              className="form-control"
                                              defaultValue={slpfTestSearch}
                                              placeholder="Filter Tests"
                                              onKeyUp={onSlpfTestKeyUpHandler}
                                          />
                                      </div>
                                  </div>
                              </div>
                              <div className='card-body p-0'>
                                  <ul className="list-group list-group-flush">
                                      {Object.keys(filteredSlpfTests).map(sKey => {
                                          return (
                                              <li className="list-group-item">{sKey} : {filteredSlpfTests[sKey]}</li>
                                          )
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
}

export {ViewConformanceTests};