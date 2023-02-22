import { faCheckCircle, faCheckDouble, faCircle, faCircleStop, faCode, faCodeBranch, faCodeCompare, faCommentAlt, faCommentSms, faCubes, faEnvelopeCircleCheck, faFileCirclePlus, faInfoCircle, faLanguage, faMessage, faMicroscope, faPalette, faPencilRuler, faShuffle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  NAV_EXTERNAL_OPENC2_JADN_SRC, NAV_VALIDATE_MESSAGE, NAV_CONVERT_SCHEMA, NAV_GENERATE_MESSAGE, NAV_GENERATE_SCHEMA, NAV_EXTERNAL_OPENC2_JADN_SPEC, NAV_EXTERNAL_OPENC2, NAV_EXTERNAL_OASIS_OPEN, NAV_EXTERNAL_OPENC2_JADN_PYPI, NAV_HOME
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
          <p className='mt-2'>
            The <b> JADN Sandbox </b> provides the ability to generate, convert, and validate OpenC2 compliant schemas and messages.
          </p>
          <p>
            <b> JSON Abstract Data Notation (JADN) </b> is an information modeling language.  It has several
            purposes including defining data structures, validating data instances, informing user
            interfaces working with structured data, and facilitating protocol internationalization.
            JADN specifications consist of two parts:
          </p>
          <ul>
            <li>abstract type definitions that are independent
              of data format, and </li>
            <li> serialization rules that define how to represent type instances using
              specific data formats. </li>
          </ul>
          <p>
            A <b> JADN schema </b> itself is a structured information object that can be
            serialized and transferred between applications, documented in multiple formats such as text-based
            interface definition languages, property tables or diagrams, and translated into concrete
            schemas used to validate specific data formats.
          </p>
          <hr />
          <div className="row">
            <div className='col-md'>
              <div className="card">
                <div className="card-img-top text-center py-3 bg-primary">
                  <FontAwesomeIcon className='fa-3x' icon={faPencilRuler} />                  
                </div>
                <div className="card-body" style={{height: '9em'}}>
                  <h5 className="card-title">Creation</h5>
                  <p className="card-text">Create an OpenC2 compliant schema or message using the Editor or based on pre-generated examples.</p>
                </div>
                <div className="card-body">
                  <Link className="card-link" to={NAV_GENERATE_SCHEMA}>Schemas</Link>
                  <Link className="card-link" to={NAV_GENERATE_MESSAGE}>Messages</Link>
                </div>                
              </div>
            </div>
            <div className='col-md'>
              <div className="card">
                <div className="card-img-top text-center py-3 bg-primary">
                  <FontAwesomeIcon className='fa-3x' icon={faShuffle} />                  
                </div>
                <div className="card-body" style={{height: '9em'}}>
                  <h5 className="card-title">Convert</h5>
                  <p className="card-text">Convert a JADN Schema between JADN formats (jadn, md, jidl, html, dot, plantuml, etc).  Input=JADN Schema, Output= the same JADN Schema in a different representation.</p>
                </div>
                <div className="card-body">
                  <Link className="card-link" to={NAV_CONVERT_SCHEMA}>GraphViz</Link>
                  <Link className="card-link" to={NAV_CONVERT_SCHEMA}>HTML</Link>
                  <Link className="card-link" to={NAV_CONVERT_SCHEMA}>JIDL</Link>
                  <Link className="card-link" to={NAV_CONVERT_SCHEMA}>MarkDown</Link>
                </div>                  
              </div>
            </div>
            <div className='col-md'>
              <div className="card">
                <div className="card-img-top text-center py-3 bg-primary">
                  <FontAwesomeIcon className='fa-3x' icon={faCode} />                  
                </div>
                <div className="card-body" style={{height: '9em'}}>
                  <h5 className="card-title">Translate</h5>
                  <p className="card-text">Convert a JADN Schema to a schema for other data formats. Input=JADN Schema, Output=JSON Schema, XSD, etc.</p>
                </div>
                <div className="card-body">
                  <Link className="card-link" to={NAV_CONVERT_SCHEMA}>JSON</Link>
                  <Link className="card-link" to={NAV_CONVERT_SCHEMA}>Relax (XML)</Link>
                  <Link className="card-link" to={NAV_CONVERT_SCHEMA}>XSD (Coming Soon)</Link>
                </div>                 
              </div>
            </div>                          
          </div>
          <div className="row">
            <div className='col-md'>
              <div className="card">
                <div className="card-img-top text-center py-3 bg-primary">
                  <FontAwesomeIcon className='fa-3x' icon={faEnvelopeCircleCheck} /> 
                </div>
                <div className="card-body" style={{height: '9em'}}>
                  <h5 className="card-title">Codec</h5>
                  <p className="card-text">Validate data (messages) against a JADN Schema and convert them from one data format to another.</p>
                </div>
                <div className="card-body">
                  <Link className="card-link" to={NAV_VALIDATE_MESSAGE} state={{ formatType: "cbor" }}>CBOR</Link>
                  <Link className="card-link" to={NAV_VALIDATE_MESSAGE} state={{ formatType: "json" }}>JSON</Link>
                  <Link className="card-link" to={NAV_VALIDATE_MESSAGE} state={{ formatType: "xml" }}>Relax (XML)</Link>                  
                </div>                 
              </div>
            </div> 
            <div className='col-md'>
              <div className="card">
                <div className="card-img-top text-center py-3 bg-primary">
                  <FontAwesomeIcon className='fa-3x' icon={faCodeBranch} />                  
                </div>
                <div className="card-body" style={{height: '9em'}}>
                  <h5 className="card-title">Transform</h5>
                  <p className="card-text">Convert one or more JADN Schemas into a different but related Schema. Resolve references, simplify by removing extensions, strip comments, etc.</p>
                </div>
                <div className="card-body">
                  <Link className="card-link" to={NAV_HOME}>Coming Soon</Link>         
                </div>                 
              </div>
            </div>
            <div className='col-md'>
              <div className="card">
                <div className="card-img-top text-center py-3 bg-primary">
                  <FontAwesomeIcon className='fa-3x' icon={faFileCirclePlus} />                  
                </div>
                <div className="card-body" style={{height: '9em'}}>
                  <h5 className="card-title">Generate</h5>
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