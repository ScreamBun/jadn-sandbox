import React from 'react';

import JADN_API, { Package } from './jadn_api';
import {
  CardTemplate, ClassTemplate, EnumTemplate, FunctionTemplate, underEscape
} from './templates';
import { useAppSelector } from '../../reducers';

// Interfaces
// eslint-disable-next-line @typescript-eslint/no-empty-interface

// Component
const Docs = () => {
  const pkgFormat = (pkg: Package, name: string) => {
    const tmpPkg = {
      ...pkg,
      body: (
        <div id={`${underEscape(pkg.title)}-api`}>
          {pkg.body.package && Object.keys(pkg.body.package).map(n => pkgFormat(pkg.body.package[n], n))}
          {pkg.body.enum && <EnumTemplate enums={pkg.body.enum} />}
          {pkg.body.class && <ClassTemplate cls={pkg.body.class} />}
          {pkg.body.function && <FunctionTemplate fun={pkg.body.function} />}
        </div>
      )
    };
    return <CardTemplate key={name} header={name} {...tmpPkg} />;
  };

  const siteTitle = useAppSelector((state => state.Util.site_title));
  const api = Object.keys(JADN_API).map((pkg, i) => pkgFormat(JADN_API[pkg], pkg, i));
  return (
    <div className='row mx-auto'>
      <title>{`${siteTitle} | API Docs`}</title>
      <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
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
      <div id="api" className="col-12 p-3">
        {api}
      </div>
    </div>
  );
};

export default Docs;
