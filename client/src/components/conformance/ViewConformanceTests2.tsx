import React, { useState, useEffect } from 'react';

import {getAllConformanceTests} from "./Api";
import {Button} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";

const ViewConformanceTests2 = () => {

    const [search, setSearch] = useState("");
    const [filterlist, setFilterlist] = useState([]);
    const [origlist, setOriglist] = useState([]);

    const [languageTestTitle, setLanguageTestTitle] = useState('')
    const [languageTestProfiles, setLanguageTestProfiles] = useState([])
    const [languageTestSearch, setLanguageTestSearch] = useState("");
    const [filteredLanguageTests, setFilteredLanguageTests] = useState([])
    const [languageTests, setLanguageTests] = useState([])

    const [slpfTestTitle, setSlpfTestTitle] = useState('')
    const [slpfTestProfiles, setSlpfTestProfiles] = useState([])
    const [slpfTests, setSlpfTests] = useState({})


    useEffect(() => {
        getAllConformanceTests()
            .then(data => {
                console.log('useEffect / getAllConformanceTests')
                console.log(data)
                if(data){
                    setTestState(data);
                }
            });
    }, [])

    useEffect(() => {
        console.log("useEffect");
        fetchData();
    }, [""]);

    useEffect(() => {

        // TODO: Let off here, need to convert object into array

        const filteredList = origlist.filter((item) => {
            console.log('useEffect / filterlist: ' + search);
            let all_str = `${item.id} ${item.title}`.toLowerCase();
            // let all_str = `${item}`.toLowerCase();
            return all_str.indexOf(search) > -1; // View All When Search Empty
            // return all_str.indexOf(search) > -1 && search;
        });
        setFilterlist(filteredList);
    }, [search]);

    const onKeyUpHandler = (e:any) => {
        console.log('onKeyUp: ' + e.target.value.toLowerCase());
        setSearch(e.target.value.toLowerCase());
    }

    const fetchData = () => {
        fetch("https://jsonplaceholder.typicode.com/todos")
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setOriglist(data);
                setFilterlist(data);
            });
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
                const tests = data.Language_UnitTests.tests;
                let result = Object.keys(tests).map((key) => key + " : " + tests[key]);
                setLanguageTests(result);
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
                setSlpfTests(data.SLPF_UnitTests.tests);
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
                  <div className="mb-3">
                      <h1>Filter List Example - FreakyJolly.com</h1>
                      <label className="form-label">Filter List</label>
                      <input
                          id="searchFilter"
                          type="text"
                          className="form-control"
                          defaultValue={search}
                          placeholder="Enter ID or Name"
                          onKeyUp={onKeyUpHandler}
                      />
                  </div>
                  <ul className="list-group">
                      {filterlist.map((item, key) => (
                          <li className="list-group-item"
                              key={key}
                              value={item.id}>
                              {item.id}) {item.title}
                          </li>
                      ))}
                  </ul>
              </div>
          </div>

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
                          <ul className="list-group mb-2">
                              <li className="list-group-item active">Valid Profiles
                                  <span className="ml-2 badge bg-light rounded-pill">
                                      {Object.keys(languageTestProfiles).length}</span>
                              </li>
                              {Object.keys(languageTestProfiles).map(lpKey => {
                                  return (
                                      <li className="list-group-item">{languageTestProfiles[lpKey]}</li>
                                  )
                              })}
                          </ul>
                          <ul className="list-group">
                              <li className="list-group-item active">Tests (Name and Description)
                                  <span className="ml-2 badge bg-light rounded-pill">
                                      {Object.keys(languageTests).length}</span>
                              </li>
                              {Object.keys(languageTests).map(lKey => {
                                  return (
                                      <li className="list-group-item">{lKey} : {languageTests[lKey]}</li>
                                  )
                              })}
                          </ul>
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
                          <ul className="list-group mb-2">
                              <li className="list-group-item active">Valid Profiles
                                  <span className="ml-2 badge bg-dark rounded-pill">
                                      {Object.keys(slpfTestProfiles).length}</span>
                              </li>
                              {Object.keys(slpfTestProfiles).map(spKey => {
                                  return (
                                      <li className="list-group-item">{slpfTestProfiles[spKey]}</li>
                                  );
                              })}
                          </ul>
                          <ul className="list-group">
                              <li className="list-group-item active">Tests (Name and Description)
                                  <span className="ml-2 badge bg-dark rounded-pill">
                                      {Object.keys(slpfTests).length}</span>
                              </li>
                              {Object.keys(slpfTests).map(sKey => {
                                  return (
                                      <li className="list-group-item">{sKey} : {slpfTests[sKey]}</li>
                                  );
                              })}
                          </ul>
                      </div>
                  </div>
              </div>
          </div>

      </div>
    );
}

export {ViewConformanceTests2};