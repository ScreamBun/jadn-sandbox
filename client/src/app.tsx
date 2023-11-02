import React, { Suspense, lazy } from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// import AppLayout from './components/static/appLayout';
// import Home from 'components/home/home';
// import { MessageGenerator, SchemaGenerator } from './components/create/creators';
// import SchemaVisualizer from './components/visualize/SchemaVisualizer'
// import MessageValidator from './components/validator/MessageValidator';
// import About from 'components/about/about';
// import SchemaTranslator from 'components/translate/SchemaTranslator';
// import ExampleGenerator from 'components/generate/ExampleGenerator';
// import SchemaTransformer from 'components/transform/SchemaTransformer';
import SBSpinner from 'components/common/SBSpinner';
const AppLayout = lazy(() => import('./components/static/appLayout'));
const Home = lazy(() => import('components/home/home'));
const MessageGenerator = lazy(() => import('./components/create/message/MessageGenerator'));
const SchemaGenerator = lazy(() => import('./components/create/schema/SchemaGenerator'));
const SchemaVisualizer = lazy(() => import('./components/visualize/SchemaVisualizer'));
const MessageValidator = lazy(() => import('./components/validator/MessageValidator'));
const About = lazy(() => import('components/about/about'));
const SchemaTranslator = lazy(() => import('components/translate/SchemaTranslator'));
const ExampleGenerator = lazy(() => import('components/generate/ExampleGenerator'));
const SchemaTransformer = lazy(() => import('components/transform/SchemaTransformer'));

export const App = () => {

  return (
    <div className="container-fluid">

      <Router>
        <Suspense fallback={<SBSpinner action={"Loading"} isDiv />}>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="home" element={<Home />} />
              <Route path="validate-message" element={<MessageValidator />} />
              <Route path="convert-schema" element={<SchemaVisualizer />} />
              <Route path="create/message" element={<MessageGenerator />} />
              <Route path="create/schema" element={<SchemaGenerator />} />
              <Route path="transform-schema" element={<SchemaTransformer />} />
              <Route path="generate-message" element={<ExampleGenerator />} />
              <Route path="translate-schema" element={<SchemaTranslator />} />
              <Route path="about" element={<About />} />
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>

    </div>
  );
};

export default App;