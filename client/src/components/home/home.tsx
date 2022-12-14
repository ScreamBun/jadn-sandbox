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
          <h5>Features</h5>

          <div className='row'>
            <div className='col-md-3'>
              <ul className="list-group my-2">
                <Link className="list-group-item list-group-item-action active" to={ NAV_VALIDATE }>JADN validation of messages in</Link>
                <li className="list-group-item">JSON</li>
                <li className="list-group-item">CBOR</li>
                <li className="list-group-item">XML</li>
              </ul>
            </div>
            <div className='col-md-3'>
              <ul className="list-group my-2">
                <Link className="list-group-item list-group-item-action active" to={ NAV_CONVERT }>JADN Schema conversion to</Link>
                <li className="list-group-item">GraphViz</li>
                <li className="list-group-item">HTML</li>
                <li className="list-group-item">JADN</li>
                <li className="list-group-item">JIDL</li>
                <li className="list-group-item">MarkDown</li>
                <li className="list-group-item">XML</li>
              </ul>
            </div>
            <div className='col-md-3'>
              <ul className="list-group my-2">
                <Link className="list-group-item list-group-item-action active" to={ NAV_GENERATE_MESSAGE }>Generate OpenC2 Messages</Link>
                <Link className="list-group-item list-group-item-action active" to={ NAV_GENERATE_SCHEMA }>Generate OpenC2 Schemas (Profiles)</Link>
              </ul>
            </div>
            <div className='col-md-3'>
              <ul className="list-group my-2">
                <li className="list-group-item list-group-item-warning">Coming Soon!</li>
                <li className="list-group-item">More testing tools</li>
                <li className="list-group-item">Docs</li>
                <li className="list-group-item">APIs</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    );
  };

export default Home;