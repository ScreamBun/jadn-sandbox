import { faCode, faCodeBranch, faEnvelopeCircleCheck, faFileCirclePlus, faPencilRuler, faShuffle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  NAV_VALIDATE_MESSAGE, NAV_CONVERT_SCHEMA, NAV_CREATE_MESSAGE, NAV_CREATE_SCHEMA, NAV_HOME, NAV_GENERATE, NAV_TRANSFORM, NAV_TRANSLATE
} from 'components/utils/constants';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getPageTitle } from 'reducers/util';
import { info } from 'actions/util';

const Home = () => {
  const dispatch = useDispatch();

  const meta_title = useSelector(getPageTitle) + ' | Home ';
  const meta_canonical = `${window.location.origin}${window.location.pathname}`;
  useEffect(() => {
    dispatch(info());
  }, [meta_title])

  return (
    <div>
      <Helmet>
        <title>{meta_title}</title>
        <link rel="canonical" href={meta_canonical} />
      </Helmet>
      <div className='card'>
        <div className='card-header p-2'>
          <h5 className='m-0'>Home</h5>
        </div>
        <div className='card-body p-2'>
          <div className="row">
            <div className='col-md'>
              <div className="card">
                <div className="card-img-top text-center py-2 bg-primary">
                  <FontAwesomeIcon className='fa-2x text-white' icon={faPencilRuler} />                  
                </div>
                <div className="card-body" style={{ height: '9em' }}>
                  <h5 className="card-title">
                    <Link className="card-link" to={NAV_CREATE_SCHEMA}>Creation</Link>
                  </h5>
                  <p className="card-text">Create an OpenC2 compliant Schema or Message using the Editor or based on pre-existing examples.</p>
                </div>
                <div className="card-body">
                  <Link className="card-link" to={NAV_CREATE_SCHEMA}>Schemas</Link>
                  <Link className="card-link" to={NAV_CREATE_MESSAGE}>Messages</Link>
                </div>
              </div>
            </div>
            <div className='col-md'>
              <div className="card">
                <div className="card-img-top text-center py-2 bg-primary">
                  <FontAwesomeIcon className='fa-2x text-white' icon={faShuffle} />                  
                </div>
                <div className="card-body" style={{ height: '9em' }}>
                  <h5 className="card-title">
                    <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={{ navConvertTo: "" }}>Schema Conversion</Link>
                  </h5>
                  <p className="card-text">Convert a JADN Schema between JADN formats (jadn, md, jidl, html, dot, plantuml, etc).  Input=JADN Schema, Output= the same JADN Schema in a different representation.</p>
                </div>
                <div className="card-body">
                  <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={{ navConvertTo: "gv" }}>GraphViz</Link>
                  <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={{ navConvertTo: "html" }}>HTML</Link>
                  <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={{ navConvertTo: "jidl" }}>JIDL</Link>
                  <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={{ navConvertTo: "md" }}>MarkDown</Link>
                </div>
              </div>
            </div>
            <div className='col-md'>
              <div className="card">
                <div className="card-img-top text-center py-2 bg-primary">
                  <FontAwesomeIcon className='fa-2x text-white' icon={faCode} />                  
                </div>
                <div className="card-body" style={{ height: '9em' }}>
                  <h5 className="card-title">
                    <Link className="card-link" to={NAV_TRANSLATE} state={{ navConvertTo: "" }}>Schema Translation</Link>
                  </h5>
                  <p className="card-text">Translate a Schema and its data from JADN to another Schema or Data format.</p>
                </div>
                <div className="card-body">
                  <Link className="card-link" to={NAV_TRANSLATE} state={{ navConvertTo: "json" }}>JSON</Link>
                  <Link className="card-link" to={NAV_TRANSLATE} state={{ navConvertTo: "rng" }}>Relax (XML)</Link>
                  <Link className="card-link" to={NAV_TRANSLATE} state={{ navConvertTo: "" }}>XSD (Coming Soon)</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className='col-md'>
              <div className="card mt-2">
                <div className="card-img-top text-center py-2 bg-primary">
                  <FontAwesomeIcon className='fa-2x text-white' icon={faEnvelopeCircleCheck} /> 
                </div>
                <div className="card-body" style={{height: '10em'}}>
                  <h5 className="card-title">
                    <Link className="card-link" to={NAV_VALIDATE_MESSAGE} state={{ navMsgFormat: "" }}>Message Validation</Link>
                  </h5>
                  <p className="card-text">Validate data (messages) against a JADN Schema and convert them from one data format to another.</p>
                </div>
                <div className="card-body">
                  <Link className="card-link" to={NAV_VALIDATE_MESSAGE} state={{ navMsgFormat: "cbor" }}>CBOR</Link>
                  <Link className="card-link" to={NAV_VALIDATE_MESSAGE} state={{ navMsgFormat: "json" }}>JSON</Link>
                  <Link className="card-link" to={NAV_VALIDATE_MESSAGE} state={{ navMsgFormat: "xml" }}>Relax (XML)</Link>
                </div>
              </div>
            </div> 
            <div className='col-md px-0'>
              <div className="card mt-2">
                <div className="card-img-top text-center py-2 bg-primary">
                  <FontAwesomeIcon className='fa-2x text-white' icon={faCodeBranch} />                  
                </div>
                <div className="card-body" style={{height: '10em'}}>
                  <h5 className="card-title">
                    <Link className="card-link" to={NAV_TRANSFORM}>Transformation</Link>
                  </h5>
                  <p className="card-text">Convert one or more JADN Schemas into a different but related Schema. Resolve references, simplify by removing extensions, strip comments, etc.</p>
                </div>
                <div className="card-body">
                  <Link className="card-link" to={NAV_HOME}>Coming Soon</Link>
                </div>
              </div>
            </div>
            <div className='col-md'>
              <div className="card mt-2">
                <div className="card-img-top text-center py-2 bg-primary">
                  <FontAwesomeIcon className='fa-2x text-white' icon={faFileCirclePlus} />                  
                </div>
                <div className="card-body" style={{height: '10em'}}>
                  <h5 className="card-title">
                    <Link className="card-link" to={NAV_GENERATE}>Example Message Generation</Link>
                  </h5>
                  <p className="card-text">Example message generation based off of a schema.</p>
                </div>
                <div className="card-body">
                  <Link className="card-link" to={NAV_HOME}>Coming Soon</Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;