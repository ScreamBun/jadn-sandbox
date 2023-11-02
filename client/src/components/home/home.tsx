import { faCode, faCodeBranch, faEnvelopeCircleCheck, faEye, faFileCirclePlus, faPencilRuler } from '@fortawesome/free-solid-svg-icons';
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
import { dismissAllToast } from 'components/common/SBToast';

const Home = () => {
  const dispatch = useDispatch();

  const meta_title = useSelector(getPageTitle) + ' | Home ';
  const meta_canonical = `${window.location.origin}${window.location.pathname}`;
  useEffect(() => {
    dismissAllToast();
    dispatch(info());
  }, [meta_title])

  return (
    <div>
      <Helmet>
        <title>{meta_title}</title>
        <link rel="canonical" href={meta_canonical} />
      </Helmet>
      <div className='card'>
        <div className='card-header bg-primary text-light'>
          <h5 className='m-0'>Home</h5>
        </div>
        <div className='card-body'>
          <div className='card-group'>
            <div className="card">
              <div className="card-img-top text-center py-2 bg-primary">
                <FontAwesomeIcon className='fa-2x text-white' icon={faPencilRuler} />
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <Link className="card-link" to={NAV_CREATE_SCHEMA}>Creation</Link>
                </h5>
                <p className="card-text">Create an OpenC2 compliant Schema or Message using the Editor or based on pre-existing examples.</p>
              </div>
              <div className="card-footer">
                <Link className="card-link" to={NAV_CREATE_SCHEMA}>Schemas</Link>
                <Link className="card-link" to={NAV_CREATE_MESSAGE}>Messages</Link>
              </div>
            </div>
            <div className="card">
              <div className="card-img-top text-center py-2 bg-primary">
                <FontAwesomeIcon className='fa-2x text-white' icon={faEye} />
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <Link className="card-link" to={NAV_CONVERT_SCHEMA} >Schema Visualization</Link>
                </h5>
                <p className="card-text">Convert a JADN Schema into different visualization formats. </p>
                <div className="card-text">
                  <div className="card-text">
                    Input: JADN Schema
                    <p>Output: The same JADN Schema in a different visual representation</p>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={"gv"}>GraphViz</Link>
                <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={"html"}>HTML</Link>
                <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={"jidl"}>JIDL</Link>
                <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={"md"}>MarkDown</Link>
                <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={"puml"}>PlantUML</Link>
              </div>
            </div>
            <div className="card">
              <div className="card-img-top text-center py-2 bg-primary">
                <FontAwesomeIcon className='fa-2x text-white' icon={faCode} />
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <Link className="card-link" to={NAV_TRANSLATE} >Schema Translation</Link>
                </h5>
                <p className="card-text">Translate a Schema and its data from JADN to another Schema or data format.</p>
              </div>
              <div className="card-footer">
                <Link className="card-link" to={NAV_TRANSLATE} state={"json"}>JSON</Link>
                <Link className="card-link" to={NAV_TRANSLATE} state={"rng"}>Relax (XML)</Link>
                <Link className="card-link" to={NAV_TRANSLATE} >XSD (Coming Soon)</Link>
              </div>
            </div>
          </div>
          <div className='card-group'>
            <div className="card mt-3">
              <div className="card-img-top text-center py-2 bg-primary">
                <FontAwesomeIcon className='fa-2x text-white' icon={faEnvelopeCircleCheck} />
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <Link className="card-link" to={NAV_VALIDATE_MESSAGE} >Message Validation</Link>
                </h5>
                <p className="card-text">Validate data (messages) against a JADN Schema and convert them from one data format to another.</p>
              </div>
              <div className="card-footer">
                <Link className="card-link" to={NAV_VALIDATE_MESSAGE} state={"cbor"}>CBOR</Link>
                <Link className="card-link" to={NAV_VALIDATE_MESSAGE} state={"json"}>JSON</Link>
                <Link className="card-link" to={NAV_VALIDATE_MESSAGE} state={"xml"}>Relax (XML)</Link>
              </div>
            </div>
            <div className="card mt-3">
              <div className="card-img-top text-center py-2 bg-primary">
                <FontAwesomeIcon className='fa-2x text-white' icon={faCodeBranch} />
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <Link className="card-link" to={NAV_TRANSFORM}>Schema Transformation</Link>
                </h5>
                <p className="card-text">Convert one or more JADN Schemas into a different but related Schema (resolve references,
                  simplify by removing extensions, strip comments, etc).</p>
                <br />
              </div>
              {/* <div className="card-footer">
                <Link className="card-link" to={NAV_HOME}>Coming Soon</Link>
              </div> */}
            </div>
            <div className="card mt-3">
              <div className="card-img-top text-center py-2 bg-primary">
                <FontAwesomeIcon className='fa-2x text-white' icon={faFileCirclePlus} />
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <Link className="card-link" to={NAV_GENERATE}>Example Message Generation</Link>
                </h5>
                <p className="card-text">Generate various example messages based off of a Schema.</p>
              </div>
              {/* <div className="card-footer">
                <Link className="card-link" to={NAV_HOME}>Coming Soon</Link>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;