import React from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from 'components/home/home';
import AppLayout from './components/static/appLayout';

import { MessageGenerator, SchemaGenerator } from './components/create/creators';
import SchemaConverter from './components/convert/SchemaConverter'
import MessageValidator from './components/validator/MessageValidator';
import SchemaConformance from 'components/conformance/SchemaConformance';
import SchemaTranslator from 'components/translate/SchemaTranslator';
import ExampleGenerator from 'components/generate/ExampleGenerator';
import SchemaTransformer from 'components/transform/SchemaTransformer';


export const App = () => {
  return (
    <div className="container-fluid" >

      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="validate-message" element={<MessageValidator />} />
            <Route path="convert-schema" element={<SchemaConverter />} />
            <Route path="create-message" element={<MessageGenerator />} />
            <Route path="create-schema" element={<SchemaGenerator />} />
            <Route path="transform-schema" element={<SchemaTransformer />} />
            <Route path="generate-message" element={<ExampleGenerator />} />
            <Route path="translate-schema" element={<SchemaTranslator />} />
            <Route path="schema-conformance" element={<SchemaConformance />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </Router>

    </div>
  );
};

export default App;