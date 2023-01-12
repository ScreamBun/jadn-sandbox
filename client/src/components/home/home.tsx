import { faCubes, faInfoCircle, faMicroscope, faShuffle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  NAV_EXTERNAL_OPENC2_JADN_SRC, NAV_VALIDATE, NAV_CONVERT_SCHEMA, NAV_GENERATE_MESSAGE, NAV_GENERATE_SCHEMA, NAV_EXTERNAL_OPENC2_JADN_SPEC, NAV_EXTERNAL_OPENC2, NAV_EXTERNAL_OASIS_OPEN
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
          <p>
            JSON Abstract Data Notation (JADN) is an information modeling language.  It has several 
            purposes including defining data structures, validating data instances, informing user 
            interfaces working with structured data, and facilitating protocol internationalization. 
            JADN specifications consist of two parts: abstract type definitions that are independent 
            of data format, and serialization rules that define how to represent type instances using 
            specific data formats. A JADN schema is itself a structured information object that can be 
            serialized and transferred between applications, documented in multiple formats such as text-based 
            interface definition languages, property tables or diagrams, and translated into concrete 
            schemas used to validate specific data formats.            
          </p>
          <p>
            The JADN Sandbox provides the ability generate or build OpenC2 compliant schemas and messages.  In addtion, the 
            JADN Sandbox provides the capability to convert schemas to different file formats, as well as,
            provide schema and message validation.
          </p>
          <hr />
          <div className='row'>
            <div className='col-md-3'>

              <div className="card">
                <div className="card-body text-center bg-primary p-2">
                  <p className="card-text"><FontAwesomeIcon className='fa-3x' icon={faCubes} /></p>
                  <h5 className="card-title m-0">Generation</h5>
                </div>
                <ul className="list-group list-group-flush">
                  <Link className="list-group-item" to={NAV_GENERATE_MESSAGE}>Messages</Link>
                  <Link className="list-group-item" to={NAV_GENERATE_SCHEMA}>Schemas</Link>
                </ul>
              </div>

            </div>
            <div className='col-md-3'>

              <div className="card">
                <div className="card-body text-center bg-primary p-2">
                  <p className="card-text"><FontAwesomeIcon className='fa-3x' icon={faShuffle} /></p>
                  <h5 className="card-title m-0">Conversion</h5>
                </div>
                <ul className="list-group list-group-flush">
                    <Link className="list-group-item" to={NAV_CONVERT_SCHEMA}>GraphViz</Link>
                    <Link className="list-group-item" to={NAV_CONVERT_SCHEMA}>HTML</Link>
                    <Link className="list-group-item" to={NAV_CONVERT_SCHEMA}>JADN</Link>
                    <Link className="list-group-item" to={NAV_CONVERT_SCHEMA}>JIDL</Link>
                    <Link className="list-group-item" to={NAV_CONVERT_SCHEMA}>MarkDown</Link>
                    <Link className="list-group-item" to={NAV_CONVERT_SCHEMA}>Relax (XML)</Link>
                </ul>
              </div>

            </div>
            <div className='col-md-3'>

              <div className="card">
                <div className="card-body text-center bg-primary p-2">
                  <p className="card-text"><FontAwesomeIcon className='fa-3x' icon={faShuffle} /></p>
                  <h5 className="card-title m-0">Validation</h5>
                </div>
                <ul className="list-group list-group-flush">
                    <Link className="list-group-item" to={NAV_VALIDATE}>CBOR</Link>
                    <Link className="list-group-item" to={NAV_VALIDATE}>JSON</Link>
                    <Link className="list-group-item" to={NAV_VALIDATE}>Relax (XML)</Link>
                </ul>
              </div>

            </div>
            <div className='col-md-3'>

              <div className="card">
                <div className="card-body text-center bg-primary p-2">
                  <p className="card-text"><FontAwesomeIcon className='fa-3x' icon={faInfoCircle} /></p>
                  <h5 className="card-title m-0">Information</h5>
                </div>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2} target='_blank' rel='noreferrer'>OpenC2</a></li>
                    <li className="list-group-item"><a href={NAV_EXTERNAL_OASIS_OPEN} target='_blank' rel='noreferrer'>OASIS Open</a></li>
                    <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2_JADN_SPEC} target='_blank' rel='noreferrer'>JADN Specification Doc</a></li>
                    <li className="list-group-item"><a href={NAV_EXTERNAL_OPENC2_JADN_SRC} target='_blank' rel='noreferrer'>JADN Sandbox Source Code</a></li>
                </ul>
              </div>

            </div>            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;