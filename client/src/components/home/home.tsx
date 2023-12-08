import { faCode, faCodeBranch, faEnvelopeCircleCheck, faEye, faFileCirclePlus, faPencilRuler } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  NAV_VALIDATE_MESSAGE, NAV_CONVERT_SCHEMA, NAV_CREATE_MESSAGE, NAV_CREATE_SCHEMA, NAV_GENERATE, NAV_TRANSFORM, NAV_TRANSLATE
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
        <div className='card-header bg-secondary'>
          <h5 className='m-0 title-text'>Home</h5>
        </div>
        <div className='card-body'>
          <div className='card-group'>
            <div className="card">
              <div className="card-img-top text-center py-2 bg-primary">
                <FontAwesomeIcon title='Schema and Data Creation' className='fa-2x text-white' icon={faPencilRuler} />
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <Link className="card-link" to={NAV_CREATE_SCHEMA}>Creation</Link>
                </h5>
                <p className="card-text">Create and edit JADN schemas using forms, view JADN schemas in JSON format.</p>
                <p className="card-text"> Create schema compliant data instances (documents, messages).</p>
                <br /><br /><br />
              </div>
              <div className="card-footer bg-secondary">
                <Link className="card-link" to={NAV_CREATE_SCHEMA}>Schemas</Link>
                <Link className="card-link" to={NAV_CREATE_MESSAGE}>Data Instances</Link>
              </div>
            </div>
            <div className="card">
              <div className="card-img-top text-center py-2 bg-primary">
                <FontAwesomeIcon title='Schema Visualization' className='fa-2x text-white' icon={faEye} />
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <Link className="card-link" to={NAV_CONVERT_SCHEMA}>Schema Visualization</Link>
                </h5>
                <p className="card-text">Convert a JADN Schema into different visual representations. </p>
              </div>
              <div className="card-footer bg-secondary">
                <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={"gv"}>GraphViz</Link>
                <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={"html"}>HTML</Link>
                <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={"jidl"}>JIDL</Link>
                <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={"md"}>MarkDown</Link>
                <Link className="card-link" to={NAV_CONVERT_SCHEMA} state={"puml"}>PlantUML</Link>
              </div>
            </div>
            <div className="card">
              <div className="card-img-top text-center py-2 bg-primary">
                <FontAwesomeIcon title='Schema Translation' className='fa-2x text-white' icon={faCode} />
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <Link className="card-link" to={NAV_TRANSLATE}>Schema Translation</Link>
                </h5>
                <p className="card-text">Translate a JADN Schema to another Schema format.</p>
                <p className="card-text">Translate a JSON Schema to a JADN Schema.</p>
              </div>
              <div className="card-footer bg-secondary">
                <Link className="card-link" to={NAV_TRANSLATE} state={"json"}>JSON</Link>
                <Link className="card-link" to={NAV_TRANSLATE} state={"rng"}>Relax (XML)</Link>
                <Link className="card-link" to={NAV_TRANSLATE} state={"xsd"}>XSD</Link>
              </div>
            </div>
          </div>
          <div className='card-group'>
            <div className="card mt-3">
              <div className="card-img-top text-center py-2 bg-primary">
                <FontAwesomeIcon title='Validation' className='fa-2x text-white' icon={faEnvelopeCircleCheck} />
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <Link className="card-link" to={NAV_VALIDATE_MESSAGE}>Data Validation</Link>
                </h5>
                <p className="card-text">Validate data instances in various data language formats against a JADN Schema.</p>
              </div>
              <div className="card-footer bg-secondary">
                <Link className="card-link" to={NAV_VALIDATE_MESSAGE} state={"cbor"}>CBOR</Link>
                <Link className="card-link" to={NAV_VALIDATE_MESSAGE} state={"json"}>JSON</Link>
                <Link className="card-link" to={NAV_VALIDATE_MESSAGE} state={"xml"}>Relax (XML)</Link>
              </div>
            </div>
            <div className="card mt-3">
              <div className="card-img-top text-center py-2 bg-primary">
                <FontAwesomeIcon title='Schema Transformation' className='fa-2x text-white' icon={faCodeBranch} />
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <Link className="card-link" to={NAV_TRANSFORM}>Schema Transformation</Link>
                </h5>
                <p className="card-text">Convert one or more JADN Schemas into a different but related Schema (resolve references,
                  simplify by removing extensions, strip comments, etc).</p>
                <br /><br /><br /><br />
              </div>
            </div>
            <div className="card mt-3">
              <div className="card-img-top text-center py-2 bg-primary">
                <FontAwesomeIcon title='Example Data Generation' className='fa-2x text-white' icon={faFileCirclePlus} />
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <Link className="card-link" to={NAV_GENERATE}>Example Data Generation</Link>
                </h5>
                <p className="card-text">Generate various example data instances based off of a Schema.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;