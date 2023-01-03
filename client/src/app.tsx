import React from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from 'components/home/home';
import AppLayout from './components/static/appLayout';

import { MessageGenerator, SchemaGenerator } from './components/generate/';
import SchemaConverter from './components/converter/SchemaConverter'
import Validator from './components/validator';


export const App = () => {
    return (
      <div className="container-fluid" >

        <Router>
          <Routes>
            <Route path="/" element={ <AppLayout /> }>
              <Route index element={ <Home /> } />
              <Route path="home" element={ <Home /> } />
              <Route path="validate" element={ <Validator /> } />
              <Route path="convert-schema" element={ <SchemaConverter /> } />
              <Route path="generate-message" element={ <MessageGenerator /> } />
              <Route path="generate-schema" element={ <SchemaGenerator /> } />
              <Route path="*" element={ <Home /> } />
            </Route>
          </Routes>
        </Router>

      </div>
    );
};

export default App;