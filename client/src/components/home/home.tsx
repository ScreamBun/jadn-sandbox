import { faCoffee, faCubes, faCubesStacked, faMicroscope, faShuffle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    NAV_EXTERNAL_OPENC2_JADN, NAV_VALIDATE, NAV_CONVERT, NAV_GENERATE_MESSAGE, NAV_GENERATE_SCHEMA
} from 'components/utils/constants';
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
      <div className='card'>
        <div className='card-header p-2'>
          <h4 className='m-0'>Home</h4>
        </div>
        <div className='card-body p-2'>
          <p>
            OpenC2 is defined using JSON Abstract Schema Notation (JADN).
            The JADN validator can check messages against any schema.
          </p>
          <p>
            Source is available from the
            &nbsp;
            <a href={ NAV_EXTERNAL_OPENC2_JADN } target='_blank' rel='noreferrer'>OpenC2 JADN Github</a>
            &nbsp;
            repo.
          </p>
          <hr />
          <div className='row'>
          <div className='col-md-3'>
              <div className='card pb-2'>
                <div className='card-header text-center'>
                  <h4 className='m-0'><FontAwesomeIcon className='fa-2xl' icon={ faCubes} /></h4>
                </div>
                <div className='card-body p-0'>
                  <ul className="list-group">
                    <Link className="list-group-item list-group-item-action active font-weight-bold" to={ NAV_GENERATE_SCHEMA }>Generate</Link>
                    <Link className="list-group-item" to={ NAV_GENERATE_MESSAGE }>Messages</Link>
                    <Link className="list-group-item" to={ NAV_GENERATE_SCHEMA }>Schemas (Profiles)</Link>
                  </ul>
                </div>           
              </div>
            </div>            
            <div className='col-md-3'>
              <div className='card pb-2'>
                <div className='card-header text-center'>
                  <h4 className='m-0'><FontAwesomeIcon className='fa-2xl' icon={ faShuffle } /></h4>
                </div>
                <div className='card-body p-0'>
                  <ul className="list-group">
                    <Link className="list-group-item list-group-item-action active font-weight-bold" to={ NAV_CONVERT }>Convert</Link>
                    <li className="list-group-item">GraphViz</li>
                    <li className="list-group-item">HTML</li>
                    <li className="list-group-item">JADN</li>
                    <li className="list-group-item">JIDL</li>
                    <li className="list-group-item">MarkDown</li>
                    <li className="list-group-item">XML</li>
                  </ul>
                </div>           
              </div>
            </div>
            <div className='col-md-3'>
              <div className='card pb-2'>
                <div className='card-header text-center'>
                  <h4 className='m-0'><FontAwesomeIcon className='fa-2xl' icon={ faMicroscope } /></h4>
                </div>
                <div className='card-body p-0'>
                  <ul className="list-group">
                    <Link className="list-group-item list-group-item-action active font-weight-bold" to={ NAV_VALIDATE }>Validate</Link>
                    <li className="list-group-item">JSON</li>
                    <li className="list-group-item">CBOR</li>
                    <li className="list-group-item">XML</li>
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