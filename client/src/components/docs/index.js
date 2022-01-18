import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';

import JADN_API from './jadn_api';
import {
  Card_Template, Constructor_Template, Enum_Template, Function_Template, Toggle_Template, under_escape
} from './templates';


function mapStateToProps(state) {
  return {
    siteTitle: state.Util.site_title
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

class Converter extends Component {
  constructor(props) {
    super(props);

    const { siteTitle } = this.props;
    this.meta = {
      title: `${siteTitle} | API Docs`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };
  }

  body_format(body) {
    return Object.keys(body).map((n, i) => {
      const data = body[n];

      const dataConstructor = Object.hasOwnProperty(data, 'constructor') ? <Constructor_Template { ...data.constructor } /> : '';
      const dataEnum = Object.hasOwnProperty(data, 'enum') ? <Enum_Template en={ data.enum } /> : '';
      const dataFunction = Object.hasOwnProperty(data, 'function') ? <Function_Template fun={ data.function } /> : '';

      const tmpData = {
        ...data,
        body: (
          <div className="m-0 p-0 w-100">
            { dataConstructor }
            { dataEnum }
            { dataFunction }
          </div>
        )
      };

      return <Card_Template key={ i } { ...tmpData } />;
    });
  }

  pkg_format(pkg, i) {
    let bodyPkg = '';
    let bodyEnum = '';
    let bodyClass = '';
    let bodyFunction = '';

    if (pkg.hasOwnProperty('body')) {
      if (pkg.body.hasOwnProperty('package')) {
        bodyPkg = Object.keys(pkg.body.package).map((n, j) => {
          const data = pkg.body.package[n];
          data.header = n;
          return this.pkg_format(data, j);
        });
      }

      if (pkg.body.hasOwnProperty('enum')) {
        bodyEnum = this.body_format(pkg.body.enum);
      }

      if (pkg.body.hasOwnProperty('class')) {
        bodyClass = this.body_format(pkg.body.class);
      }

      if (pkg.body.hasOwnProperty('function')) {
        bodyFunction = <Function_Template fun={ pkg.body.function } />;
      }
    }

    const tmpPkg = {
      ...pkg,
      header: <Toggle_Template header={ pkg.header } />,
      body: (
        <div id={ `${under_escape(pkg.header)}-api` } className="row collapse px-2">
          { bodyPkg }
          { bodyEnum }
          { bodyClass }
          { bodyFunction }
        </div>
      )
    };

    return <Card_Template key={ i } { ...tmpPkg } />;
  }

  render() {
    const { canonical, title } = this.meta;
    const api = Object.keys(JADN_API).map((pkg, i) => {
      const data = JADN_API[pkg];
			data.header = pkg;
      return this.pkg_format(data, i);
    });

    return (
      <div className='row mx-auto'>
        <Helmet>
          <title>{ title }</title>
          <link rel="canonical" href={ canonical } />
        </Helmet>
        <div className="row">
          <div className="col-12">
            <h1 className="text-center">JADN</h1>
            <p>
              JSON Abstract Data Notation (JADN) is a language-neutral, platform-neutral, and format-neutral mechanism for serializing structured data. See
              &nbsp;
              <a href="docs/jadn-overview.md">docs</a>
              for information about the JADN language.
            </p>
          </div>
          <div className="col-12">
            <h3>Python API</h3>
            <p>
              The JADN Python API (
              <a href="jadn">libs</a>
              ) is for v1.0
            </p>
          </div>
        </div>
        <div id="api" className="row p-3">
          { api }
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Converter);
